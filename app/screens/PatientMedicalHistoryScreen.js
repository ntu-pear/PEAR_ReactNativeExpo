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
import AddPatientMedicalHistoryModal from 'app/components/AddPatientMedicalHistoryModal';

function PatientMedicalHistoryScreen(props) {
  const [isLoading, setIsLoading] = useState(true);
  const [headerData, setHeaderData] = useState([]);
  const [rowData, setRowData] = useState([]);
  const [widthData, setWidthData] = useState([]);
  const [tableDataFormated, setTableDataFormated] = useState([]);
  const [patientID, setPatientID] = useState(props.route.params.patientID);
  const [showModal, setShowModal] = useState(false);

  const handleAddMedicalHistory = () => {
    setShowModal(true);
  };

  const handleModalSubmit = async (medicalData) => {
    try {
      const result = await patientApi.AddPatientMedicalHistory(
        patientID,
        medicalData,
      );
      if (result.ok) {
        console.log('submitting medical data', medicalData);
        retrieveScreenData(patientID);
        setShowModal(false);
      } else {
        console.error(
          'Error submitting medical data',
          result.problem,
          medicalData,
        );
      }
    } catch (error) {
      console.error('Exception when calling AddMedicalHistory:', error);
    }
  };

  const retrieveScreenData = async (id) => {
    const response = await patientApi.getPatientMedicalHistory(id);
    if (!response.ok) {
      console.log('Request failed with status code: ', response.status);
      return;
    }

    const sortedData = response.data.data.sort(
      (a, b) =>
        new Date(b.medicalEstimatedDate) - new Date(a.medicalEstimatedDate),
    );

    const newArray = sortedData.map(
      ({
        medicalEstimatedDate,
        medicalDetails,
        informationSource,
        medicalRemarks,
      }) => ({
        Date: `${formatDateTime(medicalEstimatedDate, true)}`,
        Diagnosis: medicalDetails,
        'Diagnosis By': informationSource,
        Remarks: medicalRemarks,
      }),
    );
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
    setWidthData([120, 120, 150, 400]);
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
        screenName={'patient medical history'}
      />
      <AddButton
        title="Add Medical History"
        onPress={handleAddMedicalHistory}
      />
      <AddPatientMedicalHistoryModal
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

export default PatientMedicalHistoryScreen;
