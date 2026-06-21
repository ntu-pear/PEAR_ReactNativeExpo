// Libs
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { View } from 'native-base';

// API
import activityApi from 'app/api/activity';

// Components
import DynamicTable from 'app/components/DynamicTable';
import ActivityIndicator from 'app/components/ActivityIndicator';

function PatientRoutineScreen(props) {
  const [isLoading, setIsLoading] = useState(true);
  const [headerData, setHeaderData] = useState([]);
  const [rowData, setRowData] = useState([]);
  const [widthData, setWidthData] = useState([]);
  const [tableDataFormated, setTableDataFormated] = useState([]);
  const [patientID, setPatientID] = useState(props.route.params.patientID);

  const retrieveScreenData = async (id) => {
    const response = await activityApi.getPatientRoutine(id);
    if (response.ok) {
      setTableDataFormated(response.data.data || []);
    } else {
      console.log('[Routine] Request failed with status code: ', response.status);
      setTableDataFormated([]);
    }
    setIsLoading(false);
  };

  // Convert and set up data for DynamicTable (if any in the future)
  useEffect(() => {
    if (tableDataFormated && tableDataFormated.length !== 0) {
      setHeaderData(Object.keys(tableDataFormated[0]));

      const finalArray = tableDataFormated.map((item) =>
        Object.values(item).map((value) => (value ? value.toString() : '')),
      );
      setRowData(finalArray);
    }
  }, [tableDataFormated]);

  useEffect(() => {
    retrieveScreenData(patientID);
    setWidthData([120, 150, 200, 120, 120, 150, 150]);
  }, [patientID]);

  return isLoading ? (
    <ActivityIndicator visible />
  ) : (
    <View style={styles.cardContainer}>
      <DynamicTable
        headerData={headerData}
        rowData={rowData}
        widthData={widthData}
        screenName={'patient routine'}
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

export default PatientRoutineScreen;
