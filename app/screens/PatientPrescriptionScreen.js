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

function PatientPrescriptionScreen(props) {
  const [isLoading, setIsLoading] = useState(true);
  const [headerData, setHeaderData] = useState([]);
  const [rowData, setRowData] = useState([]);
  const [widthData, setWidthData] = useState([]);
  const [tableDataFormated, setTableDataFormated] = useState([]);
  const [patientID, setPatientID] = useState(props.route.params.patientID);

  const retrieveScreenData = async (id) => {
    const response = await patientApi.getPatientPrescriptionList(id);
    if (!response.ok) {
      console.log('Request failed with status code: ', response.status);
      return;
    }
    const newArray = response.data.data.map(({
      prescriptionListDesc, dosage, frequencyPerDay, instruction, startDate, endDate, afterMeal, prescriptionRemarks, isChronic
    }) => ({
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
    setWidthData([130, 100, 200, 300, 120, 120, 120, 300, 100]);
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
        screenName={'patient prescription'}
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

export default PatientPrescriptionScreen;
