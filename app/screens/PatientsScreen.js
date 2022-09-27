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
  const [listOfPatients, setListOfPatients] = useState([
    {
      patientID: 1,
      preferredLanguage: 'Cantonese',
      firstName: 'Alice',
      lastName: 'Lee',
      nric: 'Sxxxx566D',
      address: '71 Kampong Bahru Road 169371, Singapore',
      tempAddress: null,
      homeNo: '61234567',
      handphoneNo: '61234568',
      gender: 'F',
      dob: '1941-12-14T00:00:00',
      preferredName: 'Alice',
      privacyLevel: 2,
      updateBit: false,
      autoGame: false,
      startDate: '2020-05-04T00:00:00',
      endDate: null,
      terminationReason: null,
      isActive: true,
      inactiveReason: null,
      inactiveDate: null,
      isRespiteCare: false,
      profilePicture:
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1640487405/Patient/Alice_Lee_Sxxxx567D/ProfilePicture/zsw7dyprsvn0bjmatofg.jpg',
    },
    {
      patientID: 2,
      preferredLanguage: 'English',
      firstName: 'Yan',
      lastName: 'Yi',
      nric: 'Sxxxx525X',
      address: null,
      tempAddress: null,
      homeNo: null,
      handphoneNo: null,
      gender: 'M',
      dob: '1996-02-02T00:00:00',
      preferredName: 'Alex',
      privacyLevel: 1,
      updateBit: true,
      autoGame: true,
      startDate: '2020-02-02T00:00:00',
      endDate: null,
      terminationReason: null,
      isActive: true,
      inactiveReason: null,
      inactiveDate: null,
      isRespiteCare: true,
      profilePicture:
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1634521792/Patient/Yan_Yi_Sxxxx148C/ProfilePicture/g5gnecfsoc8igp56dwnb.jpg',
    },
    {
      patientID: 3,
      preferredLanguage: 'Hainanese',
      firstName: 'Jon',
      lastName: 'Ong',
      nric: 'Sxxxx300H',
      address: 'Blk 3007 Ubi Rd 1 05-412, 406701, Singapore',
      tempAddress: null,
      homeNo: '67485000',
      handphoneNo: '67489859',
      gender: 'M',
      dob: '1960-02-02T00:00:00',
      preferredName: 'Jon',
      privacyLevel: 2,
      updateBit: true,
      autoGame: true,
      startDate: '2021-01-01T00:00:00',
      endDate: '2021-11-12T00:00:00',
      terminationReason: null,
      isActive: true,
      inactiveReason: null,
      inactiveDate: null,
      isRespiteCare: false,
      profilePicture:
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1634522355/Patient/Jon_Ong_Sxxxx300H/ProfilePicture/arkceots9px0niro7iwh.jpg',
    },
    {
      patientID: 4,
      preferredLanguage: 'Hakka',
      firstName: 'Bi',
      lastName: 'Gong',
      nric: 'Sxxxx443F',
      address: '41 Sungei Kadut Loop S 729509, Singapore',
      tempAddress: '42 Sungei Kadut Loop S 729509, Singapore',
      homeNo: '98123120',
      handphoneNo: '98123133',
      gender: 'M',
      dob: '1980-04-04T00:00:00',
      preferredName: 'Bi',
      privacyLevel: 3,
      updateBit: false,
      autoGame: false,
      startDate: '2021-01-01T00:00:00',
      endDate: null,
      terminationReason: null,
      isActive: true,
      inactiveReason: null,
      inactiveDate: '2021-01-01T00:00:00',
      isRespiteCare: false,
      profilePicture:
        'https://res.cloudinary.com/dbpearfyp/image/upload/v1634522583/Patient/Bi_Gong_Sxxxx443F/ProfilePicture/dwo0axohyhur5mp16lep.jpg',
    },
    {
      patientID: 5,
      preferredLanguage: 'English',
      firstName: 'Jeline',
      lastName: 'Mao',
      nric: 'Sxxxx123Z',
      address: '12 Ang Mio Kio Road #98-55 546512,Singapore',
      tempAddress: null,
      homeNo: '65231565',
      handphoneNo: '86543216',
      gender: 'M',
      dob: '0001-09-01T06:15:35.587',
      preferredName: 'Tom',
      privacyLevel: 3,
      updateBit: false,
      autoGame: false,
      startDate: '2021-01-01T00:00:00',
      endDate: null,
      terminationReason: null,
      isActive: true,
      inactiveReason: null,
      inactiveDate: null,
      isRespiteCare: false,
      profilePicture: null,
    },
    {
      patientID: 6,
      preferredLanguage: 'English',
      firstName: 'Jermaine',
      lastName: 'Mao',
      nric: 'Sxxxx123Z',
      address: '12 Ang Mio Kio Road #98-55 546512,Singapore',
      tempAddress: null,
      homeNo: '65231565',
      handphoneNo: '86543216',
      gender: 'M',
      dob: '0001-09-01T06:15:35.587',
      preferredName: 'Jerm',
      privacyLevel: 3,
      updateBit: false,
      autoGame: false,
      startDate: '2021-01-01T00:00:00',
      endDate: null,
      terminationReason: null,
      isActive: true,
      inactiveReason: null,
      inactiveDate: null,
      isRespiteCare: false,
      profilePicture: null,
    },
  ]);
  const checkExpiredLogOutHook = useCheckExpiredThenLogOut();
  const { navigation } = props;

  useEffect(() => {
    // Reference https://stackoverflow.com/questions/21518381/proper-way-to-wait-for-one-function-to-finish-before-continuing
    // Resolved the issue of `setListOfPatients` before successfully calling getPatient api.
    setIsLoading(false);
    // const promiseFunction = async () => {
    //   const response = await getListOfPatients();

    //   setListOfPatients(response.data);
    // };
    // promiseFunction();
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
          <ScrollView w="100%">
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
