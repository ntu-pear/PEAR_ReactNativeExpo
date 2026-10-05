import React, { useContext, useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AuthContext from 'app/auth/context';
import guardianApi from 'app/api/guardian';
import AppButton from 'app/components/AppButton';
import AppText from 'app/components/AppText';
import InputField from 'app/components/input-components/InputField';
import requestDeadline from 'app/utility/requestDeadline';
import {
  buildGuardianUpdate,
  buildPrimaryGuardianUpdate,
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
  const busy = useRef(false);
  const [loading, setLoading] = useState(false);
  const [guardian, setGuardian] = useState(null);
  const [allocation, setAllocation] = useState(null);
  const [edits, setEdits] = useState({});
  const [error, setError] = useState('');
  const [uncertain, setUncertain] = useState(false);
  const readGuardians = async () =>
    guardianRecords(
      await requestDeadline(guardianApi.getPatientGuardian(patientID, false)),
      patientID,
    );
  const load = async () => {
    if (!canEditGuardian(user) || busy.current) return;
    busy.current = true;
    setLoading(true);
    setError('');
    try {
      const records = await readGuardians();
      const record = records.find(
        (item) => String(item.id) === String(guardianId),
      );
      if (!record)
        throw new Error('This guardian is no longer linked to this patient.');
      if (!mounted.current) return;
      setGuardian(record);
      setEdits({
        preferredName: record.preferredName || '',
        contactNo: record.contactNo || '',
        address: record.address || '',
        tempAddress: record.tempAddress || '',
        email: record.email || '',
        relationshipName: record.relationshipName || '',
      });
      if (canSelectPrimaryGuardian(user)) {
        const response = await requestDeadline(
          guardianApi.getPatientAllocation(patientID),
        );
        if (mounted.current)
          setAllocation(
            response?.ok &&
              String(response.data?.patientId) === String(patientID)
              ? response.data
              : null,
          );
      }
    } catch (failure) {
      if (mounted.current)
        setError(
          failure.message ||
            'Unable to load guardian information. Check the VPN and retry.',
        );
    } finally {
      busy.current = false;
      if (mounted.current) setLoading(false);
    }
  };
  useEffect(() => {
    mounted.current = true;
    load();
    return () => {
      mounted.current = false;
    };
    // Route and account are fixed for this editing session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientID, guardianId, user]);
  const finish = (message) =>
    Alert.alert('Saved successfully', message, [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  const save = async () => {
    if (busy.current || uncertain || !canEditGuardian(user)) return;
    busy.current = true;
    setLoading(true);
    setError('');
    let sent = false;
    try {
      const current = (await readGuardians()).find(
        (item) => String(item.id) === String(guardianId),
      );
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
      if (!mounted.current) return;
      if (!response?.ok)
        throw new Error('The guardian update was not confirmed.');
      // Identity and relationship are committed separately by this API.
      const updated = (await readGuardians()).find(
        (item) => String(item.id) === String(guardianId),
      );
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
      if (mounted.current)
        finish('Guardian information and relationship have been verified.');
    } catch (failure) {
      if (mounted.current) {
        setUncertain(sent);
        setError(
          sent
            ? 'The update outcome is not confirmed. It may have partially completed. Do not submit again; reopen the patient profile to check the guardian and relationship.'
            : failure.message,
        );
      }
    } finally {
      busy.current = false;
      if (mounted.current) setLoading(false);
    }
  };
  const setPrimary = async () => {
    if (busy.current || uncertain || !canSelectPrimaryGuardian(user)) return;
    busy.current = true;
    setLoading(true);
    setError('');
    let sent = false;
    try {
      const records = await readGuardians();
      const response = await requestDeadline(
        guardianApi.getPatientAllocation(patientID),
      );
      if (!response?.ok)
        throw new Error('The current allocation is unavailable.');
      const payload = buildPrimaryGuardianUpdate({
        allocation: response.data,
        guardians: records,
        guardianId,
        patientId: patientID,
        user,
      });
      sent = true;
      const update = await requestDeadline(
        guardianApi.updatePrimaryAllocation(response.data.id, payload),
      );
      if (!update?.ok)
        throw new Error('The primary guardian update was not confirmed.');
      const verified = await requestDeadline(
        guardianApi.getPatientAllocation(patientID),
      );
      if (
        !verified?.ok ||
        String(verified.data.patientId) !== String(patientID) ||
        String(verified.data.guardianId) !== String(guardianId)
      )
        throw new Error('The primary guardian could not be verified.');
      if (mounted.current)
        finish('Primary guardian selection has been verified.');
    } catch (failure) {
      if (mounted.current) {
        setUncertain(sent);
        setError(
          sent
            ? 'The primary guardian update outcome is unknown. Do not submit again; reopen the profile and verify the allocation.'
            : failure.message,
        );
      }
    } finally {
      busy.current = false;
      if (mounted.current) setLoading(false);
    }
  };
  if (!canEditGuardian(user))
    return (
      <AppText>
        Guardian editing is available to caregivers and supervisors.
      </AppText>
    );
  const primary =
    allocation &&
    String(allocation.patientId) === String(patientID) &&
    String(allocation.guardianId) === String(guardianId);
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ padding: 24 }}
    >
      {loading ? <AppText>Loading...</AppText> : null}
      {error ? <AppText testID="guardian-edit-error">{error}</AppText> : null}
      {!guardian && !loading ? (
        <AppButton title="Reload guardian" color="green" onPress={load} />
      ) : null}
      {guardian ? (
        <View>
          <AppText>{`${guardian.firstName} ${guardian.lastName}`}</AppText>
          <AppText>{`Date of birth: ${String(guardian.dateOfBirth || '').slice(
            0,
            10,
          )} | Gender: ${guardian.gender || '-'}`}</AppText>
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
              onChangeText={(value) =>
                setEdits((previous) => ({ ...previous, [key]: value }))
              }
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
              onPress={() =>
                Alert.alert(
                  'Change primary guardian',
                  `Make ${guardian.firstName} ${guardian.lastName} the primary guardian for this patient?`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Confirm', onPress: setPrimary },
                  ],
                )
              }
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
