// Libs
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { View } from 'native-base';

// Hooks
import formatDateTime from 'app/hooks/useFormatDateTime.js';

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

  // Temporarily skip the API until Routine endpoint exists in v1
  const retrieveScreenData = async (id) => {
    console.log('[Routine] Skipping API call — no v1 endpoint implemented yet.');
    setTableDataFormated([]); // no data to show
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
    setWidthData([120, 120, 120, 150, 200, 150, 150]);
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
