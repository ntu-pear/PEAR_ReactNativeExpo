// Libs
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { View } from 'native-base';

// API
import patientApi from 'app/api/patient';

// Hooks
import formatDateTime from 'app/hooks/useFormatDateTime.js';

// Components
import DynamicTable from 'app/components/DynamicTable';
import ActivityIndicator from 'app/components/ActivityIndicator';
import AddButton from 'app/components/AddButton';
import AddPatientVitalModal from 'app/components/AddPatientVitalModal';

function PatientVitalScreen(props) {
  const [isLoading, setIsLoading] = useState(true);
  const [headerData, setHeaderData] = useState([]);
  const [rowData, setRowData] = useState([]);
  const [widthData, setWidthData] = useState([]);
  const [tableDataFormated, setTableDataFormated] = useState([]);
  const [patientID, setPatientID] = useState(props.route.params.patientID);
  const [showModal, setShowModal] = useState(false);
  // Adding vitals
  const handleAddVitals = () => {
    setShowModal(true);
  };

  const handleModalSubmit = async (vitalData) => {
    try {
      const result = await patientApi.AddPatientVital(patientID, vitalData);
      if (result.ok) {
        console.log('submitting vital data', vitalData);
        retrieveScreenData(patientID);
        setShowModal(false);
      } else {
        console.error('Error submitting vital data', result.problem, vitalData);
      }
    } catch (error) {
      console.error('Exception when calling AddPatientVital:', error);
    }
  };

  const retrieveScreenData = async (id) => {
    const response = await patientApi.getPatientVitalList(id);
    if (!response.ok) {
      console.log('Request failed with status code: ', response.status);
      return;
    }

    //console.log('response.data.data', response.data.data);

    const sortedData = response.data.data.sort(
      (a, b) => new Date(b.createdDate) - new Date(a.createdDate),
    );

    console.log('sortedData', sortedData);

    const newArray = sortedData.map(
      ({
        updatedDateTime,
        temperature,
        weight,
        height,
        systolicBP,
        diastolicBP,
        heartRate,
        spO2,
        bloodSugarlevel,
        afterMeal,
        vitalRemarks,
      }) => ({
        Date: `${formatDateTime(updatedDateTime, true)}`,
        Time: `${formatDateTime(updatedDateTime, false)}`,
        'Temperature (°C)': temperature,
        'Weight (kg)': weight,
        'Height (m)': height,
        'Systolic BP (mmHg)': systolicBP,
        'Diastolic BP (mmHg)': diastolicBP,
        'Heart Rate (bpm)': heartRate,
        'SpO2 (%)': spO2,
        'Blood Sugar Level (mmol/L)': bloodSugarlevel,
        'After Meal': afterMeal ? 'Yes' : 'No',
        Remark: vitalRemarks,
      }),
    );
    setTableDataFormated(newArray);
    setIsLoading(false);
  };

  useEffect(() => {
    if (tableDataFormated !== undefined && tableDataFormated.length !== 0) {
      setHeaderData(Object.keys(tableDataFormated[0]));

      const finalArray = tableDataFormated.map((item) => {
        return Object.values(item).map((value) =>
          value ? value.toString() : '',
        );
      });
      setRowData(finalArray);
    }
  }, [tableDataFormated]);

  useEffect(() => {
    retrieveScreenData(patientID);
    setWidthData([120, 100, 170, 130, 130, 200, 200, 200, 100, 250, 130, 200]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return isLoading ? (
    <ActivityIndicator visible />
  ) : (
    <View style={styles.cardContainer}>
      <DynamicTable
        headerData={headerData}
        rowData={rowData}
        widthData={widthData}
        screenName={'patient vital'}
      />
      {/* "Add Vitals" button */}
      <AddButton title="Add Vitals" onPress={handleAddVitals} />
      <AddPatientVitalModal
        showModal={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleModalSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    paddingLeft: 10,
    paddingRight: 10,
  },
});

export default PatientVitalScreen;
