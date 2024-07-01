// Libs
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
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
import LoadingWheel from 'app/components/LoadingWheel';
import ProfileNameButton from 'app/components/ProfileNameButton';

function PatientPrescriptionScreen(props) {
  let {patientID, patientId} = props.route.params;
  if (patientId) {
    patientID = patientId;
  }
  const navigation = useNavigation();

  // API call related states
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isRetry, setIsRetry] = useState(false);
  const [statusCode, setStatusCode] = useState(200);

  const [headerData, setHeaderData] = useState([]);
  const [rowData, setRowData] = useState([]);
  const [widthData, setWidthData] = useState([]);
  const [tableDataFormated, setTableDataFormated] = useState([]);

  // Patient data related states
  const [patientData, setPatientData] = useState({});
  const [isReloadPatientList, setIsReloadPatientList] = useState(true);

  // Refresh list when new medication is added or user requests refresh
  useFocusEffect(
    React.useCallback(() => {
      if (isReloadPatientList) {
        refreshPrescriptionData();
        setIsReloadPatientList(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReloadPatientList]),
  );

  // Set isLoading to true when retrieving data
  const refreshPrescriptionData = () => {
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

  //Prescription data related states
  const retrieveScreenData = async () => {
    const response = await patientApi.getPatientPrescriptionList(patientID);
    if (!response.ok) {
      console.log('Request failed with status code: ', response.status);
      return;
    }
    const newArray = response.data.data.map(({
      date, prescriptionListDesc, dosage, frequencyPerDay, instruction, startDate, endDate, 
      afterMeal, prescriptionRemarks, isChronic
    }) => ({
      "Date": `${formatDateTime(date, true)}`,
      "Time": `${formatDateTime(date, false)}`,
      "Drug Name": prescriptionListDesc,
      "Dosage": dosage,
      "Frequency Per Day": frequencyPerDay,
      "Instruction": instruction,
      "Start Date": `${formatDateTime(startDate, true)}`,
      "End Date": `${formatDateTime(endDate, true)}`,
      "After Meal": afterMeal ? 'Yes' : 'No',
      "Remarks": prescriptionRemarks,
      "Chronic": isChronic ? 'Yes' : 'No',
    }));
    setTableDataFormated(newArray);
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
    retrieveScreenData(patientID);
    setWidthData([120, 100, 130, 100, 200, 300, 120, 120, 120, 300, 100]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return isLoading ? (
    <ActivityIndicator visible />
  ) : (
    <View style={styles.cardContainer}>
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
      <DynamicTable
        headerData={headerData}
        rowData={rowData}
        widthData={widthData}
        screenName={'patient prescription'}
      />
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    paddingLeft: 10,
    paddingRight: 10,
  },
});

export default PatientPrescriptionScreen;
