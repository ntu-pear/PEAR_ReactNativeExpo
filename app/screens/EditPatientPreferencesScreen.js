import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  useMemo,
  useCallback,
} from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Box, VStack, FlatList, Text } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import routes from 'app/navigation/routes';
import useGetSelectionOptions from 'app/hooks/useGetSelectionOptions';
import AuthContext from 'app/auth/context';
import client, { PATIENT_V1_BASE } from 'app/api/client';
import AppButton from 'app/components/AppButton';
import SelectionInputField from 'app/components/input-components/SelectionInputField';
import ActivityIndicator from 'app/components/ActivityIndicator';
import InputField from 'app/components/input-components/InputField';
import { currentUserId } from 'app/utility/medicationAdminister';
import requestDeadline from 'app/utility/requestDeadline';
import {
  opaqueId,
  resolvePreferredLanguage,
  buildPatientPreferencesUpdate,
} from 'app/utility/patientFieldPolicy';

const initialDraft = (owner, name, language) => ({
  owner,
  name,
  language,
  languageEdited: false,
  nameError: false,
});
const validOption = (option) =>
  option &&
  typeof option.label === 'string' &&
  ((typeof option.value === 'number' &&
    Number.isSafeInteger(option.value) &&
    option.value > 0) ||
    (typeof option.value === 'string' && /^0*[1-9]\d*$/.test(option.value)));

