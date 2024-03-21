// Libs
import React, { useEffect, useState } from 'react';
import { Alert, Keyboard, StyleSheet, TouchableOpacity } from 'react-native';
import { FlatList, View } from 'native-base';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

// API
import patientApi from 'app/api/patient';

// Utilities
import { formatTimeHM24, convertTimeMilitary, isEmptyObject, noDataMessage, sortFilterInitialState, formatMilitaryToAMPM, formatDate, formatTimeAMPM } from 'app/utility/miscFunctions';

// Navigation
import routes from 'app/navigation/routes';

// Configurations
import colors from 'app/config/colors';

// Components
import ActivityIndicator from 'app/components/ActivityIndicator';
import AddButton from 'app/components/AddButton';
import MedicationItem from 'app/components/MedicationItem';
import AddPatientMedicationModal from 'app/components/AddPatientMedicationModal';
import ProfileNameButton from 'app/components/ProfileNameButton';
import SearchFilterBar from 'app/components/filter-components/SearchFilterBar';
import LoadingWheel from 'app/components/LoadingWheel';
import Swipeable from 'app/components/swipeable-components/Swipeable';
import EditDeleteUnderlay from 'app/components/swipeable-components/EditDeleteUnderlay';
import DynamicTable from 'app/components/DynamicTable';
import AppButton from 'app/components/AppButton';
import MedicalHistoryItem from 'app/components/MedicalHistoryItem';
import AddPatientMedicalHistoryModal from 'app/components/AddPatientMedicalHistoryModal';

