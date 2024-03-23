// Libs
import React, { useContext, useState } from 'react';
import { Alert, Keyboard, StyleSheet, TouchableOpacity } from 'react-native';
import { FlatList, View } from 'native-base';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

// API
import patientApi from 'app/api/patient';

// Utilities
import { isEmptyObject, noDataMessage, sortFilterInitialState, formatDate } from 'app/utility/miscFunctions';

// Navigation
import routes from 'app/navigation/routes';

// Configurations
import colors from 'app/config/colors';

// Auth
import AuthContext from 'app/auth/context';

// Components
import ActivityIndicator from 'app/components/ActivityIndicator';
import AddButton from 'app/components/AddButton';
import ProfileNameButton from 'app/components/ProfileNameButton';
import SearchFilterBar from 'app/components/filter-components/SearchFilterBar';
import LoadingWheel from 'app/components/LoadingWheel';
import Swipeable from 'app/components/swipeable-components/Swipeable';
import EditDeleteUnderlay from 'app/components/swipeable-components/EditDeleteUnderlay';
import DynamicTable from 'app/components/DynamicTable';
import ProblemLogItem from 'app/components/patient-profile-components/ProblemLogItem';
import AddPatientProblemLogModal from 'app/components/patient-profile-components/AddPatientProblemLogModal';

