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
import AddPatientProblemLogModal from 'app/components/AddPatientProblemLogModal';
import AddButton from 'app/components/AddButton';

function PatientProblemLog(props) {
  const [isLoading, setIsLoading] = useState(true);
  const [headerData, setHeaderData] = useState([]);
  const [rowData, setRowData] = useState([]);
  const [widthData, setWidthData] = useState([]);
  const [tableDataFormated, setTableDataFormated] = useState([]);
  const [patientID, setPatientID] = useState(props.route.params.patientID);
  const [showModal, setShowModal] = useState(false);

  const handleAddProblemLog = () => {
    setShowModal(true);
  };

  const handleModalSubmit = async (problemLogData) => {
    const result = await patientApi.AddPatientProblemLog(
      patientID,
      problemLogData,
    );
    if (result.ok) {
      console.log('submitting problem log data', problemLogData);
      retrieveScreenData(patientID);
      setShowModal(false);
    } else {
      console.log('Error submitting problem log data', problemLogData);
    }
  };

  const retrieveScreenData = async (id) => {
    const response = await patientApi.getPatientProblemLog(id);
    if (!response.ok) {
      console.log('Request failed with status code: ', response.status);
      return;
    }

    const sortedData = response.data.data.sort(
      (a, b) => new Date(b.createdDateTime) - new Date(a.createdDateTime),
    );
    const newArray = sortedData.map(
      ({
        createdDateTime,
        authorName,
        problemLogListDesc,
        problemLogRemarks,
      }) => ({
        Date: `${formatDateTime(createdDateTime, true)}`,
        Time: `${formatDateTime(createdDateTime, false)}`,
        Author: authorName,
        Description: problemLogListDesc,
        Remarks: problemLogRemarks,
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
    setWidthData([120, 100, 120, 200, 300]);
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

      <AddButton title="Add Problem" onPress={handleAddProblemLog} />
      <AddPatientProblemLogModal
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

export default PatientProblemLog;
