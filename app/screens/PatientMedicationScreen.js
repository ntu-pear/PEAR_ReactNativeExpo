// Libs
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronLeftIcon, ChevronRightIcon, Divider, FlatList, Icon, Text, View } from 'native-base';
import { ListItem, Button } from 'react-native-elements';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

// API
import patientApi from 'app/api/patient';

// Utilities
import { formatTimeHM24, convertTimeMilitary, isEmptyObject, noDataMessage, sortFilterInitialState } from 'app/utility/miscFunctions';

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

function PatientMedicationScreen(props) {
  const {patientID} = props.route.params;
  const navigation = useNavigation();

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // either 'add' or 'edit'
  
  // Options for user to search by
  const SEARCH_OPTIONS = ['Medication'];

  // Display mode options  
  const [displayMode, setDisplayMode] = useState('rows');
  const DISPLAY_MODES = ['rows', 'table'];
  
  // Sort options based on view mode
  const SORT_OPTIONS = ['Medication', 'Medication Time', 'Start Date', 'End Date'];
  
  // Mapping between sort/filter/search names and the respective field in the patient data retrieved from the backend
  const FIELD_MAPPING = {
    'Medication': 'medName',
    'Start Date': 'medStartDate',
    'End Date': 'medEndDate',
    'Medication Time': 'medTime'
  };

  // Search and sort related states
  const [sort, setSort] = useState(sortFilterInitialState);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDataInitialized, setIsDataInitialized] = useState(false);

  // API call related states
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isRetry, setIsRetry] = useState(false);
  const [statusCode, setStatusCode] = useState(200);
  const [isReloadPatientList, setIsReloadPatientList] = useState(true);

  // Medication data related states
  const [originalUnparsedMedData, setOriginalUnparsedMedData] = useState([]);
  const [originalMedData, setOriginalMedData] = useState([]);
  const [medData, setMedData] = useState([]);
  const [medicationData, setMedicationData] = useState({ // for add/edit form
    "medicationID": null,
    "prescriptionName": "",
    "dosage": "",
    "administerTime": [],
    "instruction": "",
    "startDateTime": new Date(),
    "endDateTime": new Date(),
    "prescriptionRemarks": ""
  });

  // Patient data related states
  const [patientData, setPatientData] = useState({});

  // Table display related states
  const [headerData, setHeaderData] = useState([]);
  const [rowData, setRowData] = useState([]);
  const [widthData, setWidthData] = useState([]);

  // Scrollview state
  const [isScrolling, setIsScrolling] = useState(false);
  

  // Refresh list when new medication is added or user requests refresh
  useFocusEffect(
    React.useCallback(() => {
      if (isReloadPatientList) {
        refreshMedData();
        setIsReloadPatientList(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReloadPatientList]),
  );
  

  // Set isLoading to true when retrieving data
  const refreshMedData = () => {
    setIsLoading(true);
    const promiseFunction = async () => {
      await getMedicationData();
      await getPatientData();
    };
    promiseFunction();
  }    

  // Get medication data from backend
  const getMedicationData = async () => {
    if (patientID) {
      const response = await patientApi.getPatientMedication(patientID);
      if (response.ok) {
        setOriginalUnparsedMedData([...response.data.data])
        parseMedicationData(response.data.data);
        setIsError(false);
        setIsRetry(false);
        setStatusCode(response.status);
      } else {
        console.log('Request failed with status code: ', response.status);
        setOriginalUnparsedMedData([]);
        setOriginalMedData([]);
        setMedData([]);
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
        console.log(response);
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

  // Parse data to display 
  // Some medications may have more than one administerTime - render as separate items for each timing
  const parseMedicationData = (data) => {
    var tempMedData = [];
    for (var i = 0; i<data.length; i++) {
      var item = data[i];
      
      var medTimes = item.administerTime.split(',');
      for (var j = 0; j <medTimes.length; j++) {
        tempMedData.push({
          medID: item.medicationID,
          medName: item.prescriptionName,
          medDosage: item.dosage,
          medTime: convertTimeMilitary(medTimes[j]),
          medNote: item.instruction,
          medStartDate: item.startDateTime,
          medEndDate: item.endDateTime,
          medRemarks: item.prescriptionRemarks
        });
      }
    }
    setOriginalMedData([...tempMedData]);    
    setMedData([...tempMedData]);    
    setIsDataInitialized(true);  
    setIsLoading(false);
  }

  // Show form to add medication when add button is clicked
  const handleOnClickAddMedication = () => {
    setIsModalVisible(true);
    setModalMode('add');
  };

  // Submit data to add medication
  const handleModalSubmitAdd = async (medData) => {
    setIsLoading(true);

    let data = {...medData};
    data['administerTime'] = convertAdmTimeToMilitary(medData.administerTime);

    let alertTitle = '';
    let alertDetails = '';

    const result = await patientApi.addPatientMedication(patientID, data);
    if (result.ok) {
      console.log('submitting medication data', data);
      refreshMedData();
      setIsModalVisible(false);
      
      alertTitle = 'Successfully added medication';
    } else {
      const errors = result.data?.message;

      result.data
      ? (alertDetails = `\n${errors}\n\nPlease try again.`)
      : (alertDetails = 'Please try again.');
      
      alertTitle = 'Error adding medication';
    }
    
    Alert.alert(alertTitle, alertDetails);
    setIsLoading(false);
  };
  
  // Edit medication
  const handleEditMedication = (medID) => {
    setIsModalVisible(true);
    setModalMode('edit');
    
    const unparsedMedData = originalUnparsedMedData.filter(x=>x.medicationID == medID && x.patientID == patientID)[0];

    setMedicationData({
      "medicationID": unparsedMedData.medicationID,
      "prescriptionName": unparsedMedData.prescriptionName,
      "dosage": unparsedMedData.dosage,
      "administerTime": admStrToTime(unparsedMedData.administerTime),
      "instruction": unparsedMedData.instruction,
      "startDateTime": new Date(unparsedMedData.startDateTime),
      "endDateTime": new Date(unparsedMedData.endDateTime),
      "prescriptionRemarks": unparsedMedData.prescriptionRemarks
    })
  }
  
  // Convert adminster time string to array of datetime
  const admStrToTime = (admStr) => {
    let admArray = admStr.split(",");
    admArray = admArray.map(item=>(
      new Date(convertTimeMilitary(item))
    ));
    return admArray;
  }

  // Submit data to edit medication
  const handleModalSubmitEdit = async () => {
    setIsLoading(true);

    let data = {...medicationData};
    data['administerTime'] = convertAdmTimeToMilitary(medicationData.administerTime);
    console.log('edit', data)

    let alertTitle = '';
    let alertDetails = '';

    const result = await patientApi.updateMedication(patientID, data);
    if (result.ok) {
      console.log('submitting medication data', data);
      refreshMedData();
      setIsModalVisible(false);
      
      alertTitle = 'Successfully edited medication';
    } else {
      const errors = result.data?.message;
      console.log(result)

      result.data
      ? (alertDetails = `\n${errors}\n\nPlease try again.`)
      : (alertDetails = 'Please try again.');
      
      alertTitle = 'Error editing medication';
    }
    
    Alert.alert(alertTitle, alertDetails);
    setIsLoading(false);
  };
  
  // Delete medication
  const handleDeleteMedication = (medID) => {
    console.log('delete', medID)
    
  }

  // Convert date time administer time array to military time array
  const convertAdmTimeToMilitary = (admTimeArray) => {
    admTimeArray = admTimeArray.map(item=>(formatTimeHM24(new Date(item), false)))
    return admTimeArray.join(',');
  }

  // Navigate to patient profile on click profile image
  const onClickProfile = () => {  
    navigation.navigate(routes.PATIENT_PROFILE, { id: patientID });
  }


  return (
      isLoading ? (
        <ActivityIndicator visible />
      ) : (
        <View style={styles.container}>  
          <View style={{justifyContent: 'space-between'}}>            
            <View style={{alignSelf: 'center', marginTop: 15, height: '9%'}} >
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
                originalList={originalMedData}
                setList={setMedData}
                SEARCH_OPTIONS={SEARCH_OPTIONS}
                FIELD_MAPPING={FIELD_MAPPING}
                SORT_OPTIONS={SORT_OPTIONS}
                sort={sort}
                setSort={setSort}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                initializeData={isDataInitialized}
                onInitialize={()=>setIsDataInitialized(false)}
                itemType='medications'
                itemCount={medData.length}
                displayMode={displayMode}
                setDisplayMode={setDisplayMode}
                DISPLAY_MODES={DISPLAY_MODES}
                /> 
            </View>
          </View>
          {displayMode == 'rows' ? (
            <FlatList
            onScrollBeginDrag={() => setIsScrolling(true)}
            onScrollEndDrag={() => setIsScrolling(false)}
            onRefresh={refreshMedData}
            refreshing={isLoading}
            height={'73%'}
            ListEmptyComponent={()=>noDataMessage(statusCode, isLoading, isError, 'No medications found')}
            data={medData}
            keyboardShouldPersistTaps='handled'
            keyExtractor={item => (item.medID + item.medTime)}
            renderItem={({ item, index }) => { 
              return(
                <View>
                  <Swipeable
                    setIsScrolling={setIsScrolling}
                    onSwipeRight={()=>handleDeleteMedication(item.medID)}
                    onSwipeLeft={()=>handleEditMedication(item.medID)}
                    underlay={<EditDeleteUnderlay/>}
                    item={
                      <View>
                        <TouchableOpacity style={styles.medContainer} activeOpacity={1} disabled={!isScrolling}>
                          <MedicationItem
                            medID={item.medID}
                            patientID={patientID}
                            patientName={patientData.preferredName}
                            medName={item.medName}
                            medDosage={item.medDosage}
                            medTime={item.medTime}
                            medNote={item.medNote}                  
                            medStartDate={item.medStartDate}
                            medEndDate={item.medEndDate}
                            medRemarks={item.medRemarks}
                            editable
                            />
                        </TouchableOpacity>
                      </View>
                    }
                  />
                </View>
              )           
            }}
          />
          ) : (
            <DynamicTable
            headerData={headerData}
            rowData={rowData}
            widthData={widthData}
            screenName={'patient allergy'}
          />
          )}
          <View style={styles.addBtn}>
            <AddButton 
              title="Add Medication"
              onPress={handleOnClickAddMedication}
              />
          </View>
          <AddPatientMedicationModal
            showModal={isModalVisible}
            modalMode={modalMode}
            medicationData={medicationData}
            setMedicationData={setMedicationData}
            onClose={()=>setIsModalVisible(false)}
            onSubmit={modalMode=='add' ? handleModalSubmitAdd : handleModalSubmitEdit} 
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
  }
});

export default PatientMedicationScreen;
