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
import AddPatientAllergyModal from 'app/components/AddPatientAllergyModal';

function PatientAllergyScreen(props) {
  const [isLoading, setIsLoading] = useState(true);
  const [headerData, setHeaderData] = useState([]);
  const [rowData, setRowData] = useState([]);
  const [widthData, setWidthData] = useState([]);
  const [tableDataFormated, setTableDataFormated] = useState([]);
  const [patientID, setPatientID] = useState(props.route.params.patientId);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [patientAllergyIDs, setPatientAllergyIDs] = useState([]);

  const handleAddAllergy = () => {
    setShowModal(true);
  };

  const handleModalSubmit = async (allergyData) => {
    const result = await patientApi.AddPatientAllergy(patientID, allergyData);
    if (result.ok) {
      console.log('submitting allergy data', allergyData);
      retrieveAllergyData(patientID);
      setShowModal(false);
    } else {
      console.log('Error submitting allergy data', allergyData);
    }
  };

  const retrieveAllergyData = async (id) => {
    const response = await patientApi.getPatientAllergy(id);
    if (!response.ok) {
      console.log('Request failed with status code: ', response.status);
      return;
    }

    const sortedData = response.data.data.sort(
      (a, b) => new Date(b.createdDate) - new Date(a.createdDate),
    );

    const newArray = sortedData.map(
      ({ createdDate, allergyListDesc, allergyReaction, allergyRemarks }) => ({
        Date: `${formatDateTime(createdDate, true)}`,
        Time: `${formatDateTime(createdDate, false)}`,
        'Allergic To': allergyListDesc,
        Reaction: allergyReaction,
        Notes: allergyRemarks,
      }),
    );
    setTableDataFormated(newArray);

    // Get the allergy IDs
    const allergyIDs = response.data.data.map(
      (allergy) => allergy.allergyListID,
    );
    setPatientAllergyIDs(allergyIDs);

    // debugging - joel
    console.log('Existing Allergy IDs passed', allergyIDs);

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
    if (props.route.params.patientId) {
      retrieveAllergyData(patientID);
      console.log('patient ID Log from retrieve screen data', patientID);
      setWidthData([120, 100, 120, 200, 300]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator visible />
      ) : (
        <View style={styles.cardContainer}>
          <DynamicTable
            headerData={headerData}
            rowData={rowData}
            widthData={widthData}
            screenName={'patient allergy'}
          />
        </View>
      )}
      {/* "Add Allergy" button */}
      <AddButton title="Add Allergy" onPress={handleAddAllergy} />
      <AddPatientAllergyModal
        showModal={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleModalSubmit}
        existingAllergyIDs={patientAllergyIDs}
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

export default PatientAllergyScreen;
