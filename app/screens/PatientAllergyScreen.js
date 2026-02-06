// Libs
import React, { useState, useCallback, useRef } from 'react';
import {
  Alert,
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

// API
import patientApi, { normalizePatientV1 } from 'app/api/patient';

// Utilities
import {
  isEmptyObject,
  noDataMessage,
  sortFilterInitialState,
} from 'app/utility/miscFunctions';

// Navigation
import routes from 'app/navigation/routes';

// Configurations
import colors from 'app/config/colors';

// Hooks
import formatDateTime from 'app/hooks/useFormatDateTime.js';

// Components
import AddPatientAllergyModal from 'app/components/AddPatientAllergyModal';
import ProfileNameButton from 'app/components/ProfileNameButton';
import SearchFilterBar from 'app/components/filter-components/SearchFilterBar';
import LoadingWheel from 'app/components/LoadingWheel';
import DynamicTable from 'app/components/DynamicTable';
import PatientAllergyItem from 'app/components/PatientAllergyItem';
import AddButton from 'app/components/AddButton';

// ---------- Local Normalizers ----------
// Normalize allergy data from v1 API to UI shape (only used in this screen)
const normalizePatientAllergyV1 = (a = {}) => ({
  allergyID:
    a.Patient_AllergyID ?? a.patient_allergy_id ?? a.id ?? a.allergy_id ?? null,
  patientID: a.PatientID ?? a.patient_id ?? null,
  allergyListID:
    a.AllergyTypeID ?? a.allergy_type_id ?? a.AllergyListID ?? null,
  allergyReactionListID:
    a.AllergyReactionTypeID ?? a.allergy_reaction_type_id ?? a.AllergyReactionListID ?? null,
  allergyRemarks: a.AllergyRemarks ?? a.allergy_remarks ?? '',
  allergyListDesc:
    a.AllergyTypeValue ??
    a.allergy_type_desc ??
    a.allergyListDesc ??
    a.allergy_type?.description ??
    '',
  allergyReaction:
    a.AllergyReactionTypeValue ??
    a.allergy_reaction_type_desc ??
    a.allergyReaction ??
    a.allergy_reaction_type?.description ??
    '',
  createdDate:
    a.CreatedDateTime ?? a.created_at ?? a.createdDate ?? a.created_date ?? null,
});

function PatientAllergyScreen(props) {
  const routeParams = props?.route?.params ?? {};
  let { patientID, patientId, patientProfile } = routeParams;
  if (patientId) {
    patientID = patientId;
  }
  const testID = `allergy_screen_${patientID}`;

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
    Allergy: 'allergyListDesc',
    Reaction: 'allergyReaction',
    Date: 'createdDate',
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
    Date: {
      type: 'date',
      options: { min: {}, max: {} },
      isFilter: true,
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

  const [patientAllergyIDs, setPatientAllergyIDs] = useState([]);

  const normalizePatientHeader = (p) => {
    if (!p) return {};
    const preferredName = p.preferredName ?? p.PreferredName ?? '';
    let firstName = p.firstName ?? p.FirstName ?? '';
    let lastName = p.lastName ?? p.LastName ?? '';
    const fullName = p.fullName ?? p.FullName ?? '';
    if ((!firstName || !lastName) && fullName) {
      const parts = String(fullName).split(/\s+/).filter(Boolean);
      firstName = firstName || parts[0] || '';
      lastName = lastName || (parts.length > 1 ? parts.slice(1).join(' ') : '');
    }
    return {
      profilePicture: p.profilePicture ?? p.ProfilePicture ?? p.profile_photo ?? p.profile_picture,
      preferredName,
      firstName,
      lastName,
    };
  };

  const [patientData, setPatientData] = useState(() => normalizePatientHeader(patientProfile));
  const [isReloadPatientList, setIsReloadPatientList] = useState(true);

  // Allergy data related states
  const [originalAllergyData, setOriginalAllergyData] = useState([]);
  const [allergyData, setAllergyData] = useState([]);
  const [allergyFormData, setAllergyFormData] = useState({
    allergyID: null,
    allergyListID: 1,
    allergyReactionListID: 1,
    allergyListDesc: '',
    allergyReaction: '',
    allergyRemarks: '',
  });

  // Track whether this screen is currently active to avoid setState after navigating away
  const isActiveRef = useRef(false);
  // Monotonic request id to ignore out-of-order async responses
  const requestIdRef = useRef(0);

  const refreshAllergyData = useCallback(async () => {
    if (!patientID) return;

    const requestId = ++requestIdRef.current;
    setIsLoading(true);

    const shouldFetchPatient = !patientProfile && isEmptyObject(patientData);

    try {
      await Promise.all([
        getAllergyData(() => isActiveRef.current && requestIdRef.current === requestId),
        shouldFetchPatient
          ? getPatientData(() => isActiveRef.current && requestIdRef.current === requestId)
          : Promise.resolve(),
      ]);
    } finally {
      if (isActiveRef.current && requestIdRef.current === requestId) {
        setIsLoading(false);
      }
    }
  }, [patientID, patientProfile, patientData]);

  useFocusEffect(
    useCallback(() => {
      isActiveRef.current = true;

      if (isReloadPatientList) {
        refreshAllergyData();
        setIsReloadPatientList(false);
      }

      return () => {
        // Prevent setState / heavy logs after leaving screen
        isActiveRef.current = false;
      };
    }, [isReloadPatientList, refreshAllergyData]),
  );

  const getPatientData = async (isActive = () => true) => {
    if (!patientID) return;
    const response = await patientApi.readPatientV1(patientID);

    if (!isActive()) return;

    if (response.ok) {
      // v1 wraps the patient in response.data.data; extract before normalizing
      const rawPatient = response.data?.data ?? response.data;
      const normalized = normalizePatientV1(rawPatient);
      setPatientData(normalized);
      setIsError(false);
      setIsRetry(false);
      setStatusCode(response.status);
    } else {
      setPatientData({});
      setIsError(true);
      setStatusCode(response.status);
      setIsRetry(true);
    }
  };


  // Get allergy data from backend
  const getAllergyData = async (isActive = () => true) => {
    if (!patientID) return;
    const response = await patientApi.listPatientAllergiesV1(patientID, { pageNo: 0, pageSize: 100 });

    if (!isActive()) return;

    if (response.ok || response.status === 404) {
      // Patient service v1 returns a paginated payload with `data` array
      // Treat 404 as "no allergies found" rather than an error
      const raw = Array.isArray(response.data)
        ? response.data
        : response.data?.data ?? response.data?.results ?? [];

      const normalized = raw.map(normalizePatientAllergyV1);

      setOriginalAllergyData(normalized);
      setAllergyData(parseAllergyData(normalized));
      const existingTypeIds = normalized
        .map((a) => a.allergyListID)
        .filter((x) => x !== null && x !== undefined);

      setPatientAllergyIDs(existingTypeIds);
      setIsDataInitialized(true);
      setIsError(false);
      setIsRetry(false);
      setStatusCode(response.status);
    } else {
      setOriginalAllergyData([]);
      setAllergyData([]);
      setPatientAllergyIDs([]); // Reset allergy IDs
      setIsError(true);
      setStatusCode(response.status);
      setIsRetry(true);
    }
  };

  // Parse data
  const parseAllergyData = (tempData) => {
    return tempData.map((item) => ({
      // for add/edit form
      allergyID: item.allergyID,
      allergyListID: item.allergyListID,
      allergyReactionListID: item.allergyReactionListID,
      allergyRemarks: item.allergyRemarks,
      allergyListDesc: item.allergyListDesc,
      allergyReaction: item.allergyReaction,
      createdDate: item.createdDate,
    }));
  };

  const handleAddAllergy = () => {
    setAllergyFormData({
      allergyID: null,
      allergyListID: 1,
      allergyReactionListID: 1,
      allergyListDesc: '',
      allergyReaction: '',
      allergyRemarks: '',
    });
    setIsModalVisible(true);
    setModalMode('add');
  };

  const handleEditAllergy = (item) => {
    setAllergyFormData({
      allergyID: item.allergyID,
      allergyListID: item.allergyListID,
      allergyReactionListID: item.allergyReactionListID,
      allergyListDesc: item.allergyListDesc,
      allergyReaction: item.allergyReaction,
      allergyRemarks: item.allergyRemarks,
    });
    setIsModalVisible(true);
    setModalMode('edit');
  };

  const handleModalSubmit = async (allergyData) => {
    setIsLoading(true);

    let alertTitle = '';
    let alertDetails = '';

    const result =
      modalMode === 'edit'
        ? await patientApi.updatePatientAllergyV1(
            patientID,
            allergyFormData?.allergyID ?? allergyData?.Patient_AllergyID,
            {
              // Normalize into the same shape expected by the API helper
              AllergyListID: allergyData?.AllergyListID,
              AllergyReactionListID: allergyData?.AllergyReactionListID,
              AllergyRemarks: allergyData?.AllergyRemarks,
              IsDeleted: '0',
            },
          )
        : await patientApi.addPatientAllergyV1(patientID, allergyData);

    if (result.ok) {
      await refreshAllergyData();
      setIsModalVisible(false);

      alertTitle = modalMode === 'edit' ? 'Successfully updated allergy' : 'Successfully added allergy';
    } else {
      const errors = result.data?.message;

      result.data
        ? (alertDetails = `\n${errors}\n\nPlease try again.`)
        : (alertDetails = 'Please try again.');

      alertTitle = modalMode === 'edit' ? 'Error updating allergy' : 'Error adding allergy';
      setIsLoading(false);
    }

    Alert.alert(alertTitle, alertDetails);
  };

  // Ask user to confirm deletion of allergy
  const handleDeleteAllergy = (allergyID) => {
    const tempData = allergyData.filter((x) => x.allergyID == allergyID)[0];

    Alert.alert(
      'Are you sure you wish to delete this item?',
      `Date: ${formatDateTime(new Date(tempData.createdDate), true)}\n` +
        `Time: ${formatDateTime(new Date(tempData.createdDate), false)}\n` +
        `Allergic To: ${tempData.allergyListDesc}\n` +
        `Reaction: ${tempData.allergyReaction}\n` +
        `Notes: ${tempData.allergyRemarks}\n`,
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        { text: 'OK', onPress: () => deleteAllergy(allergyID) },
      ],
    );
  };

  // Delete allergy
  const deleteAllergy = async (allergyID) => {
    setIsLoading(true);

    let alertTitle = '';
    let alertDetails = '';

    const result = await patientApi.deletePatientAllergyV1(patientID, allergyID);
    if (result.ok) {
      await refreshAllergyData();
      setIsModalVisible(false);

      alertTitle = 'Successfully deleted allergy';
    } else {
      const errors = result.data?.message;

      result.data
        ? (alertDetails = `\n${errors}\n\nPlease try again.`)
        : (alertDetails = 'Please try again.');

      alertTitle = 'Error deleting allergy';
      setIsLoading(false);
    }

    Alert.alert(alertTitle, alertDetails);
  };

  const onClickProfile = () => {
    navigation.navigate(routes.PATIENT_PROFILE, { id: patientID });
  };

  const getTableRowData = () => {
    return allergyData.map(
      ({
        patientID,
        allergyID,
        allergyListID,
        allergyReactionListID,
        ...item
      }) => {
        // Convert the rest of the item properties and handle the date separately
        let rowData = [
          formatDateTime(new Date(item.createdDate), true),
          formatDateTime(new Date(item.createdDate), false),
          item.allergyListDesc,
          item.allergyReaction,
          item.allergyRemarks,
        ];

        return rowData;
      },
    );
  };

  const getTableHeaderData = () => {
    return ['Date', 'Time', 'Allergic To', 'Reaction', 'Notes'];
  };

  return (
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
            onInitialize={() => setIsDataInitialized(false)}
            itemType="allergy"
            itemCount={allergyData.length}
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
          onRefresh={refreshAllergyData}
          refreshing={isLoading}
          style={{ flex: 1 }}
          ListEmptyComponent={() =>
            noDataMessage(
              statusCode,
              isLoading,
              isError,
              'No allergies found',
              true,
            )
          }
          data={allergyData}
          keyboardShouldPersistTaps="handled"
          keyExtractor={(item) => item.allergyID}
          renderItem={({ item }) => {
            return (
              <View
                testID={`${testID}_${item.allergyID}_container`}
                style={styles.logContainer}
              >
                <PatientAllergyItem
                  testID={`${testID}_${item.allergyID}`}
                  createdDate={item.createdDate}
                  allergyListDesc={item.allergyListDesc}
                  allergyReaction={item.allergyReaction}
                  allergyRemarks={item.allergyRemarks}
                  onEdit={() => handleEditAllergy(item)}
                  onDelete={() => handleDeleteAllergy(item.allergyID)}
                />
              </View>
            );
          }}
        />
      ) : (
        <View style={{ flex: 1, marginBottom: 20, marginHorizontal: 40 }}>
          <DynamicTable
            headerData={getTableHeaderData()}
            rowData={getTableRowData()}
            widthData={[125, 100, 110, 175, 200]}
            screenName={'patient allergy'}
            noDataMessage={noDataMessage(
              statusCode,
              isLoading,
              isError,
              'No allergies found',
              false,
            )}
            del={true}
          />
        </View>
      )}

      <View style={styles.addBtn}>
        <AddButton
          testID={`${testID}_addAllergy`}
          title="Add Allergy"
          onPress={handleAddAllergy}
          containerStyle={{ flex: 0, marginTop: 8, marginBottom: 0 }}
        />
      </View>

      <AddPatientAllergyModal
        testID={`${testID}_modal_${modalMode === 'add' ? 'add' : 'edit'}`}
        showModal={isModalVisible}
        modalMode={modalMode}
        allergyFormData={allergyFormData}
        setAllergyFormData={setAllergyFormData}
        onClose={() => setIsModalVisible(false)}
        onSubmit={handleModalSubmit}
        existingAllergyIDs={patientAllergyIDs}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    flex: 1,
    paddingBottom: 10,
  },
  logContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  addBtn: {
    marginTop: '0.01%',
    paddingBottom: 8,
  },
});

export default PatientAllergyScreen;
