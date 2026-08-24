// Libs
import React, { useContext, useState } from 'react';
import { Alert, Keyboard, StyleSheet, TouchableOpacity } from 'react-native';
import { FlatList, View } from 'native-base';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import patientApi from 'app/api/patient';
import scheduleApi from 'app/api/schedule';
import { patientFromApiResponse, patientProfileLines } from 'app/utility/patientHeader';
import { confirmAndLogMedicationAdministration } from 'app/utility/confirmMedicationAdministration';

const {
  listPatientMedicationsV1,
  addPatientMedicationV1,
  updatePatientMedicationV1,
  deletePatientMedicationV1,
  readPatientV1,
} = patientApi;

// Utilities
import {
  formatTimeHM24,
  convertTimeMilitary,
  isEmptyObject,
  noDataMessage,
  sortFilterInitialState,
  formatMilitaryToAMPM,
  formatDate,
  formatTimeAMPM,
} from 'app/utility/miscFunctions';

// Navigation
import routes from 'app/navigation/routes';

// Configurations
import colors from 'app/config/colors';

// Auth
import AuthContext from 'app/auth/context';

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
  let { patientID, patientId } = props.route.params;
  if (patientId) patientID = patientId;

  const testID = `medication_screen_${patientID}`;
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);

  // States
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [displayMode, setDisplayMode] = useState('rows');
  const [sort, setSort] = useState(sortFilterInitialState);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDataInitialized, setIsDataInitialized] = useState(false);
  const [datetime, setDatetime] = useState(sortFilterInitialState);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isRetry, setIsRetry] = useState(false);
  const [statusCode, setStatusCode] = useState(200);
  const [isReloadPatientList, setIsReloadPatientList] = useState(true);

  const [originalUnparsedData, setOriginalUnparsedData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [data, setData] = useState([]);
  const [formData, setFormData] = useState({
    medicationID: null,
    prescriptionName: '',
    dosage: '',
    administerTime: [],
    instruction: '',
    startDateTime: new Date(),
    endDateTime: new Date(),
    prescriptionRemarks: '',
  });

  const [patientData, setPatientData] = useState({});
  const [isScrolling, setIsScrolling] = useState(false);
  const [assignedCaregiverId, setAssignedCaregiverId] = useState(null);
  const [tempCaregiverId, setTempCaregiverId] = useState(null);

  // Refresh list
  useFocusEffect(
    React.useCallback(() => {
      if (isReloadPatientList) {
        refreshMedData();
        setIsReloadPatientList(false);
      }
    }, [isReloadPatientList]),
  );

  const refreshMedData = () => {
    setIsLoading(true);
    (async () => {
      await getMedicationData();
      await getPatientData();
      await getAssignedCaregiver();
    })();
  };

  const getAssignedCaregiver = async () => {
    if (!patientID || !patientApi.getAllocationMap) return;
    try {
      const map = await patientApi.getAllocationMap();
      const allocation = map?.[String(patientID)] || {};
      setAssignedCaregiverId(allocation.caregiverId || null);
      setTempCaregiverId(allocation.tempCaregiverId || null);
    } catch (error) {
      setAssignedCaregiverId(null);
      setTempCaregiverId(null);
    }
  };

  const getMedicationData = async () => {
    if (patientID) {
      const response = await listPatientMedicationsV1(patientID);
      if (response.ok) {
        let rows = response.data.data || [];
        if (!rows.length) {
          rows = await loadSchedulerMedications(patientID);
        }
        setOriginalUnparsedData(rows);
        parseMedicationData(rows);
        setIsError(false);
        setIsRetry(false);
        setStatusCode(response.status);
      } else {
        console.log('Request failed with status code: ', response.status);
        const fallback = await loadSchedulerMedications(patientID);
        if (fallback.length) {
          setOriginalUnparsedData(fallback);
          parseMedicationData(fallback);
          setIsError(false);
          setIsRetry(false);
          setStatusCode(200);
        } else {
          setOriginalUnparsedData([]);
          setOriginalData([]);
          setData([]);
          setIsError(true);
          setIsRetry(true);
          setStatusCode(response.status);
        }
      }
      setIsLoading(false);
    }
  };

  const loadSchedulerMedications = async (id) => {
    try {
      const res = await scheduleApi.getMedicationScheduleV1();
      if (!res?.ok) return [];
      const rows = Array.isArray(res.data) ? res.data : res.data?.data || [];
      const today = new Date().toISOString().slice(0, 10);
      return rows
        .filter((item) => {
          const patient = item.PatientID ?? item.patientID ?? item.patient_id;
          const date = String(item.AdministerDate ?? item.administerDate ?? '').slice(0, 10);
          return String(patient) === String(id) && (!date || date === today);
        })
        .map((item) => ({
          medicationID: item.Id ?? item.id,
          patientID: id,
          prescriptionName: item.PrescriptionName ?? item.prescriptionName ?? 'Scheduled medication',
          dosage: item.Dosage ?? item.dosage ?? '',
          administerTime: String(item.AdministerTime ?? item.administerTime ?? ''),
          instruction: item.Instruction ?? item.instruction ?? '',
          startDateTime: item.AdministerDate ?? item.administerDate,
          endDateTime: item.AdministerDate ?? item.administerDate,
          prescriptionRemarks: '',
        }));
    } catch {
      return [];
    }
  };

  const getPatientData = async () => {
    if (patientID) {
      const response = await readPatientV1(patientID);
      if (response.ok) {
        setPatientData(patientFromApiResponse(response));
        setIsError(false);
        setIsRetry(false);
        setStatusCode(response.status);
      } else {
        console.log('Request failed with status code: ', response.status);
        setPatientData({});
        setIsError(true);
        setIsRetry(true);
        setStatusCode(response.status);
      }
      setIsLoading(false);
    }
  };

  const parseMedicationData = (tempData) => {
    const tempMedData = [];
    tempData.forEach((item) => {
      const medTimes = String(item.administerTime ?? '')
        .split(',')
        .map((time) => time.trim())
        .filter(Boolean);
      (medTimes.length ? medTimes : ['']).forEach((time) => {
        tempMedData.push({
          medID: item.medicationID,
          medName: item.prescriptionName,
          medDosage: item.dosage,
          medTime: time ? convertTimeMilitary(time) : '',
          medNote: item.instruction,
          medStartDate: item.startDateTime,
          medEndDate: item.endDateTime,
          medRemarks: item.prescriptionRemarks,
        });
      });
    });
    setOriginalData(tempMedData);
    setData(tempMedData);
    setIsDataInitialized(true);
    setIsLoading(false);
  };

  const handleOnClickAddMedication = () => {
    setIsModalVisible(true);
    setModalMode('add');
  };

  const handleModalSubmitAdd = async (medData) => {
    setIsLoading(true);
    const tempData = { ...medData, administerTime: convertAdmTimeToMilitary(medData.administerTime) };

    const result = await addPatientMedicationV1(patientID, tempData);
    if (result.ok) {
      refreshMedData();
      setIsModalVisible(false);
      Alert.alert('Successfully added medication', 'Medication has been added to the patient.');
    } else {
      Alert.alert('Error adding medication', result.data?.message || 'Please try again.');
    }
    setIsLoading(false);
  };

  const handleEditMedication = (medID) => {
    setIsModalVisible(true);
    setModalMode('edit');
    const unparsedMedData = originalUnparsedData.find(
      (x) => x.medicationID == medID && x.patientID == patientID,
    );
    if (!unparsedMedData) {
      Alert.alert('Medication not found', 'Please refresh and try again.');
      return;
    }
    setFormData({
      medicationID: unparsedMedData.medicationID,
      prescriptionName: unparsedMedData.prescriptionName,
      dosage: unparsedMedData.dosage,
      administerTime: admStrToTime(unparsedMedData.administerTime),
      instruction: unparsedMedData.instruction,
      startDateTime: new Date(unparsedMedData.startDateTime),
      endDateTime: new Date(unparsedMedData.endDateTime),
      prescriptionRemarks: unparsedMedData.prescriptionRemarks,
    });
  };

  const admStrToTime = (admStr) =>
    admStr.split(',').map((item) => new Date(convertTimeMilitary(item)));

  const handleModalSubmitEdit = async () => {
    setIsLoading(true);
    const tempFormData = { ...formData, administerTime: convertAdmTimeToMilitary(formData.administerTime) };

    const result = await updatePatientMedicationV1(patientID, tempFormData);
    if (result.ok) {
      refreshMedData();
      setIsModalVisible(false);
      Alert.alert('Successfully edited medication');
    } else {
      Alert.alert('Error editing medication', result.data?.message || 'Please try again.');
    }
    setIsLoading(false);
  };

  const handleDeleteMedication = (medID) => {
    const unparsedMedData = originalUnparsedData.find(
      (x) => x.medicationID == medID && x.patientID == patientID,
    );
    if (!unparsedMedData) return;

    Alert.alert(
      'Are you sure you wish to delete this medication?',
      `Medication: ${unparsedMedData.prescriptionName}\nTime: ${formatAdmString(unparsedMedData.administerTime)}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK', onPress: () => deleteMedication(medID) },
      ],
    );
  };

  const deleteMedication = async (medID) => {
    setIsLoading(true);
    const result = await deletePatientMedicationV1({ patientID, medicationID: medID });
    if (result.ok) {
      refreshMedData();
      setIsModalVisible(false);
      Alert.alert('Successfully deleted medication', 'Medication has been removed from the patient.');
    } else {
      Alert.alert('Error deleting medication', result.data?.message || 'Please try again.');
    }
    setIsLoading(false);
  };

  const formatAdmString = (timeString) =>
    timeString.split(',').map((item) => formatMilitaryToAMPM(item)).join(', ');

  const onClickProfile = () => {
    navigation.navigate(routes.PATIENT_PROFILE, { id: patientID });
  };

  const convertAdmTimeToMilitary = (admTimeArray) =>
    admTimeArray.map((item) => formatTimeHM24(new Date(item), false)).join(',');

  const getTableRowData = () =>
    data.map((item) =>
      Object.entries(item).map(([key, value]) => {
        if (key.toLowerCase().includes('date')) return formatDate(new Date(value), true);
        if (key.toLowerCase().includes('time')) return formatTimeAMPM(new Date(value));
        return String(value);
      }),
    );

  const getTableHeaderData = () =>
    data.length > 0
      ? [
          'ID',
          ...Object.keys(data[0])
            .filter((x) => x !== 'medID')
            .map((item) => 'Prescription ' + item.split('med')[1].replace(/([a-z])([A-Z])/g, '$1 $2')),
        ]
      : null;

  const onClickAdminister = (index) => {
    const tempData = data[index];
    confirmAndLogMedicationAdministration({
      user,
      patientID,
      patientName: patientData.preferredName,
      medName: tempData.medName,
      medDosage: tempData.medDosage,
      medTime: tempData.medTime,
      caregiverId: assignedCaregiverId,
      tempCaregiverId,
      formatTime: formatTimeAMPM,
    });
  };

  return isLoading ? (
    <ActivityIndicator visible />
  ) : (
    <View style={styles.container}>
      <View style={{ justifyContent: 'space-between' }}>
        <View style={{ alignSelf: 'center', marginTop: 15, maxHeight: 120 }}>
          {!isEmptyObject(patientData) ? (
            <ProfileNameButton
              testID={`${testID}_profileNameButton`}
              profilePicture={patientData.profilePicture}
              profileLineOne={patientProfileLines(patientData).line1}
              profileLineTwo={patientProfileLines(patientData).line2}
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
            originalList={originalData}
            setList={setData}
            SEARCH_OPTIONS={['Medication']}
            FIELD_MAPPING={{
              Medication: 'medName',
              'Start Date': 'medStartDate',
              'End Date': 'medEndDate',
              'Medication Time': 'medTime',
            }}
            SORT_OPTIONS={['End Date', 'Medication', 'Medication Time', 'Start Date']}
            FILTER_OPTIONS={['Medication Time', 'Start Date', 'End Date']}
            filterOptionDetails={{
              'Medication Time': { type: 'time', options: { min: {}, max: {} }, isFilter: true },
              'Start Date': { type: 'date', options: { min: {}, max: {} }, isFilter: true },
              'End Date': { type: 'date', options: { min: {}, max: {} }, isFilter: true },
            }}
            datetime={datetime}
            setDatetime={setDatetime}
            sort={sort}
            setSort={setSort}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            initializeData={isDataInitialized}
            onInitialize={() => setIsDataInitialized(false)}
            itemType="medications"
            itemCount={data.length}
            displayMode={displayMode}
            setDisplayMode={setDisplayMode}
            DISPLAY_MODES={['rows', 'table']}
          />
        </View>
      </View>
      {displayMode === 'rows' ? (
        <FlatList
          onTouchStart={() => Keyboard.dismiss()}
          onScrollBeginDrag={() => setIsScrolling(true)}
          onScrollEndDrag={() => setIsScrolling(false)}
          onRefresh={refreshMedData}
          refreshing={isLoading}
          height={'72%'}
          ListEmptyComponent={() =>
            noDataMessage(statusCode, isLoading, isError, 'No medications found', true)
          }
          data={data}
          keyboardShouldPersistTaps="handled"
          keyExtractor={(item) => `${item.medID}-${new Date(item.medTime).getTime()}`}
          renderItem={({ item }) => (
            <Swipeable
              setIsScrolling={setIsScrolling}
              onSwipeRight={() => handleDeleteMedication(item.medID)}
              onSwipeLeft={() => handleEditMedication(item.medID)}
              underlay={<EditDeleteUnderlay />}
              item={
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
                    caregiverId={assignedCaregiverId}
                    tempCaregiverId={tempCaregiverId}
                    onEdit={() => handleEditMedication(item.medID)}
                    onDelete={() => handleDeleteMedication(item.medID)}
                  />
                </TouchableOpacity>
              }
            />
          )}
        />
      ) : (
        <View style={{ height: '72%', marginBottom: 20, marginHorizontal: 40 }}>
          <DynamicTable
            headerData={getTableHeaderData()}
            rowData={getTableRowData()}
            widthData={[200, 200, 200, 200, 270, 270, 300]}
            screenName={'patient medication'}
            onClickEdit={handleEditMedication}
            onClickDelete={handleDeleteMedication}
            noDataMessage={noDataMessage(statusCode, isLoading, isError, 'No medications found', false)}
            customColumns={[
              {
                btnTitle: 'Log',
                colTitle: 'Log medication administration',
                onPress: onClickAdminister,
                color: 'green',
                width: 300,
              },
            ]}
            edit
            del
          />
        </View>
      )}
      <View style={styles.addBtn}>
        <AddButton title="Add Medication" onPress={handleOnClickAddMedication} />
      </View>
      <AddPatientMedicationModal
        showModal={isModalVisible}
        modalMode={modalMode}
        formData={formData}
        setFormData={setFormData}
        onClose={() => setIsModalVisible(false)}
        onSubmit={modalMode === 'add' ? handleModalSubmitAdd : handleModalSubmitEdit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.white },
  medContainer: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  addBtn: { marginTop: '0.01%' },
});

export default PatientMedicationScreen;
