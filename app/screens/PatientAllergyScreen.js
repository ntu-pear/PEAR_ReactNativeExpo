// Libs
import React, { useState, useCallback } from 'react';
import { Alert, StyleSheet, View, FlatList, TouchableOpacity, Keyboard } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

// API
import patientApi from 'app/api/patient';

// Utilities
import { isEmptyObject, noDataMessage , sortFilterInitialState} from 'app/utility/miscFunctions';

// Navigation
import routes from 'app/navigation/routes';

// Configurations
import colors from 'app/config/colors';

// Hooks
import formatDateTime from 'app/hooks/useFormatDateTime.js';

// Components
import ActivityIndicator from 'app/components/ActivityIndicator';
import AddButton from 'app/components/AddButton';
import AddPatientAllergyModal from 'app/components/AddPatientAllergyModal';
import ProfileNameButton from 'app/components/ProfileNameButton';
import SearchFilterBar from 'app/components/filter-components/SearchFilterBar';
import LoadingWheel from 'app/components/LoadingWheel';
import DynamicTable from 'app/components/DynamicTable';
import Swipeable from 'app/components/swipeable-components/Swipeable';
import EditDeleteUnderlay from 'app/components/swipeable-components/EditDeleteUnderlay';
import PatientAllergyItem from 'app/components/PatientAllergyItem'; 

