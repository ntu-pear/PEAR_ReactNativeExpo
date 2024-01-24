// Libs
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { View } from 'native-base';

// API
import patientApi from 'app/api/patient';

// Hooks
import formatDateTime from 'app/hooks/useFormatDateTime.js';
import useGetSelectionOptions from 'app/hooks/useGetSelectionOptions';

// Components
import DynamicTable from 'app/components/DynamicTable';
import ActivityIndicator from 'app/components/ActivityIndicator';
import AddButton from 'app/components/AddButton';
import AllergyFormModal from 'app/components/AddPatientAllergyModal';

function PatientAllergyScreen(props) {
  const [isLoading, setIsLoading] = useState(true);
  const [headerData, setHeaderData] = useState([]);
  const [rowData, setRowData] = useState([]);
  const [widthData, setWidthData] = useState([]);
  const [tableDataFormated, setTableDataFormated] = useState([]);
  const [patientID, setPatientID] = useState(props.route.params.patientId);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const { data: allergies } = useGetSelectionOptions('Allergy');
  const { data: reactions } = useGetSelectionOptions('AllergyReaction');

  const handleAddAllergy = () => {
    setShowModal(true);
  };

  const handleModalSubmit = async (allergyData) => {
    //TODO : Process allergyData
    setShowModal(false);
  };

  const retrieveScreenData = async (id) => {
    const response = await patientApi.getPatientAllergy(id);
    if (!response.ok) {
      console.log('Request failed with status code: ', response.status);
      return;
    }

    const newArray = response.data.data.map(
      ({ createdDate, allergyListDesc, allergyReaction, allergyRemarks }) => ({
        Date: `${formatDateTime(createdDate, true)}`,
        Time: `${formatDateTime(createdDate, false)}`,
        'Allergic To': allergyListDesc,
        Reaction: allergyReaction,
        Notes: allergyRemarks,
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
    if (props.route.params.patientId) {
      retrieveScreenData(patientID);
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
      <AddButton
        title="Add Allergy"
        onPress={handleAddAllergy}
        // color="green"
      />
      <AllergyFormModal
        showModal={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleModalSubmit}
        allergies={allergies}
        reactions={reactions}
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
