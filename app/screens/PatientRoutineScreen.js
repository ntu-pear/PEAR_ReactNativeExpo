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

function PatientRoutineScreen(props) {
  const [isLoading, setIsLoading] = useState(true);
  const [headerData, setHeaderData] = useState([]);
  const [rowData, setRowData] = useState([]);
  const [widthData, setWidthData] = useState([]);
  const [tableDataFormated, setTableDataFormated] = useState([]);
  const [patientID, setPatientID] = useState(props.route.params.patientID);

  const retrieveScreenData = async (id) => {
    const response = await patientApi.getPatientRoutine(id);
    if (!response.ok) {
      console.log('Request failed with status code: ', response.status);
      return;
    }

    if (response.data.data !== null){
      const newArray = response.data.data.map(({ 
        startDate, endDate, activityTitle, activityDesc, routineIssues, includeInSchedule
      }) => ({
        "Date": `${formatDateTime(startDate, true)}`,
        "Start Time": `${formatDateTime(startDate, false)}`,
        "End Time": `${formatDateTime(endDate, false)}`,
        "Activity Title": activityTitle,
        "Activity Description": activityDesc,
        "Routine Issues": routineIssues,
        "Was Scheduled": includeInSchedule ? 'Yes' : 'No',
      }));
      setTableDataFormated(newArray);
    } else {
      setTableDataFormated([]);
    }
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
    setWidthData([120, 120, 120, 150, 200, 150, 150]);
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
