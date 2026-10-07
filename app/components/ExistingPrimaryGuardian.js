import React, { useEffect, useRef, useState } from 'react';
import { Text, TextInput, View, StyleSheet } from 'react-native';
import guardianApi from 'app/api/guardian';
import AppButton from 'app/components/AppButton';
import SelectionInputField from 'app/components/input-components/SelectionInputField';
import { createGuardianLookup } from 'app/utility/guardianLookup';

const relationships = [
  'Husband',
  'Wife',
  'Child',
  'Sibling',
  'Parent',
  'Grandchild',
  'Friend',
  'Nephew',
  'Niece',
  'Aunt',
  'Uncle',
  'Grandparent',
];

export default function ExistingPrimaryGuardian({
  guardian,
  onField,
  onError,
}) {
  const lookup = useRef(null);
  if (!lookup.current) {
    lookup.current = createGuardianLookup({
      lookup: guardianApi.getGuardianByNRIC,
    });
  }
  const mounted = useRef(true);
  const busy = useRef(false);
  const sequence = useRef(0);
  const errorCallback = useRef(onError);
  errorCallback.current = onError;
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [searching, setSearching] = useState(false);
  useEffect(() => {
    mounted.current = true;
    onField('ExistingGuardianId')(null);
    onField('SelectedNric')('');
    return () => {
      mounted.current = false;
      lookup.current.cancel();
    };
    // A restored draft must be searched again; it is not an authenticated lookup.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    errorCallback.current(
      !result ||
        result.status !== 'found' ||
        result.patientIds.length >= 2 ||
        !guardian.ExistingGuardianId ||
        !guardian.RelationshipName,
    );
  }, [result, guardian.ExistingGuardianId, guardian.RelationshipName]);
  const changeQuery = (value) => {
    sequence.current += 1;
    busy.current = false;
    setSearching(false);
    lookup.current.setQuery(value);
    setQuery(value);
    setResult(null);
    onField('ExistingGuardianId')(null);
    onField('SelectedNric')('');
    onField('NRIC')(value);
    onField('RelationshipID')(0);
    onField('RelationshipName')('');
    onError(true);
  };
  const search = async () => {
    if (busy.current) {
      return;
    }
    busy.current = true;
    const attempt = ++sequence.current;
    setSearching(true);
    const found = await lookup.current.search();
    if (!mounted.current || attempt !== sequence.current) {
      return;
    }
    busy.current = false;
    setSearching(false);
    if (found.status === 'stale') {
      return;
    }
    setResult(found);
    if (found.status === 'found' && found.patientIds.length < 2) {
      onField('ExistingGuardianId')(found.id);
      onField('SelectedNric')(found.nric);
      onField('NRIC')(found.nric);
    }
  };
  return (
    <View style={styles.container}>
      <Text>Find an existing primary guardian by their exact NRIC.</Text>
      <TextInput
        testID="existing-primary-nric"
        accessibilityLabel="Guardian NRIC"
        value={query}
        onChangeText={changeQuery}
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={9}
        style={styles.input}
      />
      <AppButton
        title={searching ? 'Searching...' : 'Search guardian'}
        color="green"
        testID="existing-primary-search"
        onPress={search}
        isDisabled={searching || !query.trim()}
      />
      {result?.status === 'not_found' ? (
        <Text testID="existing-primary-result">
          No active guardian was found. Choose New primary guardian to enter a
          new record.
        </Text>
      ) : null}
      {result?.status === 'error' ? (
        <Text testID="existing-primary-result" accessibilityRole="alert">
          {result.message}
        </Text>
      ) : null}
      {result?.status === 'found' ? (
        <View>
          <Text testID="existing-primary-name">{result.name}</Text>
          <Text>
            {result.patientIds.length >= 2
              ? 'This guardian already has two patients and cannot be selected.'
              : 'Identity is locked. The selection is checked again before submission.'}
          </Text>
          <SelectionInputField
            testID="existing-primary-relationship"
            title="Guardian is patient's"
            isRequired
            value={guardian.RelationshipID}
            dataArray={relationships.map((label, i) => ({
              label,
              value: i + 1,
            }))}
            onDataChange={onField('RelationshipID')}
          />
        </View>
      ) : null}
      <AppButton
        title="Cancel search"
        color="grey"
        testID="existing-primary-cancel"
        onPress={() => {
          sequence.current += 1;
          busy.current = false;
          setSearching(false);
          lookup.current.cancel();
          setResult(null);
          onField('ExistingGuardianId')(null);
          onField('SelectedNric')('');
          onError(true);
        }}
      />
      <Text>
        Registration with an existing primary guardian supports one guardian.
        Additional guardians cannot be added during this registration.
      </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { padding: 20, width: '100%', gap: 12 },
  input: {
    minHeight: 48,
    padding: 12,
    borderWidth: 1,
    borderColor: '#777',
    borderRadius: 12,
  },
});
