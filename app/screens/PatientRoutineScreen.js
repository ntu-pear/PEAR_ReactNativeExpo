// Libs
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { View } from 'native-base';

// API
import activityApi from 'app/api/activity';

// Components
import DynamicTable from 'app/components/DynamicTable';
import ActivityIndicator from 'app/components/ActivityIndicator';

// Utilities
import { noDataMessage } from 'app/utility/miscFunctions';

function PatientRoutineScreen(props) {
  const [isLoading, setIsLoading] = useState(true);
  const [headerData, setHeaderData] = useState([]);
  const [rowData, setRowData] = useState([]);
  const [widthData, setWidthData] = useState([180, 220, 110, 110]);
  const [tableDataFormated, setTableDataFormated] = useState([]);
  const [patientID, setPatientID] = useState(props.route.params.patientID);

  const retrieveScreenData = async (id) => {
    const response = await activityApi.getPatientRoutine(id);
    if (response.ok) {
      const rows = (response.data.data || []).map((item) => ({
        activityName: item.activityName || `Activity ${item.activityID ?? ''}`.trim(),
        days: item.days || '',
        startTime: item.startTime || '',
        endTime: item.endTime || '',
      }));
      setTableDataFormated(rows);
    } else {
      console.log('[Routine] Request failed with status code: ', response.status);
      setTableDataFormated([]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (tableDataFormated && tableDataFormated.length !== 0) {
      setHeaderData(['Activity', 'Days', 'Start', 'End']);
      setRowData(
        tableDataFormated.map((item) => [
          item.activityName,
          item.days,
          item.startTime,
          item.endTime,
        ]),
      );
    } else {
      setHeaderData([]);
      setRowData([]);
    }
  }, [tableDataFormated]);

  useEffect(() => {
    retrieveScreenData(patientID);
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
        noDataMessage={() =>
          noDataMessage(null, false, false, 'No routines recorded for this patient.')
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    paddingLeft: 10,
    paddingRight: 10,
  },
});

export default PatientRoutineScreen;
