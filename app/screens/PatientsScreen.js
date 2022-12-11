import React, { useState, useEffect } from 'react';
import { Center, VStack, ScrollView, Fab, Icon } from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
import patientApi from 'app/api/patient';
import useCheckExpiredThenLogOut from 'app/hooks/useCheckExpiredThenLogOut';
import PatientScreenCard from 'app/components/PatientScreenCard';
import colors from 'app/config/colors';
import ActivityIndicator from 'app/components/ActivityIndicator';

function PatientsScreen(props) {
  const [isLoading, setIsLoading] = useState(false);
  const [listOfPatients, setListOfPatients] = useState();
  const checkExpiredLogOutHook = useCheckExpiredThenLogOut();
  const { navigation } = props;

  useEffect(() => {
    // Reference https://stackoverflow.com/questions/21518381/proper-way-to-wait-for-one-function-to-finish-before-continuing
    // Resolved the issue of `setListOfPatients` before successfully calling getPatient api.
    setIsLoading(false);
    const promiseFunction = async () => {
      const response = await getListOfPatients();

      setListOfPatients(response.data);
    };
    promiseFunction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListOfPatients = async () => {
    const response = await patientApi.getPatient(null, true, true);
    if (!response.ok) {
      // Check if token has expired, if yes, proceed to log out
      checkExpiredLogOutHook.handleLogOut(response);
      return;
    }
    setIsLoading(false);
    return response;
  };

  const handleFabOnPress = () => {
    // TODO: Include `Add Patient Feature`
    // console.log('Placeholder for fab on click');
  };

  return (
    // <ActivityIndicator visible={true}/>
    <>
      {isLoading ? (
        <ActivityIndicator visible />
      ) : (
        <Center backgroundColor={colors.white_var1}>
          <ScrollView w="100%" height="100%">
            <VStack>
              {listOfPatients
                ? listOfPatients.map((item, index) => (
                    <PatientScreenCard
                      patientProfile={item}
                      key={index}
                      navigation={navigation}
                    />
                  ))
                : null}
            </VStack>
          </ScrollView>
          <Center position="absolute" bottom="0" right="1">
            <Fab
              backgroundColor={colors.pink}
              icon={
                <Icon
                  as={MaterialIcons}
                  color={colors.white}
                  name="person-add-alt"
                  size="lg"
                  placement="bottom-right"
                />
              }
              onPress={handleFabOnPress}
              renderInPortal={false}
              shadow={2}
              size="sm"
            />
          </Center>{' '}
        </Center>
      )}
    </>
  );
}

export default PatientsScreen;
