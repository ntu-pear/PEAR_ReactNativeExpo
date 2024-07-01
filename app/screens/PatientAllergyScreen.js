// Libs
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { View } from 'native-base';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

// API
import patientApi from 'app/api/patient';

// Utilities
import { formatTimeHM24, convertTimeMilitary, isEmptyObject, noDataMessage, sortFilterInitialState, formatMilitaryToAMPM, formatDate, formatTimeAMPM } from 'app/utility/miscFunctions';

// Navigation
import routes from 'app/navigation/routes';

// Hooks
import formatDateTime from 'app/hooks/useFormatDateTime.js';

// Components
import DynamicTable from 'app/components/DynamicTable';
import ActivityIndicator from 'app/components/ActivityIndicator';
import AddButton from 'app/components/AddButton';
import AddPatientAllergyModal from 'app/components/AddPatientAllergyModal';
import ProfileNameButton from 'app/components/ProfileNameButton';
import LoadingWheel from 'app/components/LoadingWheel';

function PatientAllergyScreen(props) {
  let {patientID, patientId} = props.route.params;
  if (patientId) {
    patientID = patientId;
  }
  const navigation = useNavigation();

  // API call related states
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isRetry, setIsRetry] = useState(false);
  const [statusCode, setStatusCode] = useState(200);
  const [headerData, setHeaderData] = useState([]);
  const [rowData, setRowData] = useState([]);
  const [widthData, setWidthData] = useState([]);
  const [tableDataFormated, setTableDataFormated] = useState([]);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [patientAllergyIDs, setPatientAllergyIDs] = useState([]);

  // Patient data related states
  const [patientData, setPatientData] = useState({});
  const [isReloadPatientList, setIsReloadPatientList] = useState(true);

  // Refresh list when new medication is added or user requests refresh
  useFocusEffect(
    React.useCallback(() => {
      if (isReloadPatientList) {
        refreshAllergyData();
        setIsReloadPatientList(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReloadPatientList]),
  );

  // Set isLoading to true when retrieving data
  const refreshAllergyData = () => {
    setIsLoading(true);
    const promiseFunction = async () => {
      await getPatientData();
    };
    promiseFunction();
  } 

  // Get patient data from backend
  const getPatientData = async () => {
    if (patientID) {
      const response = await patientApi.getPatient(patientID);
      if (response.ok) {
        setPatientData(response.data.data);
        setIsError(false);
        setIsRetry(false);
        setStatusCode(response.status);
      } else {
        console.log('Request failed with status code: ', response.status);
        setPatientData({});
        setIsLoading(false);
        setIsError(true);
        setStatusCode(response.status);
        setIsRetry(true);
      }
    }
  };

  // Navigate to patient profile on click profile image
  const onClickProfile = () => {  
    navigation.navigate(routes.PATIENT_PROFILE, { id: patientID });
  }

  const handleAddAllergy = () => {
    setShowModal(true);
  };

  const handleModalSubmit = async (allergyData) => {

    let alertTitle = '';
    let alertDetails = '';

    const result = await patientApi.AddPatientAllergy(patientID, allergyData);
    if (result.ok) {
      console.log('submitting allergy data', allergyData);
      retrieveAllergyData(patientID);
      setShowModal(false);

      alertTitle = 'Successfully added allergy';
    } else {
      const errors = result.data?.message;

      result.data
      ? (alertDetails = `\n${errors}\n\nPlease try again.`)
      : (alertDetails = 'Please try again.');
      
      alertTitle = 'Error adding allergy';
    }

    Alert.alert(alertTitle, alertDetails);
  };

  const retrieveAllergyData = async (id) => {
    const response = await patientApi.getPatientAllergy(id);
    if (!response.ok) {
      console.log('Request failed with status code: ', response.status);
      return;
    }

    const sortedData = response.data.data.sort(
      (a, b) => new Date(b.createdDate) - new Date(a.createdDate),
    );

    const newArray = sortedData.map(
      ({ createdDate, allergyListDesc, allergyReaction, allergyRemarks }) => ({
        Date: `${formatDateTime(createdDate, true)}`,
        Time: `${formatDateTime(createdDate, false)}`,
        'Allergic To': allergyListDesc,
        Reaction: allergyReaction,
        Notes: allergyRemarks,
      }),
    );
    setTableDataFormated(newArray);

    // Get the allergy IDs
    const allergyIDs = response.data.data.map(
      (allergy) => allergy.allergyListID,
    );
    setPatientAllergyIDs(allergyIDs);

    // debugging - joel
    console.log('Existing Allergy IDs passed', allergyIDs);

    setIsLoading(false);
  };

  useEffect(() => {
    if (tableDataFormated !== undefined && tableDataFormated.length !== 0) {
      setHeaderData(Object.keys(tableDataFormated[0]));

      const finalArray = tableDataFormated.map((item) => {
        return Object.values(item).map((value) => value.toString());
      });
      setRowData(finalArray);
    }
  }, [tableDataFormated]);

  useEffect(() => {
    if (props.route.params.patientId) {
      retrieveAllergyData(patientID);
      console.log('patient ID Log from retrieve screen data', patientID);
      setWidthData([120, 100, 120, 200, 300]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
      isLoading ? (
        <ActivityIndicator visible />
      ) : (
        <View style={styles.container}>
          <View style={{justifyContent: 'space-between'}}>            
            <View style={{alignSelf: 'center', marginTop: 15, maxHeight: 120}} >
              {!isEmptyObject(patientData) ? (
                  <ProfileNameButton   
                    profilePicture={patientData.profilePicture}
                    profileLineOne={patientData.preferredName}
                    profileLineTwo={(patientData.firstName + ' ' + patientData.lastName)}
                    handleOnPress={onClickProfile}
                    isPatient
                    isVertical={false}
                    size={90}
                    />
              ) : (
                <LoadingWheel/>
                )}
            </View>  
        <View style={styles.cardContainer}>
          <DynamicTable
            headerData={headerData}
            rowData={rowData}
            widthData={widthData}
            screenName={'patient allergy'}
            noDataMessage={noDataMessage(statusCode, isLoading, isError, 'No allergy found', false)}
          />
        </View>
      </View>
      {/* "Add Allergy" button */}
      <AddButton title="Add Allergy" onPress={handleAddAllergy} />
      <AddPatientAllergyModal
        showModal={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleModalSubmit}
        existingAllergyIDs={patientAllergyIDs}
      />
    </View>
    )
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    paddingLeft: 10,
    paddingRight: 10,
  },
});

export default PatientAllergyScreen;
