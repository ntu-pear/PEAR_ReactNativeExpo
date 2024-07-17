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

// Components
import ActivityIndicator from 'app/components/ActivityIndicator';
import AddButton from 'app/components/AddButton';
import ProfileNameButton from 'app/components/ProfileNameButton';
import SearchFilterBar from 'app/components/filter-components/SearchFilterBar';
import LoadingWheel from 'app/components/LoadingWheel';
import Swipeable from 'app/components/swipeable-components/Swipeable';
import DynamicTable from 'app/components/DynamicTable';
import MobilityAidItem from 'app/components/MobilityAidItem';
import AddPatientMobilityAidModal from 'app/components/AddPatientMobilityAidModal';

function PatientMobilityAidScreen(props) {
  let {patientID, patientId} = props.route.params;
  if (patientId) {
    patientID = patientId;
  }
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
  const SORT_OPTIONS = ['Created Datetime'];

  // Filter options
  const FILTER_OPTIONS = ['Created Datetime'];
  
  // Mapping between sort/filter/search names and the respective field in the patient data retrieved from the backend
  const FIELD_MAPPING = {
    'Mobility Aid': 'mobilityListDesc',
    'Created Datetime': 'date',
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

  // Mobility aid data related states
  const [originalMobilityData, setOriginalMobilityData] = useState([]);
  const [mobilityData, setMobilityData] = useState([]);
  const [formData, setFormData] = useState({ // for add/edit form
    "mobilityId": null,
    "mobilityListId": 1,
    "mobilityRemark": "",
    "isRecovered": true,
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

  // Get mobility data from backend
  const getMobilityData = async () => {
    if (patientID) {
      const response = await patientApi.getPatientMobility(patientID);
      if (response.ok) {
        console.log(response.data.data)
        setOriginalMobilityData([...response.data.data]);    
        setMobilityData(parseMobilityData([...response.data.data]));    
        setIsDataInitialized(true);
        setIsLoading(false);  
        setIsError(false);
        setIsRetry(false);
        setStatusCode(response.status);
      } else {
        console.log('Request failed with status code: ', response.status);
        setOriginalMobilityData([]);
        setMobilityData([]);
        setIsLoading(false);
        setIsError(true);
        setStatusCode(response.status);
        setIsRetry(true);
      }
    }
  };

  // Parse data
  const parseMobilityData = (tempData) => {
    return tempData.map(item=>({ // for add/edit form
      "mobilityListId": item.mobilityListId,
      "mobilityRemark": item.mobilityRemark,
      "mobilityListDesc": item.mobilityListDesc,
      "createdDateTime": item.date,
      "isRecovered": item.isRecovered,
    }))
  }

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
  const handleOnClickAddMobility = () => {
    setIsModalVisible(true);
    setModalMode('add');
  };

  // Submit data to add mobility aid
  const handleModalSubmitAdd = async (tempMobilityFormData) => {
    setIsLoading(true);

    let alertTitle = '';
    let alertDetails = '';

    const result = await patientApi.addPatientMobility(patientID, tempMobilityFormData);
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

  // Navigate to patient profile on click profile image
  const onClickProfile = () => {  
    navigation.navigate(routes.PATIENT_PROFILE, { id: patientID });
  }
  
  const getTableRowData = () => {
    return mobilityData.map(({ patientID, mobilityID, ...item }) => {
      // Directly map the 2 conditions accordingly
      const isRecoveredDisplay = item.isRecovered ? 'Fully Recovered' : 'Not Recovered';

      // Convert the rest of the item properties and handle the date separately
      let rowData = [
        item.mobilityListDesc,
        item.mobilityRemark,
        isRecoveredDisplay,
        formatDate(new Date(item.date), true), // Assuming formatDate() formats the date as needed
      ];

      return rowData;
    });
  };

  const getTableHeaderData = () => {
    return [
      'Mobility Aids',
      'Remark',
      'Condition',
      'Date',
    ];
  };

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
                initializeData={isDataInitialized}
                onInitialize={()=>setIsDataInitialized(false)}
                itemType='mobility aid'
                itemCount={mobilityData.length}
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
            onRefresh={refreshMobilityData}
            refreshing={isLoading}
            height={'72%'}
            ListEmptyComponent={()=>noDataMessage(statusCode, isLoading, isError, 'No mobility aids found', true)}
            data={mobilityData}
            keyboardShouldPersistTaps='handled'
            keyExtractor={item => (item.mobilityListId)}
            renderItem={({ item }) => { 
              return(
                <Swipeable
                  setIsScrolling={setIsScrolling}
                  item={
                    <TouchableOpacity 
                      style={styles.logContainer} 
                      activeOpacity={1} 
                      disabled={!isScrolling}
                    >
                      <MobilityAidItem
                        mobilityRemarks={item.mobilityRemark}
                        isRecovered={item.isRecovered}
                        mobilityListDesc={item.mobilityListDesc}
                        date={item.date}
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
                screenName={'patient mobility aid'}
                noDataMessage={noDataMessage(statusCode, isLoading, isError, 'No mobility aids found', false)}
                />
            </View>
          )}
          <View style={styles.addBtn}>
            <AddButton 
              title="Add Mobility Aid"
              onPress={handleOnClickAddMobility}
              />
          </View>
          <AddPatientMobilityAidModal
            showModal={isModalVisible}
            modalMode={modalMode}
            formData={formData}
            setFormData={setFormData}
            onClose={()=>setIsModalVisible(false)}
            onSubmit={handleModalSubmitAdd}
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
    marginTop: '0.01%',
  },
});

export default PatientMobilityAidScreen;
