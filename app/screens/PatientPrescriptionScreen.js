// Libs
import React, { useContext, useRef, useEffect, useState } from 'react';
import {
  Alert,
  Keyboard,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import { FlatList, View } from 'native-base';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

// API
import patientApi from 'app/api/patient';
import AuthContext from 'app/auth/context';
import { currentUserId } from 'app/utility/medicationAdminister';
import { readAllPages } from 'app/utility/pagedRead';
import requestDeadline from 'app/utility/requestDeadline';
import { patientFromApiResponse } from 'app/utility/patientHeader';

// Utilities
import {
  isEmptyObject,
  noDataMessage,
  sortFilterInitialState,
  formatDate,
} from 'app/utility/miscFunctions';

// Navigation
import routes from 'app/navigation/routes';

// Configurations
import colors from 'app/config/colors';

// Hooks
import formatDateTime from 'app/hooks/useFormatDateTime.js';

// Components
import DynamicTable from 'app/components/DynamicTable';
import ActivityIndicator from 'app/components/ActivityIndicator';
import AddButton from 'app/components/AddButton';
import SearchFilterBar from 'app/components/filter-components/SearchFilterBar';
import LoadingWheel from 'app/components/LoadingWheel';
import Swipeable from 'app/components/swipeable-components/Swipeable';
import EditDeleteUnderlay from 'app/components/swipeable-components/EditDeleteUnderlay';
import ProfileNameButton from 'app/components/ProfileNameButton';
import PrescriptionItem from 'app/components/PrescriptionItem';
import AddPatientPrescriptionModal from 'app/components/AddPatientPrescriptionModal';

function PatientPrescriptionScreen(props) {
  let { patientID, patientId } = props.route.params;
  if (patientId) {
    patientID = patientId;
  }

  const testID = `prescription_screen_${patientID}`;

  const navigation = useNavigation();
  const { user } = useContext(AuthContext) || {};
  const saving = useRef(false);
  const readGeneration = useRef(0);

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // either 'add' or 'edit'

  // API call related states
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isRetry, setIsRetry] = useState(false);
  const [statusCode, setStatusCode] = useState(200);

  //Prescription data related states
  const [originalPrescriptionData, setOriginalPrescriptionData] = useState([]);
  const [prescriptionData, setPrescriptionData] = useState([]);
  const [formData, setFormData] = useState({
    // for add/edit form
    prescriptionID: null,
    prescriptionListID: null,
    dosage: '',
    frequencyPerDay: 1,
    isChronic: true,
    instruction: '',
    startDate: new Date(),
    endDate: new Date(),
    afterMeal: true,
    prescriptionRemarks: '',
    prescriptionListDesc: '',
  });

  // Patient data related states
  const [patientData, setPatientData] = useState({});

  // Scrollview state
  const [isScrolling, setIsScrolling] = useState(false);

  // Options for user to search by
  const SEARCH_OPTIONS = ['Drug Name'];

  // Display mode options
  const [displayMode, setDisplayMode] = useState('rows');
  const DISPLAY_MODES = ['rows', 'table'];

  // Sort options
  const SORT_OPTIONS = ['Date'];

  // Filter options
  const FILTER_OPTIONS = ['Date'];

  // Mapping between sort/filter/search names and the respective field in the patient data retrieved from the backend
  const FIELD_MAPPING = {
    'Drug Name': 'prescriptionListDesc',
    Date: 'date',
  };

  // Search, sort, and filter related states
  const [isDataInitialized, setIsDataInitialized] = useState(false);
  const [sort, setSort] = useState(sortFilterInitialState);
  const [searchQuery, setSearchQuery] = useState('');
  const [datetime, setDatetime] = useState(sortFilterInitialState);

  const [filterOptionDetails, setFilterOptionDetails] = useState({
    Date: {
      type: 'date',
      options: { min: {}, max: {} },
      isFilter: true,
    },
  });

  // Refresh list when new medication is added or user requests refresh
  const refreshPrescriptionData = React.useCallback(async () => {
    const generation = ++readGeneration.current;
    setIsLoading(true);
    setOriginalPrescriptionData([]);
    setPrescriptionData([]);
    setPatientData({});
    try {
      const [rows, catalogue, header] = await Promise.all([
        readAllPages(
          (p) => patientApi.listPatientPrescriptionsV1(patientID, p),
          { idOf: (r) => r.prescriptionID },
        ),
        readAllPages(patientApi.getPrescriptionListV1),
        requestDeadline(patientApi.getPatient(patientID)),
      ]);
      if (generation !== readGeneration.current) {
        return;
      }
      const patient = header?.ok ? patientFromApiResponse(header) : {};
      if (
        !header?.ok ||
        String(patient.patientID ?? patient.id) !== String(patientID)
      ) {
        throw new Error('The patient header could not be verified.');
      }
      const names = new Map(catalogue.map((r) => [String(r.Id), r.Value]));
      if (rows.some((r) => String(r.patientID) !== String(patientID))) {
        throw new Error('Prescriptions belong to a different patient.');
      }
      const joined = rows
        .filter((r) => !r.isDeleted)
        .map((r) => ({
          ...r,
          prescriptionListDesc:
            names.get(String(r.prescriptionListID)) ||
            r.prescriptionListDesc ||
            'Drug name unavailable',
        }));
      setOriginalPrescriptionData(joined);
      setPrescriptionData(joined);
      setPatientData(patient);
      setIsDataInitialized(true);
      setIsError(false);
      setIsRetry(false);
      setStatusCode(200);
    } catch (error) {
      if (generation === readGeneration.current) {
        setIsError(true);
        setIsRetry(true);
        setStatusCode(error.status);
      }
    } finally {
      if (generation === readGeneration.current) {
        setIsLoading(false);
      }
    }
  }, [patientID]);
  useFocusEffect(
    React.useCallback(() => {
      refreshPrescriptionData();
      return () => {
        readGeneration.current += 1;
      };
    }, [refreshPrescriptionData]),
  );

  // Show form to add prescription when add button is clicked
  const handleOnClickAddPrescription = () => {
    setIsModalVisible(true);
    setModalMode('add');
  };

  // Submit data to add prescription
  const handleModalSubmitAdd = async (tempPrescriptionFormData) => {
    if (saving.current) {
      return;
    }
    saving.current = true;
    setIsLoading(true);

    let alertTitle = '';
    let alertDetails = '';

    const result = await patientApi.addPatientPrescriptionV1(
      patientID,
      tempPrescriptionFormData,
      currentUserId(user),
    );

    if (result.ok) {
      await refreshPrescriptionData();
      setIsModalVisible(false);

      alertTitle = 'Successfully added prescription';
    } else {
      const errors =
        result.data?.detail ||
        result.data?.message ||
        'The prescription change was not confirmed. Check the records before trying again.';

      alertDetails =
        typeof errors === 'string'
          ? errors
          : 'The change was not confirmed. Check the records before trying again.';

      alertTitle = 'Error adding prescription';
    }

    saving.current = false;
    setIsLoading(false);
    Alert.alert(alertTitle, alertDetails);
  };

  // Edit Prescription
  const handleEditPrescription = (prescriptionID) => {
    setIsModalVisible(true);
    setModalMode('edit');

    const tempPrescriptionFormData = prescriptionData.filter(
      (x) => x.prescriptionID == prescriptionID,
    )[0];

    setFormData({
      prescriptionID: tempPrescriptionFormData.prescriptionID,
      prescriptionListID: tempPrescriptionFormData.prescriptionListID,
      dosage: tempPrescriptionFormData.dosage,
      frequencyPerDay: tempPrescriptionFormData.frequencyPerDay.toString(),
      isChronic: tempPrescriptionFormData.isChronic,
      instruction: tempPrescriptionFormData.instruction,
      startDate: new Date(tempPrescriptionFormData.startDate),
      endDate: tempPrescriptionFormData.endDate
        ? new Date(tempPrescriptionFormData.endDate)
        : null,
      afterMeal: tempPrescriptionFormData.afterMeal,
      prescriptionRemarks: tempPrescriptionFormData.prescriptionRemarks,
      prescriptionListDesc: tempPrescriptionFormData.prescriptionListDesc,
    });
  };

  // Submit data to edit prescription
  const handleModalSubmitEdit = async () => {
    if (saving.current) {
      return;
    }
    saving.current = true;
    setIsLoading(true);

    let tempFormData = { ...formData };

    let alertTitle = '';
    let alertDetails = '';

    const result = await patientApi.updatePatientPrescriptionV1(
      patientID,
      formData.prescriptionID,
      tempFormData,
      currentUserId(user),
    );
    if (result.ok) {
      await refreshPrescriptionData();
      setIsModalVisible(false);

      alertTitle = 'Successfully edited prescription';
    } else {
      const errors =
        result.data?.detail ||
        result.data?.message ||
        'The prescription change was not confirmed. Check the records before trying again.';

      alertDetails =
        typeof errors === 'string'
          ? errors
          : 'The change was not confirmed. Check the records before trying again.';

      alertTitle = 'Error editing prescription';
    }

    saving.current = false;
    setIsLoading(false);
    Alert.alert(alertTitle, alertDetails);
  };

  // Ask user to confirm deletion of prescription
  const handleDeletePrescription = (prescriptionID) => {
    const tempData = prescriptionData.filter(
      (x) => x.prescriptionID == prescriptionID,
    )[0];

    Alert.alert(
      'Are you sure you wish to delete this item?',
      `Date: ${formatDateTime(new Date(tempData.date), true)}\n` +
        `Time: ${formatDateTime(new Date(tempData.date), false)}\n` +
        `Drug Name: ${tempData.prescriptionListDesc}\n` +
        `Dosage: ${tempData.dosage}\n` +
        `Frequency Per Day: ${tempData.frequencyPerDay}\n` +
        `Instruction: ${tempData.instruction}\n` +
        `Start Date: ${formatDate(new Date(tempData.startDate), true)}\n` +
        `End Date: ${
          tempData.endDate
            ? formatDate(new Date(tempData.endDate), true)
            : 'Ongoing'
        }\n` +
        `After Meal: ${
          tempData.afterMeal == null
            ? 'Does not matter'
            : tempData.afterMeal
            ? 'After Meal'
            : 'Before Meal'
        } \n` +
        `Remarks: ${tempData.prescriptionRemarks}\n` +
        `Chronic: ${
          tempData.isChronic == null
            ? 'Unspecified'
            : tempData.isChronic
            ? 'Long Term'
            : 'Short Term'
        } \n`,
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        { text: 'OK', onPress: () => deletePrescription(prescriptionID) },
      ],
    );
  };

  // Delete Prescription
  const deletePrescription = async (prescriptionID) => {
    if (saving.current) {
      return;
    }
    saving.current = true;
    setIsLoading(true);

    let tempData = { prescriptionID: prescriptionID };

    let alertTitle = '';
    let alertDetails = '';

    const result = await patientApi.deletePatientPrescriptionV1(
      patientID,
      prescriptionID,
    );
    if (result.ok) {
      await refreshPrescriptionData();
      setIsModalVisible(false);

      alertTitle = 'Successfully deleted prescription';
    } else {
      const errors =
        result.data?.detail ||
        result.data?.message ||
        'The prescription change was not confirmed. Check the records before trying again.';

      alertDetails =
        typeof errors === 'string'
          ? errors
          : 'The change was not confirmed. Check the records before trying again.';

      alertTitle = 'Error deleting prescription';
    }

    saving.current = false;
    setIsLoading(false);
    Alert.alert(alertTitle, alertDetails);
  };

  // Navigate to patient profile on click profile image
  const onClickProfile = () => {
    navigation.navigate(routes.PATIENT_PROFILE, { id: patientID });
  };

  //Prescription data related states
  const getTableRowData = () => {
    return prescriptionData.map(({ patientID, prescriptionID, ...item }) => {
      // Directly map the 2 conditions accordingly
      const afterMeal =
        item.afterMeal == null
          ? 'Does not matter'
          : item.afterMeal
          ? 'Yes'
          : 'No';
      const isChronic =
        item.isChronic == null ? 'Unspecified' : item.isChronic ? 'Yes' : 'No';

      // Convert the rest of the item properties and handle the date separately
      let rowData = [
        formatDateTime(new Date(item.date), true),
        formatDateTime(new Date(item.date), false),
        item.prescriptionListDesc,
        item.dosage,
        item.frequencyPerDay,
        item.instruction,
        formatDate(new Date(item.startDate), true), // Assuming formatDate() formats the date as needed
        item.endDate ? formatDate(new Date(item.endDate), true) : 'Ongoing',
        afterMeal,
        item.prescriptionRemarks,
        isChronic,
      ];

      return rowData;
    });
  };

  const getTableHeaderData = () => {
    return [
      'Date',
      'Time',
      'Drug Name',
      'Dosage',
      'Frequency Per Day',
      'Instruction',
      'Start Date',
      'End Date',
      'After Meal',
      'Remarks',
      'Chronic',
    ];
  };

  return isLoading ? (
    <ActivityIndicator visible />
  ) : (
    <View testID={testID} style={styles.container}>
      {isError && (
        <TouchableOpacity
          testID="home_prescription_retry"
          onPress={refreshPrescriptionData}
        >
          <Text>
            Prescription records could not be loaded. Retry prescriptions
          </Text>
        </TouchableOpacity>
      )}
      <View style={{ justifyContent: 'space-between' }}>
        <View style={{ alignSelf: 'center', marginTop: 15, maxHeight: 120 }}>
          {!isEmptyObject(patientData) ? (
            <ProfileNameButton
              testID={`${testID}_profileNameButton`}
              profilePicture={patientData.profilePicture}
              profileLineOne={patientData.preferredName}
              profileLineTwo={
                patientData.firstName + ' ' + patientData.lastName
              }
              handleOnPress={onClickProfile}
              isPatient
              isVertical={false}
              size={90}
            />
          ) : (
            <LoadingWheel />
          )}
        </View>
        <View>
          <SearchFilterBar
            originalList={originalPrescriptionData}
            setList={setPrescriptionData}
            SEARCH_OPTIONS={SEARCH_OPTIONS}
            FIELD_MAPPING={FIELD_MAPPING}
            SORT_OPTIONS={SORT_OPTIONS}
            FILTER_OPTIONS={FILTER_OPTIONS}
            filterOptionDetails={filterOptionDetails}
            datetime={datetime}
            setDatetime={setDatetime}
            sort={sort}
            setSort={setSort}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            initializeData={isDataInitialized}
            onInitialize={() => setIsDataInitialized(false)}
            itemType="prescription"
            itemCount={prescriptionData.length}
            displayMode={displayMode}
            setDisplayMode={setDisplayMode}
            DISPLAY_MODES={DISPLAY_MODES}
          />
        </View>
      </View>
      {displayMode == 'rows' ? (
        <FlatList
          testID={`${testID}_flatlist`}
          onTouchStart={() => Keyboard.dismiss()}
          onScrollBeginDrag={() => setIsScrolling(true)}
          onScrollEndDrag={() => setIsScrolling(false)}
          onRefresh={refreshPrescriptionData}
          refreshing={isLoading}
          height={'72%'}
          ListEmptyComponent={() =>
            noDataMessage(
              statusCode,
              isLoading,
              isError,
              'No prescriptions found',
              true,
            )
          }
          data={prescriptionData}
          keyboardShouldPersistTaps="handled"
          keyExtractor={(item) => item.prescriptionID}
          renderItem={({ item }) => {
            return (
              <Swipeable
                setIsScrolling={setIsScrolling}
                onSwipeRight={() =>
                  handleDeletePrescription(item.prescriptionID)
                }
                onSwipeLeft={() => handleEditPrescription(item.prescriptionID)}
                underlay={<EditDeleteUnderlay />}
                item={
                  <TouchableOpacity
                    testID={`${testID}_${item.prescriptionID}_touchable`}
                    style={styles.logContainer}
                    activeOpacity={1}
                    disabled={!isScrolling}
                  >
                    <PrescriptionItem
                      testID={`${testID}_${item.prescriptionID}`}
                      date={item.date}
                      prescriptionListDesc={item.prescriptionListDesc}
                      dosage={item.dosage}
                      frequencyPerDay={item.frequencyPerDay}
                      instruction={item.instruction}
                      startDate={item.startDate}
                      endDate={item.endDate}
                      afterMeal={item.afterMeal}
                      prescriptionRemarks={item.prescriptionRemarks}
                      isChronic={item.isChronic}
                      onDelete={() =>
                        handleDeletePrescription(item.prescriptionID)
                      }
                      onEdit={() => handleEditPrescription(item.prescriptionID)}
                    />
                  </TouchableOpacity>
                }
              />
            );
          }}
        />
      ) : (
        <View style={{ height: '72%', marginBottom: 20, marginHorizontal: 40 }}>
          <DynamicTable
            headerData={getTableHeaderData()}
            rowData={getTableRowData()}
            widthData={[120, 100, 130, 100, 200, 300, 120, 120, 120, 300, 100]}
            screenName={'patient prescription'}
            noDataMessage={noDataMessage(
              statusCode,
              isLoading,
              isError,
              'No prescriptions found',
              false,
            )}
            del={true}
            edit={true}
          />
        </View>
      )}
      <View style={styles.addBtn}>
        <AddButton
          testID={`${testID}_addPrescription`}
          title="Add Prescription"
          onPress={handleOnClickAddPrescription}
        />
      </View>
      <AddPatientPrescriptionModal
        testID={`${testID}_modal_${modalMode === 'add' ? 'add' : 'edit'}`}
        showModal={isModalVisible}
        modalMode={modalMode}
        formData={formData}
        setFormData={setFormData}
        onClose={() => setIsModalVisible(false)}
        onSubmit={
          modalMode == 'add' ? handleModalSubmitAdd : handleModalSubmitEdit
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
  },
  logContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  addBtn: {
    marginTop: '0.01%',
  },
});

export default PatientPrescriptionScreen;
