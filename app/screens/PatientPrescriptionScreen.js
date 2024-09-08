// Libs
import React, { useEffect, useState } from 'react';
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
  let {patientID, patientId} = props.route.params;
  if (patientId) {
    patientID = patientId;
  }
  const navigation = useNavigation();

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // either 'add' or 'edit'

  // API call related states
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isRetry, setIsRetry] = useState(false);
  const [statusCode, setStatusCode] = useState(200);
  const [isReloadList, setIsReloadList] = useState(true);

  //Prescription data related states
  const [originalPrescriptionData, setOriginalPrescriptionData] = useState([]);
  const [prescriptionData, setPrescriptionData] = useState([]);
  const [formData, setFormData] = useState({ // for add/edit form
    "prescriptionID": null,
    "prescriptionListID": 1,
    "dosage": "",
    "frequencyPerDay": 1,
    "isChronic": true,
    "instruction": "",
    "startDate": new Date(),
    "endDate": new Date(),
    "afterMeal": true,
    "prescriptionRemarks": "",
    "prescriptionListDesc": "",
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
    'Date': 'date',
  };

  // Search, sort, and filter related states
  const [isDataInitialized, setIsDataInitialized] = useState(false);
  const [sort, setSort] = useState(sortFilterInitialState);
  const [searchQuery, setSearchQuery] = useState('');
  const [datetime, setDatetime] = useState(sortFilterInitialState);

  const [filterOptionDetails, setFilterOptionDetails] = useState({
    'Date': {
      'type': 'date',
      'options': {'min': {}, 'max': {},},
      'isFilter': true,
    },
  });

  // Refresh list when new medication is added or user requests refresh
  useFocusEffect(
    React.useCallback(() => {
      if (isReloadList) {
        refreshPrescriptionData();
        setIsReloadList(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReloadList]),
  );

  // Set isLoading to true when retrieving data
  const refreshPrescriptionData = () => {
    setIsLoading(true);
    const promiseFunction = async () => {
      await getPatientData();
      await getPrescriptionData();
    };
    promiseFunction();
  }
  
  // Get prescription data from backend
  const getPrescriptionData = async () => {
    if (patientID) {
      const response = await patientApi.getPatientPrescriptionList(patientID);
      if (response.ok) {
        console.log(response.data.data)
        setOriginalPrescriptionData([...response.data.data]);    
        setPrescriptionData(parsePrescriptionData([...response.data.data]));    
        setIsDataInitialized(true);
        setIsLoading(false);  
        setIsError(false);
        setIsRetry(false);
        setStatusCode(response.status);
      } else {
        console.log('Request failed with status code: ', response.status);
        setOriginalPrescriptionData([]);
        setPrescriptionData([]);
        setIsLoading(false);
        setIsError(true);
        setStatusCode(response.status);
        setIsRetry(true);
      }
    }
  };

  // Parse data
  const parsePrescriptionData = (tempData) => {
    return tempData.map(item=>({ // for add/edit form
      "prescriptionID": item.prescriptionID,
      "prescriptionListID": item.prescriptionListID,
      "dosage": item.dosage,
      "frequencyPerDay": item.frequencyPerDay,
      "isChronic": item.isChronic,
      "instruction": item.instruction,
      "startDate": item.startDate,
      "endDate": item.endDate,
      "afterMeal": item.afterMeal,
      "prescriptionRemarks": item.prescriptionRemarks,
      "prescriptionListDesc": item.prescriptionListDesc,
      "date" : item.date,
    }))
  }

  // Get patient data from backend
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

  // Show form to add prescription when add button is clicked
  const handleOnClickAddPrescription = () => {
    setIsModalVisible(true);
    setModalMode('add');
  };

  // Submit data to add prescription
  const handleModalSubmitAdd = async (tempPrescriptionFormData) => {
    setIsLoading(true);

    let alertTitle = '';
    let alertDetails = '';

    const result = await patientApi.addPatientPrescription(patientID, tempPrescriptionFormData);
    if (result.ok) {
      console.log('submitting prescription data', tempPrescriptionFormData);
      refreshPrescriptionData();
      setIsModalVisible(false);
      
      alertTitle = 'Successfully added prescription';
    } else {
      const errors = result.data?.message;

      console.log(result);

      result.data
      ? (alertDetails = `\n${errors}\n\nPlease try again.`)
      : (alertDetails = 'Please try again.');
      
      alertTitle = 'Error adding prescription';
    }
    
    Alert.alert(alertTitle, alertDetails);
  };

  // Edit Prescription
  const handleEditPrescription = (prescriptionID) => {
    setIsModalVisible(true);
    setModalMode('edit');
    
    const tempPrescriptionFormData = prescriptionData.filter(x=>x.prescriptionID == prescriptionID)[0];

    setFormData({
      "prescriptionID": tempPrescriptionFormData.prescriptionID,
      "prescriptionListID": tempPrescriptionFormData.prescriptionListID,
      "dosage": tempPrescriptionFormData.dosage,
      "frequencyPerDay": tempPrescriptionFormData.frequencyPerDay.toString(),
      "isChronic": tempPrescriptionFormData.isChronic,
      "instruction": tempPrescriptionFormData.instruction,
      "startDate": new Date(tempPrescriptionFormData.startDate),
      "endDate": new Date(tempPrescriptionFormData.endDate),
      "afterMeal": tempPrescriptionFormData.afterMeal,
      "prescriptionRemarks": tempPrescriptionFormData.prescriptionRemarks,
      "prescriptionListDesc": tempPrescriptionFormData.prescriptionListDesc,
    })
  }

  // Submit data to edit prescription
  const handleModalSubmitEdit = async () => {
    setIsLoading(true);

    let tempFormData = {...formData};

    let alertTitle = '';
    let alertDetails = '';

    const result = await patientApi.updatePrescription(patientID, tempFormData);
    if (result.ok) {
      refreshPrescriptionData();
      setIsModalVisible(false);
      
      alertTitle = 'Successfully edited prescription';
    } else {
      const errors = result.data?.message;
      console.log("Error editing prescription")

      result.data
      ? (alertDetails = `\n${errors}\n\nPlease try again.`)
      : (alertDetails = 'Please try again.');
      
      alertTitle = 'Error editing prescription';
    }
    
    Alert.alert(alertTitle, alertDetails);
  };

  // Ask user to confirm deletion of prescription
  const handleDeletePrescription = (prescriptionID) => {
    const tempData = prescriptionData.filter(x=>x.prescriptionID == prescriptionID)[0];

    Alert.alert('Are you sure you wish to delete this item?', 
    `Date: ${formatDateTime(new Date(tempData.date), true)}\n` +
    `Time: ${formatDateTime(new Date(tempData.date), false)}\n` +
    `Drug Name: ${tempData.prescriptionListDesc}\n` +
    `Dosage: ${tempData.dosage}\n` +
    `Frequency Per Day: ${tempData.frequencyPerDay}\n` +   
    `Instruction: ${tempData.instruction}\n` +
    `Start Date: ${formatDate(new Date(tempData.startDate), true)}\n` +
    `End Date: ${formatDate(new Date(tempData.endDate), true)}\n` +
    `After Meal: ${tempData.afterMeal ? "After Meal" : "Before Meal"} \n` +
    `Remarks: ${tempData.prescriptionRemarks}\n` +  
    `Chronic: ${tempData.isChronic ? "Long Term" : "Short Term"} \n`, 
    [
      {
        text: 'Cancel',
        onPress: ()=>{},
        style: 'cancel',
      },
      {text: 'OK', onPress: ()=>deletePrescription(prescriptionID)},
    ]);
  }

  // Delete Prescription
  const deletePrescription = async (prescriptionID) => {
    setIsLoading(true);

    let tempData = {prescriptionID: prescriptionID};

    let alertTitle = '';
    let alertDetails = '';

    const result = await patientApi.deletePrescription(tempData);
    if (result.ok) {
      refreshPrescriptionData();
      setIsModalVisible(false);
      
      alertTitle = 'Successfully deleted prescription';
    } else {
      const errors = result.data?.message;
      console.log("Error deleting prescription", result)

      result.data
      ? (alertDetails = `\n${errors}\n\nPlease try again.`)
      : (alertDetails = 'Please try again.');
      
      alertTitle = 'Error deleting prescription';
    }
    
    Alert.alert(alertTitle, alertDetails);
  }

  // Navigate to patient profile on click profile image
  const onClickProfile = () => {  
    navigation.navigate(routes.PATIENT_PROFILE, { id: patientID });
  }

  //Prescription data related states
  const getTableRowData = () => {
    return prescriptionData.map(({ patientID, prescriptionID, ...item }) => {
      // Directly map the 2 conditions accordingly
      const afterMeal = item.afterMeal ? 'Yes' : 'No';
      const isChronic = item.isChronic ? 'Yes' : 'No';

      // Convert the rest of the item properties and handle the date separately
      let rowData = [
        formatDateTime(new Date(item.date), true),
        formatDateTime(new Date(item.date), false),
        item.prescriptionListDesc,
        item.dosage,
        item.frequencyPerDay,
        item.instruction,
        formatDate(new Date(item.startDate), true), // Assuming formatDate() formats the date as needed
        formatDate(new Date(item.endDate), true),
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
                onInitialize={()=>setIsDataInitialized(false)}
                itemType='prescription'
                itemCount={prescriptionData.length}
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
            onRefresh={refreshPrescriptionData}
            refreshing={isLoading}
            height={'72%'}
            ListEmptyComponent={()=>noDataMessage(statusCode, isLoading, isError, 'No prescriptions found', true)}
            data={prescriptionData}
            keyboardShouldPersistTaps='handled'
            keyExtractor={item => (item.prescriptionID)}
            renderItem={({ item }) => { 
              return(
                <Swipeable
                  setIsScrolling={setIsScrolling}
                  onSwipeRight={()=>handleDeletePrescription(item.prescriptionID)}
                  onSwipeLeft={()=>handleEditPrescription(item.prescriptionID)}
                  underlay={<EditDeleteUnderlay/>}
                  item={
                    <TouchableOpacity 
                      style={styles.logContainer} 
                      activeOpacity={1} 
                      disabled={!isScrolling}
                    >
                      <PrescriptionItem
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
                        onDelete={()=>handleDeletePrescription(item.prescriptionID)}
                        onEdit={()=>handleEditPrescription(item.prescriptionID)}
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
        widthData={[120, 100, 130, 100, 200, 300, 120, 120, 120, 300, 100]}
        screenName={'patient prescription'}
        noDataMessage={noDataMessage(statusCode, isLoading, isError, 'No prescriptions found', false)}
        del={true}
        edit={true}
      />
      </View>
    )}  
    <View style={styles.addBtn}>
      <AddButton title="Add Prescription" onPress={handleOnClickAddPrescription}/>
      </View>
        <AddPatientPrescriptionModal
          showModal={isModalVisible}
          modalMode={modalMode}
          formData={formData}
          setFormData={setFormData}
          onClose={()=>setIsModalVisible(false)}
          onSubmit={modalMode == 'add' ? handleModalSubmitAdd : handleModalSubmitEdit}
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

export default PatientPrescriptionScreen;