function PatientMedicalHistory(props) {
  let {patientID, patientId} = props.route.params;
  if (patientId) {
    patientID = patientId;
  }
  const navigation = useNavigation();

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // either 'add' or 'edit'
  
  // Options for user to search by
  const SEARCH_OPTIONS = ['Details'];

  // Display mode options  
  const [displayMode, setDisplayMode] = useState('rows');
  const DISPLAY_MODES = ['rows', 'table'];
  
  // Sort options 
  const SORT_OPTIONS = ['Source', 'Estimated Date'];

  // Filter options
  const FILTER_OPTIONS = ['Estimated Date'];
  
  // Mapping between sort/filter/search names and the respective field in the patient data retrieved from the backend
  const FIELD_MAPPING = {
    'Source': 'informationSource',
    'Estimated Date': 'medicalEstimatedDate',
    'Details': 'medicalDetails'
  };
  
  // Search, sort, and filter related states
  const [sort, setSort] = useState(sortFilterInitialState);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDataInitialized, setIsDataInitialized] = useState(false);
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
    'Estimated Date': {
      'type': 'date',
      'options': {'min': {}, 'max': {},},
      'isFilter': true,
    },
  });

  // API call related states
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isRetry, setIsRetry] = useState(false);
  const [statusCode, setStatusCode] = useState(200);
  const [isReloadPatientList, setIsReloadList] = useState(true);

  // Medication data related states
  const [originalUnparsedHxData, setOriginalUnparsedHxData] = useState([]);
  const [originalHxData, setOriginalHxData] = useState([]);
  const [hxData, setHxData] = useState([]);
  const [medHistoryData, setMedHistoryData] = useState({ // for add/edit form
    "medicalHistoryId": null,
    "informationSource": "",
    "medicalDetails": "",
    "medicalRemarks": "",
    "medicalEstimatedDate": new Date(),
  });

  // Patient data related states
  const [patientData, setPatientData] = useState({});

  // Scrollview state
  const [isScrolling, setIsScrolling] = useState(false);  

  // Refresh list when new medication is added or user requests refresh
  useFocusEffect(
    React.useCallback(() => {
      if (isReloadPatientList) {
        refreshHxData();
        setIsReloadList(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReloadPatientList]),
  );
  
  // Set isLoading to true when retrieving data
  const refreshHxData = () => {
    setIsLoading(true);
    const promiseFunction = async () => {
      await getHxData();
      await getPatientData();
    };
    promiseFunction();
  }    

  // Get medication data from backend
  const getHxData = async () => {
    if (patientID) {
      const response = await patientApi.getPatientMedicalHistory(patientID);
      if (response.ok) {
        setOriginalHxData([...response.data.data]);    
        setHxData([...response.data.data]);    
        setIsDataInitialized(true);
        setIsLoading(false);  
        setIsError(false);
        setIsRetry(false);
        setStatusCode(response.status);
      } else {
        console.log('Request failed with status code: ', response.status);
        setOriginalHxData([]);
        setHxData([]);
        setIsLoading(false);
        setIsError(true);
        setStatusCode(response.status);
        setIsRetry(true);
      }
    }
  };

  // Get medication data from backend
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

  // Show form to add medication when add button is clicked
  const handleOnClickAddHx = () => {
    setIsModalVisible(true);
    setModalMode('add');
  };

  // Submit data to add medication
  const handleModalSubmitAdd = async (medData) => {
    setIsLoading(true);

    let alertTitle = '';
    let alertDetails = '';

    const result = await patientApi.addPatientMedicalHistory(patientID, medData);
    if (result.ok) {
      console.log('submitting medical history data', medData);
      refreshHxData();
      setIsModalVisible(false);
      
      alertTitle = 'Successfully added medical history';
    } else {
      const errors = result.data?.message;

      result.data
      ? (alertDetails = `\n${errors}\n\nPlease try again.`)
      : (alertDetails = 'Please try again.');
      
      alertTitle = 'Error adding medical history';
    }
    
    Alert.alert(alertTitle, alertDetails);
    setIsLoading(false);
  };
  
  // Ask user to confirm deletion of medication
  const handleDeleteHx = (hxID) => {

    const data = hxData.filter(x=>x.medicalHistoryId == hxID)[0];

    Alert.alert('Are you sure you wish to delete this item?', 
    `Source: ${data.informationSource}\Details: ${data.medicalDetails}\nRemarks: ${data.medicalRemarks}\nEstimated Date: ${formatDate(new Date(data.medicalEstimatedDate))}`, [
      {
        text: 'Cancel',
        onPress: ()=>{},
        style: 'cancel',
      },
      {text: 'OK', onPress: ()=>deleteHx(hxID)},
    ]);
  }

  // Delete medication
  const deleteHx = async (hxID) => {
    setIsLoading(true);

    let data = {medicalHistoryID: hxID};

    let alertTitle = '';
    let alertDetails = '';

    const result = await patientApi.deleteMedicalHistory(data);
    if (result.ok) {
      refreshHxData();
      setIsModalVisible(false);
      
      alertTitle = 'Successfully deleted medical history';
    } else {
      const errors = result.data?.message;
      console.log("Error deleting medical history")

      result.data
      ? (alertDetails = `\n${errors}\n\nPlease try again.`)
      : (alertDetails = 'Please try again.');
      
      alertTitle = 'Error deleting medical history';
    }
    
    Alert.alert(alertTitle, alertDetails);
    setIsLoading(false);
  }
  
  // Navigate to patient profile on click profile image
  const onClickProfile = () => {  
    navigation.navigate(routes.PATIENT_PROFILE, { id: patientID });
  }

  // Return formatted row data for table display
  const getTableRowData = () => {
    // const medDataNoMedID = medData.map(({ medID, ...rest }) => rest);
    return hxData.map(item=> {
      return Object.entries(item).map(([key, value]) => {
        if (key.toLowerCase().includes('date')) {
          return formatDate(new Date(value), true); 
        } else {
          return String(value); // Convert other values to strings
        } 
      })});
  }

  // Return formatted header data for table display
  const getTableHeaderData = () => {
    return hxData.length > 0 
      ? ['ID', ...Object.keys(hxData[0])
        .filter(x=>x!='medicalHistoryID') 
      ] : null;
  }

  return (
      isLoading ? (
        <ActivityIndicator visible />
      ) : (
        <View style={styles.container}>  
          <View style={{justifyContent: 'space-between'}}>            
            <View style={{alignSelf: 'center', marginTop: 15, maxHeight: 120}} >
              {!isEmptyObject(patientData) ? (
                  <ProfileNameButton   
                    profilePicture={patientData.profilePicture}
                    profileLineOne={patientData.preferredName}
                    profileLineTwo={(patientData.firstName + ' ' + patientData.lastName)}
                    handleOnPress={onClickProfile}
                    isPatient
                    isVertical={false}
                    size={90}
                    />
              ) : (
                <LoadingWheel/>
                )}
            </View>  
            <View>
              <SearchFilterBar
                originalList={originalHxData}
                setList={setHxData}
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
                itemType='medical history'
                itemCount={hxData.length}
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
            onRefresh={refreshHxData}
            refreshing={isLoading}
            height={'72%'}
            ListEmptyComponent={()=>noDataMessage(statusCode, isLoading, isError, 'No medical history found', true)}
            data={hxData}
            keyboardShouldPersistTaps='handled'
            keyExtractor={item => (item.medicalHistoryId)}
            renderItem={({ item }) => { 
              return(
                <Swipeable
                  setIsScrolling={setIsScrolling}
                  onSwipeRight={()=>handleDeleteHx(item.medicalHistoryId)}
                  underlay={<EditDeleteUnderlay/>}
                  item={
                    <TouchableOpacity 
                      style={styles.medContainer} 
                      activeOpacity={1} 
                      disabled={!isScrolling}
                    >
                      <MedicalHistoryItem
                        medicalHistoryId={item.medicalHistoryId}
                        informationSource={item.informationSource}
                        medicalDetails={item.medicalDetails}
                        medicalEstimatedDate={item.medicalEstimatedDate}
                        medicalRemarks={item.medicalRemarks}
                        />
                    </TouchableOpacity>
                  }
                />
              )           
            }}
          />
          ) : (
            <View style={{height: '72%', marginBottom: 20, marginHorizontal: 40}}>
              <DynamicTable
                headerData={getTableHeaderData()}
                rowData={getTableRowData()}
                widthData={[200, 200, 200, 200, 270, 270, 300]}
                screenName={'patient medical history'}
                onClickDelete={handleDeleteHx}
                noDataMessage={noDataMessage(statusCode, isLoading, isError, 'No medical history found', false)}
                />
            </View>
          )}
          <View style={styles.addBtn}>
            <AddButton 
              title="Add Medical History"
              onPress={handleOnClickAddHx}
              />
          </View>
          <AddPatientMedicalHistoryModal
            showModal={isModalVisible}
            modalMode={modalMode}
            medicalHistoryData={medHistoryData}
            setMedicalHistoryData={setMedHistoryData}
            onClose={()=>setIsModalVisible(false)}
            onSubmit={modalMode == 'add' ? handleModalSubmitAdd : () => {}}
          />
        </View>
      )
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white_var1,
  },
  medContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  addBtn: {
    marginTop: '0.01%'
  }
});

export default PatientMedicalHistory;