function EditPatientPreferencesScreen(props) {
  const { patientProfile } = props.route.params;
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  const {
    data: languages,
    isError: languageError,
    isLoading: languageLoading,
  } = useGetSelectionOptions('Language');
  const options = useMemo(
    () => (Array.isArray(languages) ? languages.filter(validOption) : []),
    [languages],
  );
  const actorId = currentUserId(user);
  const patientId = patientProfile.patientID;
  const ownerKey = JSON.stringify([
    patientId,
    actorId,
    user?.roleName ?? user?.role,
    user?.roleId ?? user?.roleID,
  ]);
  const currentOwner = useRef(null);
  // Retire old callbacks during render, before passive effects run. Returning to
  // the same account/patient creates a new token rather than reviving old work.
  if (currentOwner.current?.key !== ownerKey) {
    currentOwner.current = { key: ownerKey };
  }
  const renderOwner = currentOwner.current;
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const nameAtOpen =
    typeof patientProfile.preferredName === 'string'
      ? patientProfile.preferredName
      : '';
  const languageAtOpen = resolvePreferredLanguage(
    patientProfile.preferredLanguage,
    options,
  );
  const [draft, setDraft] = useState(() =>
    initialDraft(renderOwner, nameAtOpen, languageAtOpen),
  );
  // Render the new owner's values immediately, including before the reset effect.
  const shown =
    draft.owner === renderOwner
      ? draft
      : initialDraft(renderOwner, nameAtOpen, languageAtOpen);
  useEffect(() => {
    setDraft((previous) => {
      if (currentOwner.current !== renderOwner) {
        return previous;
      }
      if (previous.owner !== renderOwner) {
        return initialDraft(renderOwner, nameAtOpen, languageAtOpen);
      }
      if (previous.languageEdited || previous.language === languageAtOpen) {
        return previous;
      }
      return { ...previous, language: languageAtOpen };
    });
  }, [renderOwner, nameAtOpen, languageAtOpen]);
  const updateDraft = useCallback(
    (changes) => {
      if (!mounted.current || currentOwner.current !== renderOwner) {
        return;
      }
      setDraft((previous) => {
        if (!mounted.current || currentOwner.current !== renderOwner) {
          return previous;
        }
        const owned =
          previous.owner === renderOwner
            ? previous
            : initialDraft(renderOwner, nameAtOpen, languageAtOpen);
        if (Object.keys(changes).every((key) => owned[key] === changes[key])) {
          return owned;
        }
        return { ...owned, ...changes };
      });
    },
    [renderOwner, nameAtOpen, languageAtOpen],
  );
  const changeName = useCallback(
    (value) => updateDraft({ name: value }),
    [updateDraft],
  );
  const reportNameError = useCallback(
    (value) => updateDraft({ nameError: value }),
    [updateDraft],
  );
  const changeLanguage = useCallback(
    (value) => updateDraft({ language: value, languageEdited: true }),
    [updateDraft],
  );
  const saving = useRef(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveUncertain, setSaveUncertain] = useState(false);
  // Validate the selection against current options. The shared selector retains
  // its initial error flag after a valid choice or a late prefill.
  const validLanguage = options.some(
    (option) => String(option.value) === String(shown.language),
  );
  const disabled =
    languageLoading ||
    Boolean(languageError) ||
    !validLanguage ||
    !String(shown.name).trim() ||
    shown.nameError ||
    isSaving ||
    saveUncertain ||
    !actorId;
  const ownsOperation = () =>
    mounted.current && currentOwner.current === renderOwner;
  const submitForm = async () => {
    if (!ownsOperation() || saving.current || disabled) {
      return;
    }
    saving.current = true;
    setIsSaving(true);
    let writeStarted = false;
    try {
      const id = opaqueId(patientId);
      const pathId = encodeURIComponent(String(id));
      const fresh = await requestDeadline(
        client.get(
          `/patients/${pathId}`,
          { require_auth: true, mask: false },
          { baseURL: PATIENT_V1_BASE, timeout: 15000 },
        ),
      );
      if (!ownsOperation()) {
        return;
      }
      if (!fresh?.ok) {
        throw new Error(
          'Patient information could not be loaded. Please retry.',
        );
      }
      const payload = buildPatientPreferencesUpdate({
        record: fresh.data?.data ?? fresh.data,
        patientId: id,
        userId: actorId,
        preferredName: shown.name,
        preferredLanguageId: shown.language,
        languageOptions: options,
      });
      if (!ownsOperation()) {
        return;
      }
      writeStarted = true;
      const result = await requestDeadline(
        client.put(`/patients/update/${pathId}`, payload, {
          baseURL: PATIENT_V1_BASE,
          timeout: 15000,
        }),
      );
      const uncertain =
        !result?.ok && (!result?.status || result.status >= 500);
      if (uncertain && mounted.current) {
        setSaveUncertain(true);
      }
      if (!ownsOperation()) {
        return;
      }
      if (!result?.ok) {
        if (uncertain) {
          Alert.alert(
            'Save could not be confirmed',
            'Reopen this patient and check the current preferences before saving again.',
          );
        } else {
          Alert.alert(
            'Patient preferences were not saved',
            'Check your permissions and entered information, then retry.',
          );
        }
        return;
      }
      navigation.replace(routes.PATIENT_PROFILE, { patientId: id });
      Alert.alert(
        'Saved Successfully',
        'Patient preferences have been updated.',
      );
    } catch (error) {
      if (writeStarted && mounted.current) {
        setSaveUncertain(true);
      }
      if (!ownsOperation()) {
        return;
      }
      if (writeStarted) {
        Alert.alert(
          'Save could not be confirmed',
          'Reopen this patient and check the current preferences before saving again.',
        );
      } else {
        Alert.alert(
          'Patient preferences were not saved',
          error.message || 'Please retry.',
        );
      }
    } finally {
      saving.current = false;
      if (mounted.current) {
        setIsSaving(false);
      }
    }
  };

  if (languageLoading) {
    return <ActivityIndicator visible />;
  }
  return (
    <FlatList
      data={[0]}
      renderItem={() => (
        <Box key={ownerKey} alignItems="center" w="100%">
          <VStack w="100%">
            <View style={styles.formContainer}>
              <InputField
                testID="preferences-name"
                isRequired
                title="Preferred Name"
                value={shown.name}
                onChangeText={changeName}
                onEndEditing={reportNameError}
                dataType="name"
              />
              <SelectionInputField
                testID="preferences-language"
                isRequired
                title="Preferred Language"
                placeholder="Choose a language"
                value={validLanguage ? shown.language : 0}
                dataArray={options}
                onDataChange={changeLanguage}
              />
              {languageError || !options.length ? (
                <Text>
                  Languages could not be loaded. Reopen this screen to retry.
                </Text>
              ) : null}
              {saveUncertain ? (
                <Text>Check the saved preferences before trying again.</Text>
              ) : null}
            </View>
            <View style={styles.saveButtonContainer}>
              <Box width="70%">
                <AppButton
                  title="Save"
                  color="green"
                  onPress={submitForm}
                  isDisabled={disabled}
                />
              </Box>
            </View>
          </VStack>
        </Box>
      )}
    />
  );
}
const styles = StyleSheet.create({
  formContainer: {
    alignItems: 'flex-start',
    paddingLeft: '10%',
    width: '90%',
    marginBottom: 20,
  },
  saveButtonContainer: { alignItems: 'center', marginBottom: 20 },
});
export default EditPatientPreferencesScreen;
