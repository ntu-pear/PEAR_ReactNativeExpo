// Libs
import React, { useContext, useState } from 'react';
import { Alert, Keyboard, StyleSheet, TouchableOpacity } from 'react-native';
import { FlatList, View } from 'native-base';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

// API
import patientApi from 'app/api/patient';

// Pull the new v1 helpers directly from patientApi
const {
  listPatientMobilityAidsV1,
  addPatientMobilityV1,
  updatePatientMobilityV1,
  deletePatientMobilityV1,
  readPatientV1,
} = patientApi;

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
import MobilityAidItem from 'app/components/MobilityAidItem';
import AddPatientMobilityAidModal from 'app/components/AddPatientMobilityAidModal';

function PatientMobilityAidScreen(props) {
  let { patientID, patientId } = props.route.params;
  if (patientId) {
    patientID = patientId;
  }

  const testID = `mobility_aid_screen_${patientID}`;

  const navigation = useNavigation();

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // either 'add' or 'edit'

  // Options for user to search by
  const SEARCH_OPTIONS = ['Mobility Aid'];

  // Display mode options
  const [displayMode, setDisplayMode] = useState('rows');
  const DISPLAY_MODES = ['rows', 'table'];

  // Sort options
  const SORT_OPTIONS = ['Date'];

  // Filter options
  const FILTER_OPTIONS = ['Date', 'Condition'];

  // Mapping between sort/filter/search names and the respective field in the patient data retrieved from the backend
  const FIELD_MAPPING = {
    'Mobility Aid': 'mobilityListDesc',
    Date: 'date',
    Condition: 'isRecovered',
  };

  // Search, sort, and filter related states
  const [isDataInitialized, setIsDataInitialized] = useState(false);
  const [sort, setSort] = useState(sortFilterInitialState);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdown, setDropdown] = useState(sortFilterInitialState);
  const [datetime, setDatetime] = useState(sortFilterInitialState);

  // Filter details related state
  const [filterOptionDetails, setFilterOptionDetails] = useState({
    Date: {
      type: 'date',
      options: { min: {}, max: {} },
      isFilter: true,
    },
    Condition: {
      type: 'dropdown',
      options: { 'Fully Recovered': true, 'Not Recovered': false },
      isFilter: true,
    },
  });

  // API call related states
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isRetry, setIsRetry] = useState(false);
  const [statusCode, setStatusCode] = useState(200);
  const [isReloadList, setIsReloadList] = useState(true);

  // Mobility aid data related states
  const [originalMobilityData, setOriginalMobilityData] = useState([]);
  const [mobilityData, setMobilityData] = useState([]);
  const [formData, setFormData] = useState({
    // for add/edit form
    mobilityId: null,
    mobilityListId: 1,
    mobilityListDesc: '',
    mobilityRemark: '',
    isRecovered: true,
  });

  // Patient data state
  const [patientData, setPatientData] = useState({});

  // Scrollview state
  const [isScrolling, setIsScrolling] = useState(false);

  // Refresh logic
  useFocusEffect(
    React.useCallback(() => {
      if (isReloadList) {
        refreshMobilityData();
        setIsReloadList(false);
      }
    }, [isReloadList]),
  );

  const refreshMobilityData = () => {
    setIsLoading(true);
    const promiseFunction = async () => {
      await getMobilityData();
      await getPatientData();
    };
    promiseFunction();
  };

  // Get mobility data from backend (v1)
  const getMobilityData = async () => {
    if (!patientID) return;
    try {
      const rows = await listPatientMobilityAidsV1(patientID);
      setOriginalMobilityData([...rows]);
      setMobilityData([...rows]); // already normalized to UI shape
      setIsDataInitialized(true);
      setIsLoading(false);
      setIsError(false);
      setIsRetry(false);
      setStatusCode(200);
    } catch (e) {
      console.log('Mobility list failed', e?.response?.status, e?.message);
      setOriginalMobilityData([]);
      setMobilityData([]);
      setIsLoading(false);
      setIsError(true);
      setStatusCode(e?.response?.status ?? 500);
      setIsRetry(true);
    }
  };

  // (kept for reference; no longer needed since rows are mapped in API layer)
  const parseMobilityData = (tempData) => {
    return tempData.map((item) => ({
      mobilityId: item.mobilityId,
      mobilityListId: item.mobilityListId,
      mobilityRemark: item.mobilityRemark,
      mobilityListDesc: item.mobilityListDesc,
      date: item.date,
      isRecovered: item.isRecovered,
    }));
  };

  // Read patient header (v1)
  const getPatientData = async () => {
    if (!patientID) return;
    try {
      const data = await readPatientV1(patientID);
      setPatientData(data);
      setIsError(false);
      setIsRetry(false);
      setStatusCode(200);
    } catch (e) {
      console.log('Patient read failed', e?.response?.status, e?.message);
      setPatientData({});
      setIsLoading(false);
      setIsError(true);
      setStatusCode(e?.response?.status ?? 500);
      setIsRetry(true);
    }
  };

  // Show form to add mobility aid when add button is clicked
  const handleOnClickAddMobility = () => {
    setIsModalVisible(true);
    setModalMode('add');
  };

  // Submit data to add mobility aid (v1)
  const handleModalSubmitAdd = async (tempMobilityFormData) => {
    setIsLoading(true);

    let alertTitle = '';
    let alertDetails = '';

    const result = await addPatientMobilityV1(patientID, tempMobilityFormData);
    if (result.ok) {
      console.log('submitting mobility aid data', tempMobilityFormData);
      refreshMobilityData();
      setIsModalVisible(false);
      alertTitle = 'Successfully added mobility aid';
    } else {
      const errors = result.data?.message;
      console.log(result);
      result.data
        ? (alertDetails = `\n${errors}\n\nPlease try again.`)
        : (alertDetails = 'Please try again.');
      alertTitle = 'Error adding mobility aid';
    }

    Alert.alert(alertTitle, alertDetails);
  };

  // Edit mobility aid (open modal with selected data)
  const handleEditMobilityAid = (mobilityID) => {
    setIsModalVisible(true);
    setModalMode('edit');

    const tempMobilityData = mobilityData.filter(
      (x) => x.mobilityId == mobilityID,
    )[0];

    setFormData({
      mobilityId: tempMobilityData.mobilityId,
      mobilityListId: tempMobilityData.mobilityListId,
      mobilityListDesc: tempMobilityData.mobilityListDesc,
      mobilityRemark: tempMobilityData.mobilityRemark,
      isRecovered: tempMobilityData.isRecovered,
    });
  };

  // Submit data to edit mobility aid (v1)
  const handleModalSubmitEdit = async () => {
    setIsLoading(true);

    let tempFormData = { ...formData };

    let alertTitle = '';
    let alertDetails = '';

    const result = await updatePatientMobilityV1(patientID, tempFormData);
    if (result.ok) {
      refreshMobilityData();
      setIsModalVisible(false);
      alertTitle = 'Successfully edited mobility aid';
    } else {
      const errors = result.data?.message;
      console.log('Error editing mobility aid');
      result.data
        ? (alertDetails = `\n${errors}\n\nPlease try again.`)
        : (alertDetails = 'Please try again.');
      alertTitle = 'Error editing mobility aid';
    }

    Alert.alert(alertTitle, alertDetails);
  };

  // Ask user to confirm deletion of mobility aid
  const handleDeleteMobilityAid = (mobilityID) => {
    const tempData = mobilityData.filter((x) => x.mobilityId == mobilityID)[0];

    Alert.alert(
      'Are you sure you wish to delete this item?',
      `Mobility Aid: ${tempData.mobilityListDesc}\n` +
        `Remark: ${tempData.mobilityRemark}\n` +
        `Condition: ${
          tempData.isRecovered ? 'Fully Recovered' : 'Not Recovered'
        } \n` +
        `Date: ${formatDate(new Date(tempData.date), true)}`,
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        { text: 'OK', onPress: () => deleteMobilityAid(mobilityID) },
      ],
    );
  };

  // Delete mobility aid (v1)
  const deleteMobilityAid = async (mobilityID) => {
    setIsLoading(true);

    let alertTitle = '';
    let alertDetails = '';

    const result = await deletePatientMobilityV1(patientID, mobilityID);
    if (result.ok) {
      refreshMobilityData();
      setIsModalVisible(false);
      alertTitle = 'Successfully deleted mobility aid';
    } else {
      const errors = result.data?.message;
      console.log('Error deleting mobility aid', result);
      result.data
        ? (alertDetails = `\n${errors}\n\nPlease try again.`)
        : (alertDetails = 'Please try again.');
      alertTitle = 'Error deleting mobility aid';
    }

    Alert.alert(alertTitle, alertDetails);
  };

  // Navigate to patient profile on click profile image
  const onClickProfile = () => {
    navigation.navigate(routes.PATIENT_PROFILE, { id: patientID });
  };

  const getTableRowData = () => {
    return mobilityData.map(({ patientID, mobilityID, ...item }) => {
      const isRecoveredDisplay = item.isRecovered
        ? 'Fully Recovered'
        : 'Not Recovered';

      let rowData = [
        item.mobilityListDesc,
        item.mobilityRemark,
        isRecoveredDisplay,
        formatDate(new Date(item.date), true),
      ];

      return rowData;
    });
  };

  const getTableHeaderData = () => {
    return ['Mobility Aids', 'Remark', 'Condition', 'Date'];
  };

  return isLoading ? (
    <ActivityIndicator visible />
  ) : (
    <View testID={testID} style={styles.container}>
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
            originalList={originalMobilityData}
            setList={setMobilityData}
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
            dropdown={dropdown}
            setDropdown={setDropdown}
            initializeData={isDataInitialized}
            onInitialize={() => setIsDataInitialized(false)}
            itemType="mobility aid"
            itemCount={mobilityData.length}
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
          onRefresh={refreshMobilityData}
          refreshing={isLoading}
          height={'72%'}
          ListEmptyComponent={() =>
            noDataMessage(
              statusCode,
              isLoading,
              isError,
              'No mobility aids found',
              true,
            )
          }
          data={mobilityData}
          keyboardShouldPersistTaps="handled"
          keyExtractor={(item) => item.mobilityId}
          renderItem={({ item }) => {
            return (
              <Swipeable
                setIsScrolling={setIsScrolling}
                onSwipeRight={() => handleDeleteMobilityAid(item.mobilityId)}
                onSwipeLeft={() => handleEditMobilityAid(item.mobilityId)}
                underlay={<EditDeleteUnderlay />}
                item={
                  <TouchableOpacity
                    testID={`${testID}_${item.mobilityId}_touchable`}
                    style={styles.logContainer}
                    activeOpacity={1}
                    disabled={!isScrolling}
                  >
                    <MobilityAidItem
                      testID={`${testID}_${item.mobilityId}`}
                      mobilityRemarks={item.mobilityRemark}
                      isRecovered={item.isRecovered}
                      mobilityListDesc={item.mobilityListDesc}
                      date={item.date}
                      onDelete={() => handleDeleteMobilityAid(item.mobilityId)}
                      onEdit={() => handleEditMobilityAid(item.mobilityId)}
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
            widthData={[200, 200, 200, 200]}
            screenName={'patient mobility aid'}
            noDataMessage={noDataMessage(
              statusCode,
              isLoading,
              isError,
              'No mobility aids found',
              false,
            )}
            del={true}
            edit={true}
          />
        </View>
      )}
      <View style={styles.addBtn}>
        <AddButton
          testID={`${testID}_addMobilityAid`}
          title="Add Mobility Aid"
          onPress={handleOnClickAddMobility}
        />
      </View>
      <AddPatientMobilityAidModal
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

export default PatientMobilityAidScreen;