function PatientProblemLog(props) {
  let {patientID, patientId} = props.route.params;
  if (patientId) {
    patientID = patientId;
  }
  const navigation = useNavigation();
  
  // User ID for edit/add operations
  const { user } = useContext(AuthContext);
  const userID = user ? user.userID : null;

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // either 'add' or 'edit'
  
  // Options for user to search by
  const SEARCH_OPTIONS = ['Description'];

  // Display mode options  
  const [displayMode, setDisplayMode] = useState('rows');
  const DISPLAY_MODES = ['rows', 'table'];
  
  // Sort options 
  const SORT_OPTIONS = ['Created Datetime', 'Author'];

  // Filter options
  const FILTER_OPTIONS = ['Created Datetime'];
  
  // Mapping between sort/filter/search names and the respective field in the patient data retrieved from the backend
  const FIELD_MAPPING = {
    'Description': 'problemLogListDesc',
    'Created Datetime': 'createdDateTime',
    'Author': 'authorName'
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
    'Created Datetime': {
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
  const [isReloadList, setIsReloadList] = useState(true);

  // Problem log data related states
  const [originalLogData, setOriginalLogData] = useState([]);
  const [logData, setLogData] = useState([]);
  const [logFormData, setLogFormData] = useState({ // for add/edit form
    "problemLogID": null,
    "problemLogListID": 1,
    "problemLogListDesc": "",
    "problemLogRemarks": "",
  });

  // Patient data related states
  const [patientData, setPatientData] = useState({});

  // Scrollview state
  const [isScrolling, setIsScrolling] = useState(false);  

  // Refresh list when new medication is added or user requests refresh
  useFocusEffect(
    React.useCallback(() => {
      if (isReloadList) {
        refreshLogData();
        setIsReloadList(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReloadList]),
  );
  
  // Set isLoading to true when retrieving data
  const refreshLogData = () => {
    setIsLoading(true);
    const promiseFunction = async () => {
      await getLogData();
      await getPatientData();
    };
    promiseFunction();
  }    

  // Get problem log data from backend
  const getLogData = async () => {
    if (patientID) {
      const response = await patientApi.getPatientProblemLog(patientID);
      if (response.ok) {
        console.log(response.data.data)
        setOriginalLogData([...response.data.data]);    
        setLogData(parseLogData([...response.data.data]));    
        setIsDataInitialized(true);
        setIsLoading(false);  
        setIsError(false);
        setIsRetry(false);
        setStatusCode(response.status);
      } else {
        console.log('Request failed with status code: ', response.status);
        setOriginalLogData([]);
        setLogData([]);
        setIsLoading(false);
        setIsError(true);
        setStatusCode(response.status);
        setIsRetry(true);
      }
    }
  };

  // Parse data
  const parseLogData = (data) => {
    return data.map(item=>({ // for add/edit form
      "problemLogID": item.problemLogID,
      "problemLogRemarks": item.problemLogRemarks,
      "authorName": item.authorName,
      "problemLogListDesc": item.problemLogListDesc,
      "createdDateTime": item.createdDateTime,
    }))
  }

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

  // Show form to add problem log when add button is clicked
  const handleOnClickAddLog = () => {
    setIsModalVisible(true);
    setModalMode('add');
  };

  // Submit data to add problem log
  const handleModalSubmitAdd = async (tempLogFormData) => {
    setIsLoading(true);

    let alertTitle = '';
    let alertDetails = '';

    const result = await patientApi.addPatientProblemLog(patientID, userID, tempLogFormData);
    if (result.ok) {
      console.log('submitting problem log data', tempLogFormData);
      refreshLogData();
      setIsModalVisible(false);
      
      alertTitle = 'Successfully added problem log';
    } else {
      const errors = result.data?.message;

      console.log(result);

      result.data
      ? (alertDetails = `\n${errors}\n\nPlease try again.`)
      : (alertDetails = 'Please try again.');
      
      alertTitle = 'Error adding problem log';
    }
    
    Alert.alert(alertTitle, alertDetails);
    setIsLoading(false);
  };
  
  // Edit problem log
  const handleEditLog = (logID) => {
    setIsModalVisible(true);
    setModalMode('edit');
    
    const tempLogData = logData.filter(x=>x.problemLogID == logID)[0];

    setLogFormData({
      "problemLogID": tempLogData.problemLogID,
      "problemLogListID": tempLogData.problemLogListID,
      "problemLogListDesc": tempLogData.problemLogListDesc,
      "problemLogRemarks": tempLogData.problemLogRemarks,
    })
  }

  // Submit data to edit problem log
  const handleModalSubmitEdit = async () => {
    setIsLoading(true);

    let tempFormData = {...logFormData};

    let alertTitle = '';
    let alertDetails = '';

    const result = await patientApi.updateProblemLog(patientID, userID, tempFormData);
    if (result.ok) {
      refreshLogData();
      setIsModalVisible(false);
      
      alertTitle = 'Successfully edited problem log';
    } else {
      const errors = result.data?.message;
      console.log("Error editing problem log")

      result.data
      ? (alertDetails = `\n${errors}\n\nPlease try again.`)
      : (alertDetails = 'Please try again.');
      
      alertTitle = 'Error editing log data';
    }
    
    Alert.alert(alertTitle, alertDetails);
    setIsLoading(false);
  };

  // Ask user to confirm deletion of problem log
  const handleDeleteLog = (logID) => {
    const data = logData.filter(x=>x.problemLogID == logID)[0];

    Alert.alert('Are you sure you wish to delete this item?', 
    `Author: ${data.authorName}\n` +
    `Description: ${data.problemLogListDesc}\n` +
    `Remarks: ${data.problemLogRemarks}\n` +
    `Created: ${formatDate(new Date(data.createdDateTime))}`, [
      {
        text: 'Cancel',
        onPress: ()=>{},
        style: 'cancel',
      },
      {text: 'OK', onPress: ()=>deleteLog(logID)},
    ]);
  }

  // Delete probem log
  const deleteLog = async (logID) => {
    setIsLoading(true);

    let data = {problemLogID: logID};

    let alertTitle = '';
    let alertDetails = '';

    const result = await patientApi.deleteProblemLog(data);
    if (result.ok) {
      refreshLogData();
      setIsModalVisible(false);
      
      alertTitle = 'Successfully deleted medical history';
    } else {
      const errors = result.data?.message;
      console.log("Error deleting medical history", result)

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
  // Note: keys originally ordered like ['ID', 'Author', 'Description', 'Created Datetime', 'Remarks']  
  const getTableRowData = () => {
    const dataNoIDs = logData.map(({ patientID, userID, problemLogListID, ...rest }) => rest);
    
    let tempLogData =  dataNoIDs.map(item=> {
      return Object.entries(item).map(([key, value]) => {
        if (key.toLowerCase().includes('date')) {
          return formatDate(new Date(value), true); 
        } else {
          return String(value); // Convert other values to strings
        } 
      })
    });

    // Reordered items to have remarks before created datetime
    tempLogData = tempLogData.map(item => {
      let temp = item[3];
      item[3] = item[4];
      item[4] = temp;

      return item;
    })

    return tempLogData;
  }

  // Return formatted header data for table display
  // Note: keys originally ordered like ['ID', 'Author', 'Description', 'Created Datetime', 'Remarks']
  const getTableHeaderData = () => {
    return ['ID', 'Author', 'Description', 'Remarks', 'Created Datetime'];
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
                originalList={originalLogData}
                setList={setLogData}
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
                itemType='problem log'
                itemCount={logData.length}
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
            onRefresh={refreshLogData}
            refreshing={isLoading}
            height={'72%'}
            ListEmptyComponent={()=>noDataMessage(statusCode, isLoading, isError, 'No problem logs found', true)}
            data={logData}
            keyboardShouldPersistTaps='handled'
            keyExtractor={item => (item.problemLogID)}
            renderItem={({ item }) => { 
              return(
                <Swipeable
                  setIsScrolling={setIsScrolling}
                  onSwipeRight={()=>handleDeleteLog(item.problemLogID)}
                  onSwipeLeft={()=>handleEditLog(item.problemLogID)}
                  underlay={<EditDeleteUnderlay/>}
                  item={
                    <TouchableOpacity 
                      style={styles.logContainer} 
                      activeOpacity={1} 
                      disabled={!isScrolling}
                    >
                      <ProblemLogItem
                        problemLogRemarks={item.problemLogRemarks}
                        authorName={item.authorName}
                        problemLogListDesc={item.problemLogListDesc}
                        createdDateTime={item.createdDateTime}
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
                widthData={[200, 200, 200, 200]}
                screenName={'patient problem log'}
                onClickDelete={handleDeleteLog}
                onClickEdit={handleEditLog}
                noDataMessage={noDataMessage(statusCode, isLoading, isError, 'No problem log found', false)}
                del={true}
                edit={true}
                />
            </View>
          )}
          <View style={styles.addBtn}>
            <AddButton 
              title="Add Problem Log"
              onPress={handleOnClickAddLog}
              />
          </View>
          <AddPatientProblemLogModal
            showModal={isModalVisible}
            modalMode={modalMode}
            logFormData={logFormData}
            setLogFormData={setLogFormData}
            onClose={()=>setIsModalVisible(false)}
            onSubmit={modalMode == 'add' ? handleModalSubmitAdd : handleModalSubmitEdit}
          />
        </View>
      )
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
    marginTop: '0.01%'
  }
});

export default PatientProblemLog;
