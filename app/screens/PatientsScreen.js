import React, { useState, useEffect, useRef } from 'react';
import { Center, VStack, ScrollView, Fab, Icon, FlatList, IconButton, Button } from 'native-base';
import {
  StyleSheet,
  View,
  RefreshControl,
  Dimensions,
  Text,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

// API
import patientApi from 'app/api/patient';

// Configurations
import routes from 'app/navigation/routes';
import colors from 'app/config/colors';

// Components
import ActivityIndicator from 'app/components/ActivityIndicator';
import ProfileNameButton from 'app/components/ProfileNameButton';
import MessageDisplayCard from 'app/components/MessageDisplayCard';
import SearchFilterBar from 'app/components/filter-components/SearchFilterBar';
import BackToTopButton from 'app/components/BackToTopButton';

// Utilities
import {
  isEmptyObject,
  noDataMessage,
  sortFilterInitialState,
} from 'app/utility/miscFunctions';
import * as fav from 'app/utility/favorites'; // ⭐ favourites helper

function PatientsScreen({ navigation }) {
  // View modes user can switch between (displayed as tab on top)
  const VIEW_MODES = {
    'My Patients': 'myPatients',
    'All Patients': 'allPatients',
  };

  // --- normalize FastAPI v1 patient → legacy fields used by this screen
  const normalizePatientV1 = (p = {}) => {
    const id =
      p.patient_id ??
      p.id ??
      p.patientID ??
      p.PatientId ??
      p.PatientID ??
      null;

    // Prefer existing first/last if given; otherwise split name
    const hasFirst =
      typeof p.first_name === 'string' || typeof p.firstName === 'string';
    const hasLast =
      typeof p.last_name === 'string' || typeof p.lastName === 'string';
    const nameStr = typeof p.name === 'string' ? p.name.trim() : '';

    const firstName = String(
      p.first_name ?? p.firstName ?? (hasFirst ? '' : (nameStr.split(' ')[0] ?? ''))
    ).trim();

    const lastName = String(
      p.last_name ?? p.lastName ?? (hasLast ? '' : (nameStr.split(' ').slice(1).join(' ') ?? ''))
    ).trim();

    return {
      ...p,
      // legacy fields this screen already uses:
      patientID: id,
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`.trim(),
      profilePicture:
        p.profilePicture ??
        p.profile_picture ??
        p.profile_photo ??
        p.photoUrl ??
        p.avatar ??
        null,
      // additional fields referenced by UI/filters
      preferredName: p.preferred_name ?? p.preferredName ?? '',
      caregiverName: p.caregiver_name ?? p.caregiverName ?? null,
      startDate: p.start_date ?? p.startDate ?? null,
      isActive: typeof p.is_active === 'boolean' ? p.is_active : p.isActive,
    };
  };

  // Options for user to search by
  const SEARCH_OPTIONS = ['Full Name', 'Preferred Name'];

  // Sort options based on view mode
  const SORT_OPTIONS = {
    myPatients: ['Full Name', 'Preferred Name', 'Start Date'],
    allPatients: ['Full Name', 'Preferred Name', 'Start Date', 'Caregiver'],
  };

  // Filter options based on view mode
  const FILTER_OPTIONS = {
    myPatients: ['Patient Status', 'Start Date'],
    allPatients: ['Patient Status', 'Caregiver', 'Start Date'],
  };

  // Mapping between sort/filter/search names and the respective field in the patient data retrieved from the backend
  const FIELD_MAPPING = {
    'Full Name': 'fullName',
    'Preferred Name': 'preferredName',
    Caregiver: 'caregiverName',
    'Start Date': 'startDate',
    'Patient Status': 'isActive',
  };

  // Scrollview ref used to programmatically scroll to top of list
  const patientListRef = useRef(null);

  // Patient data related states
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isRetry, setIsRetry] = useState(false);
  const [statusCode, setStatusCode] = useState(200);
  const [isDataInitialized, setIsDataInitialized] = useState(false);
  const [originalListOfPatients, setOriginalListOfPatients] = useState([]); // list of patients without sort, search, filter
  const [listOfPatients, setListOfPatients] = useState([]); // list of patients after sort, search, filter
  const [patientCountInfo, setPatientCountInfo] = useState({}); // list of patients for each caregiver (differentiated by patient status)
  const [justUpdated, setJustUpdated] = useState(false);
  const [patientStatus, setPatientStatus] = useState('active'); // active, inactive, ''
  const [tempSelPatientStatus, setTempSelPatientStatus] = useState('active'); // active, inactive, ''
  const [viewMode, setViewMode] = useState('myPatients'); // myPatients, allPatients
  const [isReloadPatientList, setIsReloadPatientList] = useState(false);
  const [applySortFilter, setApplySortFilter] = useState(true);

  // ⭐ favourites state
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [showFavOnly, setShowFavOnly] = useState(false);

  // Search related states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOption, setSearchOption] = useState('Full Name');

  // Sort/filter related states
  const [sort, setSort] = useState(sortFilterInitialState);
  const [dropdown, setDropdown] = useState(sortFilterInitialState);
  const [chip, setChip] = useState(sortFilterInitialState);
  const [datetime, setDatetime] = useState(sortFilterInitialState);

  // Filter details related state
  const [filterOptionDetails, setFilterOptionDetails] = useState({
    Caregiver: {
      type: 'dropdown',
      options: {},
      isFilter: true,
    },
    'Patient Status': {
      type: 'chip',
      options: { Active: true, Inactive: false, All: undefined }, // define custom options and map to corresponding values in patient data
      isFilter: false,
    },
    'Start Date': {
      type: 'date',
      options: { min: {}, max: {} },
      isFilter: true,
    },
  });

  // Patient status names mapped to actual values
  const PATIENT_STATUSES = {
    Active: 'active',
    Inactive: 'inactive',
    All: '',
  };

  // Refresh list when new patient is added or user requests refresh
  useFocusEffect(
    React.useCallback(() => {
      if (isReloadPatientList) {
        refreshPatientData();
        setIsReloadPatientList(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReloadPatientList]),
  );

  // Refresh patient data from backend when user switches between 'My Patients' and 'All Patients'
  useEffect(() => {
    refreshPatientData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  // Load favourites from local storage when screen mounts
  useEffect(() => {
    (async () => {
      const list = await fav.getAll();
      setFavoriteIds(new Set(list));
    })();
  }, []);

  // When user toggles patient status filter, update caregiver filter options
  useEffect(() => {
    if (
      chip['tempSel']['Patient Status'] != undefined &&
      viewMode == 'allPatients' &&
      !justUpdated
    ) {
      let tempPatientStatus =
        PATIENT_STATUSES[
          !isEmptyObject(chip['tempSel'])
            ? chip['tempSel']['Patient Status']['label']
            : 'Active'
        ];
      if (tempPatientStatus != tempSelPatientStatus) {
        updateCaregiverFilterOptions({ tempPatientStatus: tempPatientStatus });
        setApplySortFilter(false);
        setIsDataInitialized(true);
        setTempSelPatientStatus(tempPatientStatus);
      }
    } else {
      setJustUpdated(false);
    }
  }, [chip['tempSel']['Patient Status']]);

  // --- list patients from the new Patient Service (V1)
  const getListOfPatients = async (status = 'active') => {
    // simple pagination; aggregate to keep current UI behavior
    const page_size = 100; // adjust if needed
    let page = 1;
    let all = [];
    let keepGoing = true;

    while (keepGoing) {
      // NOTE: we only pass q/page/page_size because patient.js forwards only those (no teammate code touched)
      const res = await patientApi.listPatientsV1({
        page,
        page_size,
        // q: searchQuery  // (optional: wire to backend later)
      });

      if (!res.ok) {
        setStatusCode(res.status);
        setIsError(true);
        return { status: res.status, ok: false };
      }

      const body = res.data || {};
      // support several common shapes: {results: []}, {items: []}, {data: []}, or an array
      const pageArray =
        (Array.isArray(body.results) && body.results) ||
        (Array.isArray(body.items) && body.items) ||
        (Array.isArray(body.data) && body.data) ||
        (Array.isArray(body) && body) ||
        [];

      all = all.concat(pageArray.map(normalizePatientV1));

      // stop when fewer than page_size came back, or backend says no next page
      const nextUrl = body.next || body.nextPageUrl || null;
      if (pageArray.length < page_size || !nextUrl) keepGoing = false;
      page += 1;
    }

    // --- apply patient status filter LOCALLY (no API change needed)
    const want = status === 'active' ? true : status === 'inactive' ? false : undefined;
    const filtered =
      want === undefined ? all : all.filter(p => p.isActive === want);

    setOriginalListOfPatients([...filtered]);
    setListOfPatients([...filtered]);
    setIsError(false);
    setStatusCode(200);
    return { status: 200, ok: true };
  };

  // Retrieve caregivers patient count list from backend (legacy for now)
  const getPatientCountInfo = async (tempPatientStatus = patientStatus) => {
    const response = await patientApi.getPatientStatusCountList();

    if (response.ok) {
      setPatientCountInfo(response.data);
      updateCaregiverFilterOptions({
        tempPatientCountInfo: response.data,
        tempPatientStatus: tempPatientStatus,
      });
      setIsError(false);
      setIsRetry(false);
      setStatusCode(response.status);
    } else {
      setIsLoading(false);
      setIsError(true);
      setStatusCode(response.status);
      setIsRetry(true);
    }
  };

  // Set screen to loading wheel when retrieving patient list from backend
  const refreshPatientData = (tempPatientStatus = patientStatus) => {
    setIsLoading(true);
    const run = async () => {
      await getListOfPatients(tempPatientStatus);
      if (viewMode === 'allPatients') {
        await getPatientCountInfo(tempPatientStatus);
      }
      setIsLoading(false);
      setIsDataInitialized(true);
      // ⚠️ do NOT setIsLoading(true) again here – that caused the spinner to persist
    };
    run();
  };

  // Update filter options for Caregiver filter based on patient count data from backend
  const updateCaregiverFilterOptions = ({
    tempPatientCountInfo = patientCountInfo,
    tempPatientStatus = patientStatus,
  }) => {
    let caregiverPatientCount = {};
    for (var caregiverID of Object.keys(tempPatientCountInfo)) {
      const caregiverName = tempPatientCountInfo[caregiverID]['fullName'];
      const patientCount =
        tempPatientStatus == 'active'
          ? tempPatientCountInfo[caregiverID]['activePatients']
          : tempPatientStatus == 'inactive'
          ? tempPatientCountInfo[caregiverID]['inactivePatients']
          : tempPatientCountInfo[caregiverID]['activePatients'] +
            tempPatientCountInfo[caregiverID]['inactivePatients'];

      caregiverPatientCount[`${caregiverName} (${patientCount})`] =
        caregiverName;
    }

    setFilterOptionDetails((prevState) => ({
      ...prevState,
      Caregiver: {
        ...prevState.Caregiver,
        options: caregiverPatientCount,
      },
    }));

    setJustUpdated(true);
  };

  // Handle searching, sorting, and filtering of patient data based on patient status
  const handleSearchSortFilter = async ({
    text,
    tempSelSort,
    tempSelDropdownFilters,
    tempSelChipFilters,
    tempSelDatetimeFilters,
    tempSearchMode,
    setFilteredList,
  }) => {
    setIsLoading(true);
    setApplySortFilter(true);

    let tempPatientStatus =
      PATIENT_STATUSES[
        !isEmptyObject(tempSelChipFilters)
          ? tempSelChipFilters['Patient Status']['label']
          : 'Active'
      ];

    if (tempPatientStatus != patientStatus) {
      refreshPatientData(tempPatientStatus);
      setPatientStatus(tempPatientStatus);
      setTempSelPatientStatus(tempPatientStatus);
    } else {
      setFilteredList({
        text: text,
        tempSelSort: tempSelSort,
        tempSelDropdownFilters: tempSelDropdownFilters,
        tempSelChipFilters: tempSelChipFilters,
        tempSelDatetimeFilters: tempSelDatetimeFilters,
        tempSearchMode: tempSearchMode,
      });

      setIsLoading(false);
    }
  };

  // On click button to add patient
  const handleOnClickAddPatient = () => {
    navigation.navigate(routes.PATIENT_ADD_PATIENT);
    setIsReloadPatientList(true);
  };

  // Navigate to patient profile when patient item is clicked
  const handleOnClickPatientItem = (patientID) => {
    navigation.push(routes.PATIENT_PROFILE, { id: patientID });
  };

  // ⭐ toggle favourite for a patient
  const toggleFavourite = async (patient) => {
    const id = String(patient.patientID ?? fav.getPatientId(patient));
    const updated = await fav.toggle(id);
    setFavoriteIds(new Set(updated));
  };

  // Whether to show start date for each patient - depends on whether sort/filter using start date applied
  const showStartDate = () => {
    return (
      (!isEmptyObject(sort['sel'])
        ? sort['sel']['option']['label'] == 'Start Date'
        : false) ||
      ('Start Date' in datetime['sel']
        ? (datetime['sel']['Start Date']['min'] &&
            datetime['sel']['Start Date']['min'] != null) ||
          (datetime['sel']['Start Date']['max'] &&
            datetime['sel']['Start Date']['max'] != null)
        : false)
    );
  };

  // ⭐ derived list: favourites first, then keep existing order from SearchFilterBar
  const listWithFavPinned = React.useMemo(() => {
    const arr = [...(listOfPatients || [])];
    arr.sort((a, b) => {
      const fa = favoriteIds.has(String(a.patientID ?? fav.getPatientId(a))) ? 0 : 1;
      const fb = favoriteIds.has(String(b.patientID ?? fav.getPatientId(b))) ? 0 : 1;
      if (fa !== fb) return fa - fb; // ⭐ first
      return 0; // preserve current order
    });
    return arr;
  }, [listOfPatients, favoriteIds]);

  const visiblePatients = React.useMemo(() => {
    if (!showFavOnly) return listWithFavPinned;
    return listWithFavPinned.filter(p =>
      favoriteIds.has(String(p.patientID ?? fav.getPatientId(p)))
    );
  }, [listWithFavPinned, showFavOnly, favoriteIds]);

  return (
    <>
      {isLoading ? (
        <ActivityIndicator testID="patients_loading" visible />
      ) : (
        <View testID="patients" backgroundColor={colors.white}>
          <SearchFilterBar
            testID="patients_searchFilter"
            originalList={originalListOfPatients}
            setList={setListOfPatients}
            setIsLoading={setIsLoading}
            initializeData={isDataInitialized}
            onInitialize={() => setIsDataInitialized(false)}
            applySortFilter={applySortFilter}
            setApplySortFilter={setApplySortFilter}
            itemCount={listOfPatients ? listOfPatients.length : null}
            handleSearchSortFilterCustom={handleSearchSortFilter}
            VIEW_MODES={VIEW_MODES}
            viewMode={viewMode}
            setViewMode={setViewMode}
            FIELD_MAPPING={FIELD_MAPPING}
            sort={sort}
            setSort={setSort}
            dropdown={dropdown}
            setDropdown={setDropdown}
            chip={chip}
            setChip={setChip}
            datetime={datetime}
            setDatetime={setDatetime}
            SORT_OPTIONS={SORT_OPTIONS}
            FILTER_OPTIONS={FILTER_OPTIONS}
            filterOptionDetails={filterOptionDetails}
            SEARCH_OPTIONS={SEARCH_OPTIONS}
            searchOption={searchOption}
            setSearchOption={setSearchOption}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          {/* ⭐ Optional: show favourites-only toggle */}
          <Button
            onPress={() => setShowFavOnly(v => !v)}
            variant={showFavOnly ? 'solid' : 'outline'}
            leftIcon={<Icon as={MaterialIcons} name="star" />}
            mx="5"
            mt="2"
            mb="1"
          >
            {showFavOnly ? 'Showing favourites' : '⭐ Favourites only'}
          </Button>

          <View style={{ height: '85%' }}>
            <FlatList
              testID="patients_flatlist"
              ref={patientListRef}
              marginBottom={'20'}
              onRefresh={refreshPatientData}
              refreshing={isLoading}
              ListEmptyComponent={() =>
                noDataMessage(
                  statusCode,
                  isLoading,
                  isError,
                  'No patients found',
                  true,
                )
              }
              data={visiblePatients}
              keyExtractor={(item) => String(item.patientID ?? fav.getPatientId(item))}
              style={styles.patientListContainer}
              renderItem={({ item, index }) => {
                return (
                  <TouchableOpacity
                    testID={`patientprofile_${item.patientID}`}
                    style={styles.patientRowContainer}
                    key={index}
                    onPress={() => handleOnClickPatientItem(item.patientID)}
                  >
                    <ProfileNameButton
                      profileLineOne={item.preferredName}
                      profileLineTwo={`${item.firstName} ${item.lastName}`}
                      profilePicture={item.profilePicture}
                      handleOnPress={() =>
                        handleOnClickPatientItem(item.patientID)
                      }
                      isPatient={true}
                      size={Dimensions.get('window').width / 10}
                      key={index}
                      isVertical={false}
                      isActive={patientStatus == '' ? item.isActive : null}
                      startDate={showStartDate() ? item.startDate : null}
                    />
                    <View style={styles.caregiverNameContainer}>
                      <Text style={styles.caregiverName}>
                        {viewMode === 'allPatients'
                          ? item.caregiverName !== null
                            ? item.caregiverName
                            : 'No Caregiver'
                          : null}
                      </Text>
                    </View>
                    {/* ⭐ star toggle */}
                    <IconButton
                      onPress={() => toggleFavourite(item)}
                      icon={
                        <Icon
                          as={MaterialIcons}
                          name={
                            favoriteIds.has(String(item.patientID ?? fav.getPatientId(item)))
                              ? 'star'
                              : 'star-border'
                          }
                          size="sm"
                          color={
                            favoriteIds.has(String(item.patientID ?? fav.getPatientId(item)))
                              ? 'amber.500'
                              : 'coolGray.500'
                          }
                        />
                      }
                      accessibilityLabel="Toggle favourite"
                      alignSelf="center"
                    />
                  </TouchableOpacity>
                );
              }}
            />
            <Center position="absolute" right="5" bottom="15%">
              <Fab
                testID="addPatients"
                backgroundColor={colors.pink}
                icon={
                  <Icon
                    as={MaterialIcons}
                    color={colors.white}
                    name="person-add-alt"
                    size="lg"
                    placement="bottom-right"
                  />
                }
                onPress={handleOnClickAddPatient}
                renderInPortal={false}
                shadow={2}
                size="sm"
              />
              <BackToTopButton
                flatListRef={patientListRef}
                position="bottom-right"
                offset={17.5}
              />
            </Center>
          </View>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  patientListContainer: {
    paddingHorizontal: '5%',
    zIndex: -1,
  },
  patientRowContainer: {
    marginVertical: '3%',
    width: '100%',
    flex: 2,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
  },
  caregiverNameContainer: {
    marginLeft: '5%',
    justifyContent: 'center',
    alignItem: 'center',
  },
  caregiverName: {
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default PatientsScreen;
