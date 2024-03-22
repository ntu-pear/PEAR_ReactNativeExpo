// Libs
import React, { useContext, useState } from 'react';
import { Alert, Keyboard, StyleSheet, TouchableOpacity } from 'react-native';
import { FlatList, View } from 'native-base';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

// API
import patientApi from 'app/api/patient';

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

// Components
import ActivityIndicator from 'app/components/ActivityIndicator';
import AddButton from 'app/components/AddButton';
import ProfileNameButton from 'app/components/ProfileNameButton';
import SearchFilterBar from 'app/components/filter-components/SearchFilterBar';
import LoadingWheel from 'app/components/LoadingWheel';
import Swipeable from 'app/components/swipeable-components/Swipeable';
import EditDeleteUnderlay from 'app/components/swipeable-components/EditDeleteUnderlay';
import DynamicTable from 'app/components/DynamicTable';
import PatientVitalItem from 'app/components/PatientVitalItem';
import AddPatientVitalModalNEW from 'app/components/AddPatientVitalModalNEW';

function PatientVitalScreen(props) {
  let { patientID, patientId } = props.route.params;
  if (patientId) {
    patientID = patientId;
  }
  const navigation = useNavigation();

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'

  // Display mode options
  const [displayMode, setDisplayMode] = useState('rows');
  const DISPLAY_MODES = ['rows', 'table'];

  const SEARCH_OPTIONS = ['Created Datetime'];

  // Sort and Filter options
  const SORT_OPTIONS = ['Created Datetime'];
  const FILTER_OPTIONS = ['Created Datetime'];

  // Mapping for fields
  const FIELD_MAPPING = {
    'Created Datetime': 'createdDateTime',
  };

  // Search, sort, and filter related states
  const [sort, setSort] = useState(sortFilterInitialState);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDataInitialized, setIsDataInitialized] = useState(false);
  const [datetime, setDatetime] = useState(sortFilterInitialState);

  // Filter details state
  const [filterOptionDetails, setFilterOptionDetails] = useState({
    'Created Datetime': {
      type: 'date',
      options: { min: {}, max: {} },
      isFilter: true,
    },
  });

  // API call related states
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isRetry, setIsRetry] = useState(false);
  const [statusCode, setStatusCode] = useState(200);
  const [isReloadList, setIsReloadList] = useState(true);

  const [originalVitalData, setOriginalVitalData] = useState([]);
  const [vitalData, setVitalData] = useState([]);
  const [vitalFormData, setVitalFormData] = useState({
    afterMeal: true,
    temperature: '',
    systolicBP: '',
    diastolicBP: '',
    heartRate: '',
    spO2: '',
    bloodSugarLevel: '',
    height: '',
    weight: '',
    vitalRemarks: '',
  });

  // Patient data state
  const [patientData, setPatientData] = useState({});

  // Scrollview state
  const [isScrolling, setIsScrolling] = useState(false);

  // Refresh logic similar to problem log
  useFocusEffect(
    React.useCallback(() => {
      if (isReloadList) {
        refreshVitalData();
        setIsReloadList(false);
      }
    }, [isReloadList]),
  );

  const refreshVitalData = () => {
    setIsLoading(true);
    const promiseFunction = async () => {
      await getVitalData();
      await getPatientData();
    };
    promiseFunction();
  };

  const getVitalData = async () => {
    // Your API call to get vitals, parsing, and setting state logic here
    if (patientID) {
      const response = await patientApi.getPatientVitalList(patientID);
      if (response.ok) {
        console.log(response.data.data);
        setOriginalVitalData([...response.data.data]);
        setVitalData(parseVitalData([...response.data.data]));
        setIsDataInitialized(true);
        setIsLoading(false);
        setIsError(false);
        setIsRetry(false);
        setStatusCode(response.status);
      } else {
        console.log('Request failed with status code: ', response.status);
        setOriginalVitalData([]);
        setVitalData([]);
        setIsLoading(false);
        setIsError(true);
        setStatusCode(response.status);
        setIsRetry(true);
      }
    }
  };

  // Parse data
  const parseVitalData = (data) => {
    return data.map((item) => ({
      // for add/edit form
      vitalID: item.vitalID,
      temperature: item.temperature,
      weight: item.weight,
      height: item.height,
      systolicBP: item.systolicBP,
      diastolicBP: item.diastolicBP,
      heartRate: item.heartRate,
      spO2: item.spO2,
      bloodSugarLevel: item.bloodSugarlevel,
      vitalRemarks: item.vitalRemarks,
      afterMeal: item.afterMeal,
      createdDateTime: item.createdDateTime,
    }));
  };

  const getPatientData = async () => {
    if (patientID) {
      const response = await patientApi.getPatient(patientID);
      if (response.ok) {
        setPatientData(response.data.data);
        setIsError(false);
        setIsRetry(false);
        setStatusCode(response.status);
      } else {
        console.log('Request failed with status code: ', response.status);
        setPatientData({});
        setIsLoading(false);
        setIsError(true);
        setStatusCode(response.status);
        setIsRetry(true);
      }
    }
  };

  // Handlers for adding, editing, deleting, and form submissions
  const handleOnClickAddVital = () => {
    // Logic to handle opening the modal to add a new vital
    setIsModalVisible(true);
    setModalMode('add');
    setVitalFormData({
      // Reset or set default form data for new entry
      temperature: '',
      weight: '',
      height: '',
      systolicBP: '',
      diastolicBP: '',
      heartRate: '',
      spO2: '',
      bloodSugarLevel: '',
      vitalRemarks: '',
      afterMeal: true,
      // Include additional fields as necessary
    });
  };

  const handleModalSubmitAdd = async (tempVitalFormData) => {
    setIsLoading(true);

    const result = await patientApi.AddPatientVital(
      patientID,
      userID,
      tempVitalFormData,
    );
    if (result.ok) {
      refreshVitalData();
      setIsModalVisible(false);
      Alert.alert('Success', 'Vital added successfully');
    } else {
      Alert.alert('Error', 'Failed to add vital');
    }

    setIsLoading(false);
  };

  const handleEditVital = (vitalID) => {
    setIsModalVisible(true);
    setModalMode('edit');

    const tempVitalData = vitalData.find((v) => v.id === vitalID); // Assuming each vital entry has a unique `id`
    if (tempVitalData) {
      setVitalFormData(tempVitalData);
    }
  };

  const handleModalSubmitEdit = async () => {
    setIsLoading(true);

    const result = await patientApi.updatePatientVital(
      patientID,
      userID,
      vitalFormData,
    ); // Assuming this API call exists
    if (result.ok) {
      refreshVitalData();
      setIsModalVisible(false);
      Alert.alert('Success', 'Vital updated successfully');
    } else {
      Alert.alert('Error', 'Failed to update vital');
    }

    setIsLoading(false);
  };

  const handleDeleteVital = async (vitalID) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this vital?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'OK',
          onPress: async () => {
            setIsLoading(true);

            const result = await patientApi.deletePatientVital(
              patientID,
              vitalID,
            ); // Assuming this API call exists
            if (result.ok) {
              refreshVitalData();
              Alert.alert('Deleted', 'Vital deleted successfully');
            } else {
              Alert.alert('Error', 'Failed to delete vital');
            }

            setIsLoading(false);
          },
        },
      ],
    );
  };

  // Navigate to patient profile on click profile image
  const onClickProfile = () => {
    navigation.navigate(routes.PATIENT_PROFILE, { id: patientID });
  };

  const getTableRowData = () => {
    return vitalData.map(({ patientID, vitalID, ...item }) => {
      // Directly map 'afterMeal' to 'Yes' or 'No'
      const afterMealDisplay = item.afterMeal ? 'Yes' : 'No';

      // Convert the rest of the item properties and handle the date separately
      let rowData = [
        item.temperature,
        item.systolicBP,
        item.diastolicBP,
        item.heartRate,
        item.spO2,
        item.bloodSugarlevel,
        item.height,
        item.weight,
        item.vitalRemarks,
        afterMealDisplay,
        formatDate(new Date(item.createdDateTime), true), // Assuming formatDate() formats the date as needed
      ];

      return rowData;
    });
  };

  const getTableHeaderData = () => {
    return [
      'Temperature (°C)',
      'Systolic BP (mmHg)',
      'Diastolic BP (mmHg)',
      'Heart Rate (bpm)',
      'SpO2 (%)',
      'Blood Sugar (mg/dL)',
      'Height (cm)',
      'Weight (kg)',
      'Remarks',
      'After Meal',
      'Date',
    ];
  };

  return isLoading ? (
    <ActivityIndicator visible />
  ) : (
    <View style={styles.container}>
      <View style={{ justifyContent: 'space-between' }}>
        <View style={{ alignSelf: 'center', marginTop: 15, maxHeight: 120 }}>
          {!isEmptyObject(patientData) ? (
            <ProfileNameButton
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
            originalList={originalVitalData}
            setList={setVitalData}
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
            itemType="Vital"
            itemCount={vitalData.length}
            displayMode={displayMode}
            setDisplayMode={setDisplayMode}
            DISPLAY_MODES={DISPLAY_MODES}
          />
        </View>
      </View>
      {displayMode == 'rows' ? (
        <FlatList
          onTouchStart={() => Keyboard.dismiss()}
          onScrollBeginDrag={() => setIsScrolling(true)}
          onScrollEndDrag={() => setIsScrolling(false)}
          onRefresh={refreshVitalData}
          refreshing={isLoading}
          height={'72%'}
          ListEmptyComponent={() =>
            noDataMessage(
              statusCode,
              isLoading,
              isError,
              'No Vitals found',
              true,
            )
          }
          data={vitalData}
          keyboardShouldPersistTaps="handled"
          keyExtractor={(item) => item.VitalID}
          renderItem={({ item }) => {
            return (
              <Swipeable
                setIsScrolling={setIsScrolling}
                onSwipeRight={() => handleDeleteVital(item.VitalID)}
                onSwipeLeft={() => handleEditLog(item.VitalID)}
                underlay={<EditDeleteUnderlay />}
                item={
                  <TouchableOpacity
                    style={styles.logContainer}
                    activeOpacity={1}
                    disabled={!isScrolling}
                  >
                    <PatientVitalItem
                      temperature={item.temperature}
                      weight={item.weight}
                      height={item.height}
                      systolicBP={item.systolicBP}
                      diastolicBP={item.diastolicBP}
                      heartRate={item.heartRate}
                      spO2={item.spO2}
                      bloodSugarlevel={item.bloodSugarlevel}
                      vitalRemarks={item.vitalRemarks}
                      afterMeal={item.afterMeal}
                      createdDateTime={item.createdDateTime}
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
            widthData={[180, 200, 200, 180, 100, 200, 120, 120, 200, 150, 150]}
            screenName={'Patient Vital'}
            onClickDelete={handleDeleteVital}
            onClickEdit={handleEditVital}
            noDataMessage={noDataMessage(
              statusCode,
              isLoading,
              isError,
              'No vitals found',
              false,
            )}
            del={true}
            edit={true}
          />
        </View>
      )}
      <View style={styles.addBtn}>
        <AddButton title="Add Vital Data" onPress={handleOnClickAddVital} />
      </View>
      <AddPatientVitalModalNEW
        showModal={isModalVisible}
        modalMode={modalMode}
        vitalFormData={vitalFormData}
        setVitalFormData={setVitalFormData}
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
    backgroundColor: colors.white_var1,
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

export default PatientVitalScreen;
