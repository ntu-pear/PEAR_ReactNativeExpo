import React, { useContext, useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AuthContext from 'app/auth/context';
import guardianApi from 'app/api/guardian';
import AppButton from 'app/components/AppButton';
import AppText from 'app/components/AppText';
import InputField from 'app/components/input-components/InputField';
import requestDeadline from 'app/utility/requestDeadline';
import { createPrimaryGuardianWriter } from 'app/utility/guardianPrimaryWrite';
import {
  buildGuardianUpdate,
  canEditGuardian,
  canSelectPrimaryGuardian,
  guardianRecords,
} from 'app/utility/guardianEditing';

function EditPatientGuardianScreen({ route }) {
  const { guardianProfile, patientID } = route.params;
  const guardianId = guardianProfile.guardianID;
  const { user } = useContext(AuthContext) || {};
  const navigation = useNavigation();
  const mounted = useRef(true);
  const busy = useRef(null);
  const loadGeneration = useRef(0);
  const [loading, setLoading] = useState(false);
  const [guardian, setGuardian] = useState(null);
  const [allocation, setAllocation] = useState(null);
  const [edits, setEdits] = useState({});
  const [error, setError] = useState('');
  const [uncertain, setUncertain] = useState(false);
  const [primaryPending, setPrimaryPending] = useState(false);
  const [displaySession, setDisplaySession] = useState(null);
  const session = useRef({ patientID, guardianId, user });
  if (
    session.current.patientID !== patientID ||
    session.current.guardianId !== guardianId ||
    session.current.user !== user
  ) {
    session.current = { patientID, guardianId, user };
  }
  const sessionToken = session.current;
  const writer = useRef(null);
  if (!writer.current)
    writer.current = createPrimaryGuardianWriter({ api: guardianApi });
  const isCurrent = () => mounted.current && session.current === sessionToken;
  const displayedIdentityMatches = () =>
    isCurrent() &&
    displaySession === sessionToken &&
    String(guardian?.id) === String(guardianId);
  const readGuardians = async () =>
    guardianRecords(
      await requestDeadline(guardianApi.getPatientGuardian(patientID, false)),
      patientID,
    );
  const load = async () => {
    if (!canEditGuardian(user) || busy.current === sessionToken || !isCurrent())
      return;
    busy.current = sessionToken;
    const generation = ++loadGeneration.current;
    const loadCurrent = () =>
      isCurrent() && loadGeneration.current === generation;
    setLoading(true);
    setError('');
    setGuardian(null);
    setAllocation(null);
    setDisplaySession(null);
    setEdits({});
    try {
      const records = await readGuardians();
      const record = records.find(
        (item) => String(item.id) === String(guardianId),
      );
      if (!record)
        throw new Error('This guardian is no longer linked to this patient.');
      if (!loadCurrent()) return;
      setGuardian(record);
      setDisplaySession(sessionToken);
      setEdits({
        preferredName: record.preferredName || '',
        contactNo: record.contactNo || '',
        address: record.address || '',
        tempAddress: record.tempAddress || '',
        email: record.email || '',
        relationshipName: record.relationshipName || '',
      });
      if (canSelectPrimaryGuardian(user)) {
        const pending = await writer.current.reconcile({
          patientId: patientID,
          user,
          isCurrent: loadCurrent,
        });
        if (!loadCurrent()) return;
        if (pending.outcome === 'unknown') {
          setPrimaryPending(true);
          setUncertain(true);
          setError(
            'A previous primary guardian change is still unconfirmed. Check the primary outcome before making another change.',
          );
        }
        const response = await requestDeadline(
          guardianApi.getPatientAllocation(patientID),
        );
        if (loadCurrent())
          setAllocation(
            response?.ok &&
              String(response.data?.patientId) === String(patientID)
              ? response.data
              : null,
          );
      }
    } catch (failure) {
      if (loadCurrent())
        setError(
          failure.message ||
            'Unable to load guardian information. Check the VPN and retry.',
        );
    } finally {
      if (busy.current === sessionToken) busy.current = null;
      if (loadCurrent()) setLoading(false);
    }
  };
  useEffect(() => {
    mounted.current = true;
    setGuardian(null);
    setAllocation(null);
    setDisplaySession(null);
    setEdits({});
    setError('');
    setUncertain(false);
    setPrimaryPending(false);
    setLoading(false);
    load();
    return () => {
      mounted.current = false;
      loadGeneration.current += 1;
    };
    // A new route/account gets a distinct token, so old loads and dialog
    // callbacks remain stale even after the new effect becomes mounted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientID, guardianId, user]);
  const finish = (message) =>
    Alert.alert('Saved successfully', message, [
      {
        text: 'OK',
        onPress: () => {
          if (isCurrent()) navigation.goBack();
        },
      },
    ]);
  const save = async () => {
    if (
      busy.current === sessionToken ||
      uncertain ||
      !canEditGuardian(user) ||
      !displayedIdentityMatches()
    )
      return;
    busy.current = sessionToken;
    setLoading(true);
    setError('');
    let sent = false;
    try {
      const current = (await readGuardians()).find(
        (item) => String(item.id) === String(guardianId),
      );
      if (!displayedIdentityMatches()) return;
      const payload = buildGuardianUpdate({
        guardian: current,
        edits,
        patientId: patientID,
        user,
      });
      sent = true;
      const response = await requestDeadline(
        guardianApi.updateGuardian(payload, guardianId),
      );
      if (!isCurrent()) return;
      if (!response?.ok)
        throw new Error('The guardian update was not confirmed.');
      // Identity and relationship are committed separately by this API.
      const updated = (await readGuardians()).find(
        (item) => String(item.id) === String(guardianId),
      );
      if (!isCurrent()) return;
      if (
        !updated ||
        [
          'preferredName',
          'contactNo',
          'address',
          'tempAddress',
          'email',
          'relationshipName',
        ].some(
          (key) => String(updated[key] ?? '') !== String(payload[key] ?? ''),
        )
      )
        throw new Error(
          'The updated guardian fields and relationship could not be verified.',
        );
      if (isCurrent())
        finish('Guardian information and relationship have been verified.');
    } catch (failure) {
      if (isCurrent()) {
        setUncertain(sent);
        setError(
          sent
            ? 'The update outcome is not confirmed. It may have partially completed. Do not submit again; reopen the patient profile to check the guardian and relationship.'
            : failure.message,
        );
      }
    } finally {
      if (busy.current === sessionToken) busy.current = null;
      if (isCurrent()) setLoading(false);
    }
  };
  const handlePrimaryOutcome = (result) => {
    if (!isCurrent()) {
      return;
    }
    if (result.outcome === 'verified' || result.outcome === 'unchanged') {
      setAllocation(result.allocation);
      setPrimaryPending(false);
      setUncertain(false);
      finish('Both primary and secondary guardian slots have been verified.');
    } else if (result.outcome === 'unknown') {
      setPrimaryPending(true);
      setUncertain(true);
      setError(
        'The primary guardian outcome is unknown. Do not submit again. Use Check primary outcome for a read-only check; an unchanged read does not prove the request cannot finish later.',
      );
    } else {
      setError(
        result.message ||
          'The selection could not be sent. Reload the profile.',
      );
    }
  };
  const setPrimary = async () => {
    if (
      busy.current === sessionToken ||
      uncertain ||
      !canSelectPrimaryGuardian(user) ||
      !displayedIdentityMatches() ||
      String(allocation?.patientId) !== String(patientID)
    ) {
      return;
    }
    busy.current = sessionToken;
    setLoading(true);
    setError('');
    try {
      handlePrimaryOutcome(
        await writer.current.switchPrimary({
          patientId: patientID,
          guardianId,
          expectedAllocationId: allocation?.id,
          user,
          isCurrent,
        }),
      );
    } finally {
      if (busy.current === sessionToken) {
        busy.current = null;
      }
      if (isCurrent()) {
        setLoading(false);
      }
    }
  };
  const checkPrimary = async () => {
    if (
      busy.current === sessionToken ||
      !canSelectPrimaryGuardian(user) ||
      !isCurrent()
    ) {
      return;
    }
    busy.current = sessionToken;
    setLoading(true);
    try {
      handlePrimaryOutcome(
        await writer.current.reconcile({
          patientId: patientID,
          user,
          isCurrent,
        }),
      );
    } finally {
      if (busy.current === sessionToken) {
        busy.current = null;
      }
      if (isCurrent()) {
        setLoading(false);
      }
    }
  };
  if (!canEditGuardian(user)) {
    return (
      <AppText>
        Guardian editing is available to caregivers and supervisors.
      </AppText>
    );
  }
  const primary =
    allocation &&
    String(allocation.patientId) === String(patientID) &&
    String(allocation.guardianId) === String(guardianId);
  const shownGuardian = displayedIdentityMatches() ? guardian : null;
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ padding: 24 }}
    >
      {loading ? <AppText>Loading...</AppText> : null}
      {error ? <AppText testID="guardian-edit-error">{error}</AppText> : null}
      {primaryPending && displaySession === sessionToken ? (
        <AppButton
          title="Check primary outcome"
          color="green"
          testID="guardian-primary-check"
          isDisabled={loading}
          onPress={checkPrimary}
        />
      ) : null}
      {!shownGuardian && !loading ? (
        <AppButton title="Reload guardian" color="green" onPress={load} />
      ) : null}
      {shownGuardian ? (
        <View>
          <AppText>{`${shownGuardian.firstName} ${shownGuardian.lastName}`}</AppText>
          <AppText>{`Date of birth: ${String(
            shownGuardian.dateOfBirth || '',
          ).slice(0, 10)} | Gender: ${shownGuardian.gender || '-'}`}</AppText>
          <AppText>
            {primary
              ? 'Primary guardian'
              : allocation
              ? 'Secondary guardian'
              : 'Primary status unavailable'}
          </AppText>
          {[
            ['preferredName', 'Preferred name'],
            ['contactNo', 'Contact number'],
            ['address', 'Address'],
            ['tempAddress', 'Temporary address'],
            ['email', 'Email'],
            ['relationshipName', "Guardian is patient's"],
          ].map(([key, title]) => (
            <InputField
              key={key}
              testID={`guardian-edit-${key}`}
              title={title}
              value={edits[key]}
              autoCapitalize="none"
              onChangeText={(value) => {
                if (displayedIdentityMatches() && !loading && !uncertain) {
                  setEdits((previous) => ({ ...previous, [key]: value }));
                }
              }}
              otherProps={{ editable: !loading && !uncertain }}
            />
          ))}
          <AppText>
            Use the configured relationship name. The service validates the
            relationship when saving.
          </AppText>
          <AppButton
            title="Save guardian"
            color="green"
            onPress={save}
            isDisabled={
              loading ||
              uncertain ||
              !edits.contactNo?.trim() ||
              !edits.relationshipName?.trim()
            }
            testID="guardian-edit-save"
          />
          {canSelectPrimaryGuardian(user) && allocation && !primary ? (
            <AppButton
              title="Make primary guardian"
              color="green"
              isDisabled={loading || uncertain}
              testID="guardian-edit-primary"
              onPress={() => {
                if (!displayedIdentityMatches()) {
                  return;
                }
                Alert.alert(
                  'Change primary guardian',
                  `Make ${shownGuardian.firstName} ${shownGuardian.lastName} the primary guardian for this patient?`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Confirm', onPress: setPrimary },
                  ],
                );
              }}
            />
          ) : null}
          <AppButton
            title="Back to profile"
            color="grey"
            onPress={() => navigation.goBack()}
          />
        </View>
      ) : null}
    </ScrollView>
  );
}
export default EditPatientGuardianScreen;