function PatientAllergyScreen(props) {
  let {patientID, patientId} = props.route.params;
  if (patientId) {
    patientID = patientId;
  }
  const navigation = useNavigation();

  // Options for user to search by
  const SEARCH_OPTIONS = ['Allergy'];

  // Display mode options  
  const [displayMode, setDisplayMode] = useState('rows');
  const DISPLAY_MODES = ['rows', 'table'];

  // Sort options 
  const SORT_OPTIONS = ['Date'];

  // Filter options
  const FILTER_OPTIONS = ['Date'];
  
  // Mapping between sort/filter/search names and the respective field in the patient data retrieved from the backend
  const FIELD_MAPPING = {
    'Allergy': 'allergyListDesc',
    'Reaction': 'allergyReaction',
    'Date': 'createdDate',
  };

  // Search, sort, and filter related states
  const [isDataInitialized, setIsDataInitialized] = useState(false);
  const [sort, setSort] = useState(sortFilterInitialState);
  const [searchQuery, setSearchQuery] = useState('');
  const [datetime, setDatetime] = useState(sortFilterInitialState);

  // Filter details related state
  // Details of filter options
  // --------------------------
  // type - chip | dropdown | autocomplete (what kind of UI/component to use to display the filter)
  // options - {} | custom dict that maps options for filtering to corresponding values in the patient data
  //                e.g.: {'Active': true, 'Inactive': false, 'All': undefined} for filter corresponding to isActive
  //                      where 'Active' filter option corresponds to isActive=true etc.
  // isFilter - whether the filter is actually to be used for filtering,
  //            since some filters like patient status may be used to make an API call instead of normal filtering
  // --------------------------
  const [filterOptionDetails, setFilterOptionDetails] = useState({
    'Date': {
      'type': 'date',
      'options': {'min': {}, 'max': {}},
      'isFilter': true,
    },
  });

  // API call related states
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isRetry, setIsRetry] = useState(false);
  const [statusCode, setStatusCode] = useState(200);

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // either 'add' or 'edit'

  const [isScrolling, setIsScrolling] = useState(false);
  const [patientAllergyIDs, setPatientAllergyIDs] = useState([]);

  const [patientData, setPatientData] = useState({});
  const [isReloadPatientList, setIsReloadPatientList] = useState(true);

  // Allergy data related states
  const [originalAllergyData, setOriginalAllergyData] = useState([]);
  const [allergyData, setAllergyData] = useState([]);
  const [allergyFormData, setAllergyFormData] = useState({
    "allergyID": null,
    "allergyListID": 1,
    "allergyListDesc": "",
    "allergyReaction" : "",
    "allergyRemarks": "",
  });

  useFocusEffect(
    useCallback(() => {
      if (isReloadPatientList) {
        refreshAllergyData();
        setIsReloadPatientList(false);
      }
    }, [isReloadPatientList])
  );

  const refreshAllergyData = () => {
    setIsLoading(true);
    const promiseFunction = async () => {
      await getAllergyData();
      await getPatientData();
    };
    promiseFunction();
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

  // Get allergy data from backend
  const getAllergyData = async () => {
    if (patientID) {
      const response = await patientApi.getPatientAllergy(patientID);
      if (response.ok) {
        console.log(response.data.data)
        setOriginalAllergyData([...response.data.data]);    
        setAllergyData(parseAllergyData([...response.data.data]));
        // Extract existing allergy IDs
        const allergyIDs = response.data.data.map(
        (allergy) => allergy.allergyListID
        );
        setPatientAllergyIDs(allergyIDs);    
        setIsDataInitialized(true);
        setIsLoading(false);  
        setIsError(false);
        setIsRetry(false);
        setStatusCode(response.status);
      } else {
        console.log('Request failed with status code: ', response.status);
        setOriginalAllergyData([]);
        setAllergyData([]);
        setPatientAllergyIDs([]);  // Reset allergy IDs
        setIsLoading(false);
        setIsError(true);
        setStatusCode(response.status);
        setIsRetry(true);
      }
    }
  };

  // Parse data
  const parseAllergyData = (tempData) => {
    return tempData.map(item=>({ // for add/edit form
      "allergyID": item.allergyID,
      "allergyListID": item.allergyListID,
      "allergyRemarks": item.allergyRemarks,
      "allergyListDesc": item.allergyListDesc,
      "allergyReaction": item.allergyReaction,
      "createdDate": item.createdDate,
    }))
  }

  const handleAddAllergy = () => {
    setIsModalVisible(true);
    setModalMode('add');
  };

  const handleModalSubmit = async (allergyData) => {
    setIsLoading(true);

    let alertTitle = '';
    let alertDetails = '';

    const result = await patientApi.AddPatientAllergy(patientID, allergyData);
    if (result.ok) {
      console.log('submitting allergy data', allergyData);
      refreshAllergyData();
      setIsModalVisible(false);

      alertTitle = 'Successfully added allergy';
    } else {
      const errors = result.data?.message;

      result.data
      ? (alertDetails = `\n${errors}\n\nPlease try again.`)
      : (alertDetails = 'Please try again.');
      
      alertTitle = 'Error adding allergy';
    }

    Alert.alert(alertTitle, alertDetails);
  };

  // Ask user to confirm deletion of allergy
  const handleDeleteAllergy = (allergyID) => {
    const tempData = allergyData.filter(x=>x.allergyID == allergyID)[0];

    Alert.alert('Are you sure you wish to delete this item?', 
    `Date: ${formatDateTime(new Date(tempData.createdDate), true)}\n` +
    `Time: ${formatDateTime(new Date(tempData.createdDate), false)}\n` +
    `Allergic To: ${tempData.allergyListDesc}\n` +
    `Reaction: ${tempData.allergyReaction}\n` +
    `Notes: ${tempData.allergyRemarks}\n` , [
      {
        text: 'Cancel',
        onPress: ()=>{},
        style: 'cancel',
      },
      {text: 'OK', onPress: ()=>deleteAllergy(allergyID)},
    ]);
  }

  // Delete allergy
  const deleteAllergy = async (allergyID) => {
    setIsLoading(true);

    let tempData = {allergyID: allergyID};

    let alertTitle = '';
    let alertDetails = '';

    const result = await patientApi.deletePatientAllergy(tempData);
    if (result.ok) {
      refreshAllergyData();
      setIsModalVisible(false);
      
      alertTitle = 'Successfully deleted allergy';
    } else {
      const errors = result.data?.message;
      console.log("Error deleting allergy", result)

      result.data
      ? (alertDetails = `\n${errors}\n\nPlease try again.`)
      : (alertDetails = 'Please try again.');
      
      alertTitle = 'Error deleting allergy';
    }
    
    Alert.alert(alertTitle, alertDetails);
  }

  const onClickProfile = () => {
    navigation.navigate(routes.PATIENT_PROFILE, { id: patientID });
  };

  const getTableRowData = () => {
    return allergyData.map(({ patientID, allergyID, allergyListID, allergyReactionListID, ...item }) => {

      // Convert the rest of the item properties and handle the date separately
      let rowData = [
        formatDateTime(new Date(item.createdDate), true),
        formatDateTime(new Date(item.createdDate), false),
        item.allergyListDesc,
        item.allergyReaction,
        item.allergyRemarks, 
      ];

      return rowData;
    });
  };

  const getTableHeaderData = () => {
    return [
      'Date',
      'Time',
      'Allergic To',
      'Reaction',
      'Notes',
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
                originalList={originalAllergyData}
                setList={setAllergyData}
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
                onInitialize={()=>setIsDataInitialized(false)}
                itemType='allergy'
                itemCount={allergyData.length}
                displayMode={displayMode}
                setDisplayMode={setDisplayMode}
                DISPLAY_MODES={DISPLAY_MODES}
                /> 
            </View>
      </View>
      {displayMode == 'rows' ? (
            <FlatList
            onTouchStart={()=>Keyboard.dismiss()}
            onScrollBeginDrag={() => setIsScrolling(true)}
            onScrollEndDrag={() => setIsScrolling(false)}
            onRefresh={refreshAllergyData}
            refreshing={isLoading}
            height={'72%'}
            ListEmptyComponent={()=>noDataMessage(statusCode, isLoading, isError, 'No allergies found', true)}
            data={allergyData}
            keyboardShouldPersistTaps='handled'
            keyExtractor={item => (item.allergyID)}
            renderItem={({ item }) => { 
              return(
                <Swipeable
                  setIsScrolling={setIsScrolling}
                  onSwipeRight={()=>handleDeleteAllergy(item.allergyID)}
                  underlay={<EditDeleteUnderlay/>}
                  item={
                    <TouchableOpacity 
                      style={styles.logContainer} 
                      activeOpacity={1} 
                      disabled={!isScrolling}
                    >
                      <PatientAllergyItem
                        createdDate={item.createdDate}
                        allergyListDesc={item.allergyListDesc}
                        allergyReaction={item.allergyReaction}
                        allergyRemarks={item.allergyRemarks}
                        onDelete={()=>handleDeleteAllergy(item.allergyID)}
                        />
                    </TouchableOpacity>
                  }
                />
              )           
            }}
            />
          ) : (
      <View style={{ height: '72%', marginBottom: 20, marginHorizontal: 40 }}>
        <DynamicTable
          headerData={getTableHeaderData()}
          rowData={getTableRowData()}
          widthData={[125, 100, 110, 175, 200]}
          screenName={'patient allergy'}
          noDataMessage={noDataMessage(statusCode, isLoading, isError, 'No allergies found', false)}
          del={true}
        />
      </View>
      )}
      <View style={styles.addBtn}>
        <AddButton title="Add Allergy" onPress={handleAddAllergy} />
      </View>
      <AddPatientAllergyModal
        showModal={isModalVisible}
        modalMode={modalMode}
        onClose={() => setIsModalVisible(false)}
        onSubmit={handleModalSubmit}
        existingAllergyIDs={patientAllergyIDs}
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

export default PatientAllergyScreen;
