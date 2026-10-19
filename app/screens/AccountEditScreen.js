// Libs
import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
  useRef,
} from 'react';
import { Alert, ActivityIndicator, StyleSheet, View } from 'react-native';
import { VStack, FlatList, Text, Box } from 'native-base';

// APIs
import userApi from 'app/api/user';
import AuthContext from 'app/auth/context';
import { currentUserId } from 'app/utility/medicationAdminister';
import { writePersonalProfile } from 'app/utility/personalProfileWrite';

// Configurations
import colors from 'app/config/colors';

// Components
import InformationCard from 'app/components/InformationCard';
import AppButton from 'app/components/AppButton';
import InputField from 'app/components/input-components/InputField';

function AccountEditScreen(props) {
  const [isLoading, setIsLoading] = useState(false);
  const { navigation } = props;
  const { userData, unMaskedUserNRIC } = props.route.params || {};
  const { user } = useContext(AuthContext) || {};
  const actor = String(currentUserId(user));
  const current = useRef(actor);
  current.current = actor;
  const alive = useRef(true),
    saving = useRef(false);
  const [uncertain, setUncertain] = useState(false);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  // Screen error state: This = true when the child components report error(input fields)
  // Enables use of dynamic rendering of components when the page error = true/false.
  const [isInputErrors, setIsInputErrors] = useState(false);

  // Input error states (Child components)
  // This records the error states of each child component (ones that require tracking).
  const [isPrefNameError, setIsPrefNameError] = useState(false);
  const [isMobileNoError, setIsMobileNoError] = useState(false);

  // Account data to be submitted
  const [formData, setFormData] = useState({
    PreferredName: props.route.params?.preferredName ?? '',
    ContactNo: props.route.params?.contactNo ?? '',
  });

  // This useEffect enables the page to show correct error checking.
  // The main isInputErrors is responsible for the error state of the screen.
  // This state will be true whenever any child input components are in error state.
  useEffect(() => {
    setIsInputErrors(isPrefNameError || isMobileNoError);
  }, [isPrefNameError, isMobileNoError]);

  // Functions for error state reporting for the child components
  const handlePrefNameError = useCallback(
    (state) => {
      setIsPrefNameError(state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isPrefNameError],
  );
  const handleMobileNoError = useCallback(
    (state) => {
      setIsMobileNoError(state);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isMobileNoError],
  );

  // Function to update patient data
  const handleFormData = (field) => (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [field]: e,
    }));
  };

  // form submission when save button is pressed
  const submitForm = async () => {
    if (saving.current || uncertain) {
      return;
    }
    const owner = actor;
    saving.current = true;
    setIsLoading(true);
    try {
      const result = await writePersonalProfile({
        api: userApi,
        actor: owner,
        name: formData.PreferredName,
        contact: formData.ContactNo,
        isCurrent: () => alive.current && current.current === owner,
      });
      if (
        !alive.current ||
        current.current !== owner ||
        result.outcome === 'stale'
      ) {
        return;
      }
      if (result.outcome === 'verified') {
        navigation.goBack();
        Alert.alert(
          'Saved Successfully',
          'Your personal information has been verified.',
        );
      } else {
        if (result.outcome === 'uncertain') {
          setUncertain(true);
        }
        Alert.alert(
          result.outcome === 'uncertain'
            ? 'Check the saved record'
            : 'Unable to save',
          result.message,
        );
      }
    } finally {
      saving.current = false;
      if (alive.current && current.current === owner) {
        setIsLoading(false);
      }
    }
  };

  return isLoading ? (
    <ActivityIndicator visible />
  ) : (
    <FlatList
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      contentContainerStyle={{ paddingBottom: 32 }}
      data={[0]}
      renderItem={() => (
        <Box alignItems="center">
          <Box w="100%">
            <VStack>
              <View style={styles.formContainer}>
                <InputField
                  isRequired
                  title={'Preferred Name'}
                  value={formData.PreferredName ?? ''}
                  onChangeText={handleFormData('PreferredName')}
                  onEndEditing={handlePrefNameError}
                  dataType="name"
                />

                <InputField
                  isRequired
                  title={'Contact No.'}
                  value={formData.ContactNo ?? ''}
                  onChangeText={handleFormData('ContactNo')}
                  onEndEditing={handleMobileNoError}
                  dataType={'mobile phone'}
                  keyboardType="numeric"
                  maxLength={8}
                />

                <InformationCard
                  displayData={userData}
                  unMaskedNRIC={unMaskedUserNRIC}
                />

                <Text style={styles.redText}>
                  Note: To edit other information, please contact system
                  administrator.
                </Text>
              </View>
              <View style={styles.saveButtonContainer}>
                <Box width="100%" maxWidth={760} px={4}>
                  {isLoading ? (
                    <AppButton
                      title="Save"
                      color="green"
                      onPress={submitForm}
                      isDisabled={true}
                    />
                  ) : (
                    <AppButton
                      title="Save"
                      color="green"
                      onPress={submitForm}
                      isDisabled={isInputErrors || uncertain}
                    />
                  )}
                </Box>
                {uncertain ? (
                  <Text style={styles.redText}>
                    The saved outcome is unconfirmed. Return to Personal
                    Information to reload it before editing again.
                  </Text>
                ) : null}
                <AppButton
                  title="Back to personal information"
                  color="grey"
                  onPress={() => navigation.goBack()}
                />
              </View>
            </VStack>
          </Box>
        </Box>
      )}
    />
  );
}

const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    marginBottom: 20,
  },
  redText: {
    marginTop: 12,
    marginBottom: 16,
    lineHeight: 20,
    alignSelf: 'center',
    color: colors.red,
  },
  saveButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
});

export default AccountEditScreen;
