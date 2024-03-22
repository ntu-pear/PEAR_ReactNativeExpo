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

function PatientMedicationScreen(props) {
  let {patientID, patientId} = props.route.params;
  if (patientId) {
    patientID = patientId;
  }
  const navigation = useNavigation();

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // either 'add' or 'edit'
  
  // Options for user to search by
  const SEARCH_OPTIONS = ['Medication'];

  // Display mode options  
  const [displayMode, setDisplayMode] = useState('rows');
  const DISPLAY_MODES = ['rows', 'table'];
  
  // Sort options 
  const SORT_OPTIONS = ['Medication', 'Medication Time', 'Start Date', 'End Date'];

  // Filter options
  const FILTER_OPTIONS = ['Medication Time', 'Start Date', 'End Date'];
  
  // Mapping between sort/filter/search names and the respective field in the patient data retrieved from the backend
  const FIELD_MAPPING = {
    'Medication': 'medName',
    'Start Date': 'medStartDate',
    'End Date': 'medEndDate',
    'Medication Time': 'medTime'
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
    'Medication Time': {
      'type': 'time',
      'options': {'min': {}, 'max': {},},
      'isFilter': true,
    },
    'Start Date': {
      'type': 'date',
      'options': {'min': {}, 'max': {}},
      'isFilter': true,
    },
    'End Date': {
      'type': 'date',
      'options': {'min': {}, 'max': {}},
      'isFilter': true,
    },
  });

  // useEffect(()=>console.log(datetime), [datetime])

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
        setOriginalUnparsedMedData(response.data.data != null ? [...response.data.data] : [])
        parseMedicationData(response.data.data != null ? response.data.data : []);
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

    let alertTitle = '';
    let alertDetails = '';

    const result = await patientApi.updateMedication(patientID, data);
    if (result.ok) {
      refreshMedData();
      setIsModalVisible(false);
      
      alertTitle = 'Successfully edited medication';
    } else {
      const errors = result.data?.message;
      console.log("Error editing med")

      result.data
      ? (alertDetails = `\n${errors}\n\nPlease try again.`)
      : (alertDetails = 'Please try again.');
      
      alertTitle = 'Error editing medication';
    }
    
    Alert.alert(alertTitle, alertDetails);
    setIsLoading(false);
  };
  
  // Ask user to confirm deletion of medication
  const handleDeleteMedication = (medID) => {
    const unparsedMedData = originalUnparsedMedData.filter(x=>x.medicationID == medID && x.patientID == patientID)[0];

    Alert.alert('Are you sure you wish to delete this medication?', 
    `Medication: ${unparsedMedData.prescriptionName}\nTime: ${formatAdmString(unparsedMedData.administerTime)}`, [
      {
        text: 'Cancel',
        onPress: ()=>{},
        style: 'cancel',
      },
      {text: 'OK', onPress: ()=>deleteMedication(medID)},
    ]);
  }

  // Delete medication
  const deleteMedication = async (medID) => {
    setIsLoading(true);

    let data = {medicationID: medID};

    let alertTitle = '';
    let alertDetails = '';

    const result = await patientApi.deleteMedication(data);
    if (result.ok) {
      refreshMedData();
      setIsModalVisible(false);
      
      alertTitle = 'Successfully deleted medication';
    } else {
      const errors = result.data?.message;
      console.log("Error deleting med")

      result.data
      ? (alertDetails = `\n${errors}\n\nPlease try again.`)
      : (alertDetails = 'Please try again.');
      
      alertTitle = 'Error deleting medication';
    }
    
    Alert.alert(alertTitle, alertDetails);
    setIsLoading(false);
  }

  // Convert comma separated military time administer time to comma separated AM/PM time
  const formatAdmString = (timeString) => {
    let admArray = timeString.split(',');
    admArray = admArray.map(item => (
      formatMilitaryToAMPM(item)
    )).join(', ');
    return admArray;
  }
  
  // Navigate to patient profile on click profile image
  const onClickProfile = () => {  
    navigation.navigate(routes.PATIENT_PROFILE, { id: patientID });
  }
  
  // Convert date time administer time array to military time array
  const convertAdmTimeToMilitary = (admTimeArray) => {
    admTimeArray = admTimeArray.map(item=>(formatTimeHM24(new Date(item), false)))
    return admTimeArray.join(',');
  }

  // Return formatted row data for table display
  const getTableRowData = () => {
    // const medDataNoMedID = medData.map(({ medID, ...rest }) => rest);
    return [...medData].map(item=> {
      return Object.entries(item).map(([key, value]) => {
        if (key.toLowerCase().includes('date')) {
          return formatDate(new Date(value), true); 
        } else if (key.toLowerCase().includes('time')) {
          return formatTimeAMPM(new Date(value));
        } else {
          return String(value); // Convert other values to strings
        } 
      })});
  }

  // Return formatted header data for table display
  const getTableHeaderData = () => {
    return medData.length > 0 
      ? ['ID', ...Object.keys(medData[0])
        .filter(x=>x!='medID')
        .map(item=>("Prescription "+item
        .split("med")[1].
        replace(/([a-z])([A-Z])/g, '$1 $2')))  
      ] : null;
  }

  // Get user confirmation to save adminstration status of medication
  const onClickAdminister = (index) => {
    const data = medData[[index]]
    
    Alert.alert('Confirm medication adminstration', 
    `Patient: ${patientData.preferredName}\n`+
    `Medication: ${data.medName}\n`+
    `Dosage: ${data.medDosage}\n`+
    `Time: ${formatTimeAMPM(data.medTime)}`, [
      {
        text: 'Cancel',
        onPress: ()=>{},
        style: 'cancel',
      },
      {text: 'OK', onPress: administerMed},
    ]);
  }

  // Save medicine administration
  const administerMed = () => {
    () => console.log('Administer')
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
                originalList={originalMedData}
                setList={setMedData}
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
            onTouchStart={()=>Keyboard.dismiss()}
            onScrollBeginDrag={() => setIsScrolling(true)}
            onScrollEndDrag={() => setIsScrolling(false)}
            onRefresh={refreshMedData}
            refreshing={isLoading}
            height={'72%'}
            ListEmptyComponent={()=>noDataMessage(statusCode, isLoading, isError, 'No medications found', true)}
            data={medData}
            keyboardShouldPersistTaps='handled'
            keyExtractor={item => (item.medID + item.medTime)}
            renderItem={({ item, index }) => { 
              return(
                <Swipeable
                  setIsScrolling={setIsScrolling}
                  onSwipeRight={()=>handleDeleteMedication(item.medID)}
                  onSwipeLeft={()=>handleEditMedication(item.medID)}
                  underlay={<EditDeleteUnderlay/>}
                  item={
                    <TouchableOpacity 
                      style={styles.medContainer} 
                      activeOpacity={1} 
                      disabled={!isScrolling}
                    >
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
              screenName={'patient medication'}
              onClickEdit={handleEditMedication}
              onClickDelete={handleDeleteMedication}
              noDataMessage={noDataMessage(statusCode, isLoading, isError, 'No medications found', false)}
              customColumns={[{
                btnTitle: 'Log',
                colTitle: 'Log medication administration',
                onPress: onClickAdminister,
                color: 'green',
                width: 300
              }]}
              edit
              del
              />
            </View>
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
  },
  addBtn: {
    marginTop: '0.01%'
  }
});

export default PatientMedicationScreen;
