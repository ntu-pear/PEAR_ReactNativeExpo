// Libs
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { View } from 'native-base';

// API
import patientApi from 'app/api/patient';

// Components
import DynamicTable from 'app/components/DynamicTable';
import ActivityIndicator from 'app/components/ActivityIndicator';

function PatientProblemLog(props) {
  const [isLoading, setIsLoading] = useState(true);
  const [headerData, setHeaderData] = useState([]);
  const [rowData, setRowData] = useState([]);
  const [widthData, setWidthData] = useState([]);
  const [tableDataFormated, setTableDataFormated] = useState([]);
  const [patientID, setPatientID] = useState(props.route.params.patientID);

  const retrieveScreenData = async (id) => {
    const response = await patientApi.getPatientProblemLog(id);
    if (!response.ok) {
      console.log('Request failed with status code: ', response.status);
      return;
    }
    const newArray = response.data.data.map(({ authorName, problemLogListDesc, problemLogRemarks }) => ({
      "Author": authorName,
      "Description": problemLogListDesc,
      "Remarks": problemLogRemarks,
    }));
    setTableDataFormated(newArray);
  };

  useEffect(() => {
    if (tableDataFormated !== undefined && tableDataFormated.length !== 0) {
      setHeaderData(Object.keys(tableDataFormated[0]));
      
      const finalArray = tableDataFormated.map((item) => {
        return Object.values(item).map((value) => value.toString());
      });
      setRowData(finalArray);
      setIsLoading(false);
    }
  }, [tableDataFormated]);

  useEffect(() => {
    retrieveScreenData(patientID);
    setWidthData([120, 200, 300]);
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
        screenName={'patient problem'}
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

export default PatientProblemLog;
