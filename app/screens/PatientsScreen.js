import React, { useState, useEffect, useRef, useCallback, useMemo, memo, useContext } from 'react';
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
import userApi from 'app/api/user';
import AuthContext from 'app/auth/context';

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

 // NEW (TEMP): disable legacy Core counts during Patient Service migration
const ENABLE_OLD_COUNTS = false;

// Memoized PatientRow component for performance
const PatientRow = memo(({ 
  item, 
  onPressPatient, 
  onToggleFavourite, 
  isFavourite, 
  viewMode, 
  patientStatus, 
  showStartDate,
  screenWidth 
}) => {
  const patientID = item.patientID;
  
  const handlePress = useCallback(() => {
    onPressPatient(patientID);
  }, [patientID, onPressPatient]);

  const handleToggleFav = useCallback(() => {
    onToggleFavourite(item);
  }, [patientID, onToggleFavourite]);

  return (
    <TouchableOpacity
      testID={`patientprofile_${item.patientID}`}
      style={rowStyles.patientRowContainer}
      onPress={handlePress}
    >
      <ProfileNameButton
        profileLineOne={`${item.firstName} ${item.lastName}`}
        profileLineTwo={item.preferredName}
        profilePicture={item.profilePicture}
        handleOnPress={handlePress}
        isPatient={true}
        size={screenWidth / 10}
        isVertical={false}
        isActive={patientStatus === '' ? item.isActive : null}
        startDate={showStartDate ? item.startDate : null}
      />
      <View style={rowStyles.caregiverNameContainer}>
        <Text style={rowStyles.caregiverName}>
          {viewMode === 'allPatients'
            ? item.caregiverName !== null
              ? item.caregiverName
              : 'No Caregiver'
            : null}
        </Text>
      </View>
      <IconButton
        onPress={handleToggleFav}
        icon={
          <Icon
            as={MaterialIcons}
            name={isFavourite ? 'star' : 'star-border'}
            size="md"
            color={isFavourite ? 'amber.500' : 'coolGray.500'}
          />
        }
        accessibilityLabel="Toggle favourite"
        alignSelf="center"
      />
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if these specific props change
  return (
    prevProps.item.patientID === nextProps.item.patientID &&
    prevProps.isFavourite === nextProps.isFavourite &&
    prevProps.viewMode === nextProps.viewMode &&
    prevProps.patientStatus === nextProps.patientStatus &&
    prevProps.showStartDate === nextProps.showStartDate &&
    prevProps.screenWidth === nextProps.screenWidth &&
    prevProps.item.firstName === nextProps.item.firstName &&
    prevProps.item.lastName === nextProps.item.lastName &&
    prevProps.item.preferredName === nextProps.item.preferredName &&
    prevProps.item.caregiverName === nextProps.item.caregiverName &&
    prevProps.item.profilePicture === nextProps.item.profilePicture &&
    prevProps.item.startDate === nextProps.item.startDate
  );
});

// Styles for PatientRow (defined outside component to prevent recreation)
const rowStyles = StyleSheet.create({
  patientRowContainer: {
    marginVertical: '3%',
    width: '100%',
    flex: 2,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    paddingRight: 100,
  },
  caregiverNameContainer: {
    marginLeft: '5%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  caregiverName: {
    fontSize: 15,
    fontWeight: 'bold',
  },
});

function PatientsScreen({ navigation }) {
  // View modes user can switch between (displayed as tab on top)
  const VIEW_MODES = {
    'My Patients': 'myPatients',
    'All Patients': 'allPatients',
  };

  // NEW: more robust active/inactive derivation
const normalizePatientV1 = (p = {}) => {
  const id =
    p.patient_id ?? p.id ?? p.patientID ?? p.PatientId ?? p.PatientID ?? null;

  const hasFirst = typeof p.first_name === 'string' || typeof p.firstName === 'string';
  const hasLast  = typeof p.last_name  === 'string' || typeof p.lastName  === 'string';
  const nameStr  = typeof p.name === 'string' ? p.name.trim() : '';

  const firstName = String(
    p.first_name ?? p.firstName ?? (hasFirst ? '' : (nameStr.split(' ')[0] ?? ''))
  ).trim();

  const lastName = String(
    p.last_name ?? p.lastName ?? (hasLast ? '' : (nameStr.split(' ').slice(1).join(' ') ?? ''))
  ).trim();

  // NEW: derive isActive from multiple common shapes
  const statusStr = typeof p.status === 'string' ? p.status.trim().toLowerCase() : null;
  const statusAny = p.status ?? p.active ?? p.is_active ?? p.isActive ?? null;

  const derivedIsActive =
    typeof p.is_active === 'boolean' ? p.is_active :
    typeof p.isActive === 'boolean' ? p.isActive :
    (typeof statusAny === 'number' ? statusAny === 1 :
     typeof statusAny === 'string'
       ? ['1','true','active','yes'].includes(statusAny.trim().toLowerCase())
       : (statusStr ? statusStr.startsWith('act') : undefined));

  return {
    ...p,
    patientID: id,
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`.trim(),
    profilePicture:
      p.profilePicture ?? p.profile_picture ?? p.profile_photo ?? p.photoUrl ?? p.avatar ?? null,
    preferredName: p.preferred_name ?? p.preferredName ?? '',
    caregiverName: p.caregiver_name ?? p.caregiverName ?? null,
    startDate: p.start_date ?? p.startDate ?? null,
    isActive: derivedIsActive, // NEW
  };
};

  // Get current user from AuthContext
  const { user } = useContext(AuthContext);

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
  const [patientStatus, setPatientStatus] = useState('active'); // active, inactive, '' (default: All)
  const [tempSelPatientStatus, setTempSelPatientStatus] = useState('active'); // active, inactive, '' (default: All)
  const [viewMode, setViewMode] = useState('myPatients'); // myPatients, allPatients
  const [isReloadPatientList, setIsReloadPatientList] = useState(false);
  const [applySortFilter, setApplySortFilter] = useState(true);

  //  favourites state
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [showFavOnly, setShowFavOnly] = useState(false);

  // Pagination states for infinite scroll
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [displayCount, setDisplayCount] = useState(10); // Client-side pagination: how many to show
  const ITEMS_PER_PAGE = 10;

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
      options: { All: undefined, Active: true, Inactive: false }, // define custom options and map to corresponding values in patient data
      isFilter: true,
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

  // Ensure the chip indicator shows 'Active' by default on first render and on login
  useEffect(() => {
    try {
      setChip((prev) => ({
        ...prev,
        sel: { ...(prev.sel || {}), ['Patient Status']: { label: 'Active', value: 2 } },
        tempSel: { ...(prev.tempSel || {}), ['Patient Status']: { label: 'Active', value: 2 } },
      }));
    } catch (e) {}
  }, [user?.id]);

  // --- list patients from the new Patient Service (V1)
  const getListOfPatients = async (status = 'active', pageNo = 0, append = false) => {
    const pageSize = 1000; // Load all patients for client-side sorting/pagination

    const userId = user?.id || user?.userID || user?.userId;
    const userRole = user?.roleName || user?.role;

    // Fetch all patients first
    const res = await patientApi.listPatientsV1({ pageNo, pageSize });

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

    const normalizedPage = pageArray.map(normalizePatientV1);

    // --- Fetch allocation data + staff names to enrich patients ---
    let allocFiltered = normalizedPage;
    try {
      // Fetch allocations and staff names in parallel
      const [allocationMap, staffNameMap] = await Promise.all([
        patientApi.getAllocationMap(),
        userApi.buildStaffNameMap(),
      ]);

      // Collect caregiver/doctor/supervisor IDs that are missing from staffNameMap
      const missingIds = new Set();
      for (const alloc of Object.values(allocationMap)) {
        for (const field of ['caregiverId', 'doctorId', 'supervisorId', 'gameTherapistId']) {
          if (alloc[field] && !staffNameMap[alloc[field]]) missingIds.add(alloc[field]);
        }
      }

      // Resolve missing names individually (fallback)
      await Promise.all([...missingIds].map(async (uid) => {
        try {
          const r = await userApi.getUsernameById(uid);
          if (r.ok && r.data) {
            staffNameMap[uid] = r.data.preferredName || r.data.nric_FullName || uid;
          }
        } catch {}
      }));

      // Enrich each patient with caregiver/doctor/supervisor names from allocation + staff data
      allocFiltered = normalizedPage.map(p => {
        const alloc = allocationMap[String(p.patientID)];
        if (alloc) {
          const caregiverName = p.caregiverName || staffNameMap[alloc.caregiverId] || null;
          const doctorName = p.doctorName || staffNameMap[alloc.doctorId] || null;
          const supervisorName = p.supervisorName || staffNameMap[alloc.supervisorId] || null;
          
          return {
            ...p,
            caregiverName,
            doctorName,
            supervisorName,
          };
        }
        return p;
      });

      // "My Patients" mode: filter to only allocated patients
      if (viewMode === 'myPatients' && userId) {
        const myPatientIds = await patientApi.getMyAllocatedPatientIds(userId, userRole);
        if (myPatientIds.length > 0) {
          const idSet = new Set(myPatientIds.map(String));
          allocFiltered = allocFiltered.filter((p) => idSet.has(String(p.patientID)));
        } else {
          allocFiltered = [];
        }
      }
    } catch (err) {
      // Fallback: continue with normalizedPage without enrichment
    }

    // Check if there are more pages
    const totalPages = body.totalPages ?? body.total_pages ?? null;
    const totalRecords = body.totalRecords ?? body.total_records ?? body.total ?? null;
    // We load all data upfront, so no more backend pages needed
    setHasMorePages(false);
    setCurrentPage(pageNo);
    // Reset display count for new data load
    if (!append) {
      setDisplayCount(ITEMS_PER_PAGE);
    }

    // --- apply patient status filter LOCALLY (no API change needed)
    const want = status === 'active' ? true : status === 'inactive' ? false : undefined;
    // Treat missing isActive as "active" during migration so nothing disappears
    const filtered =
      want === undefined ? allocFiltered : allocFiltered.filter(p => (p.isActive ?? true) === want);

    if (append) {
      // Append to existing list for infinite scroll
      setOriginalListOfPatients(prev => [...prev, ...filtered]);
      setListOfPatients(prev => [...prev, ...filtered]);
    } else {
      // Replace list (initial load or refresh)
      setOriginalListOfPatients([...filtered]);
      setListOfPatients([...filtered]);
      
      // Update caregiver filter options after patient list is loaded
      if (viewMode === 'allPatients') {
        updateCaregiverFilterOptions({
          patientList: filtered,
          tempPatientStatus: status,
        });
      }
    }

    setIsError(false);
    setStatusCode(200);
    return { status: 200, ok: true };
  };

  // Load more patients when user scrolls to bottom (client-side pagination)
  const loadMorePatients = useCallback(() => {
    // Show 10 more items from the already-loaded list
    setDisplayCount(prev => prev + ITEMS_PER_PAGE);
  }, []);

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
      setPatientCountInfo({});
      updateCaregiverFilterOptions({
      tempPatientCountInfo: {},
      tempPatientStatus: tempPatientStatus,
    });
      setIsError(false); // don't block the list UI
      setStatusCode(response.status);
      return { status: response.status, ok: false };
    }
  };

  // Set screen to loading wheel when retrieving patient list from backend
  const refreshPatientData = (tempPatientStatus = patientStatus) => {
    setIsLoading(true);
    setCurrentPage(0);
    setHasMorePages(true);
    const run = async () => {
      await getListOfPatients(tempPatientStatus, 0, false);
      // NEW (TEMP)
      if (ENABLE_OLD_COUNTS && viewMode === 'allPatients') {
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
    patientList = null,
  }) => {
    const patientsToCount = patientList || originalListOfPatients;
    
    let caregiverPatientCount = {};
    
    // If we have backend data, use it
    for (var caregiverID of Object.keys(tempPatientCountInfo)) {
      const caregiverName = tempPatientCountInfo[caregiverID]['fullName'];
      caregiverPatientCount[caregiverName] = caregiverName;
    }
    
    // If no backend data, build from patient list directly
    if (Object.keys(tempPatientCountInfo).length === 0 && patientsToCount.length > 0) {
      const caregiverSet = new Set();
      
      patientsToCount.forEach(p => {
        const matchesStatus = tempPatientStatus === '' || 
                             (tempPatientStatus === 'active' && p.isActive === '1') ||
                             (tempPatientStatus === 'inactive' && p.isActive === '0');
        
        if (matchesStatus && p.caregiverName) {
          caregiverSet.add(p.caregiverName);
        }
      });
      
      caregiverSet.forEach(name => {
        caregiverPatientCount[name] = name;
      });
    }

    // Count patients with no caregiver from actual patient data
    const noCaregiverCount = patientsToCount.filter(p => {
      const matchesStatus = tempPatientStatus === '' || 
                           (tempPatientStatus === 'active' && p.isActive === '1') ||
                           (tempPatientStatus === 'inactive' && p.isActive === '0');
      return matchesStatus && !p.caregiverName;
    }).length;

    // Add "No Caregiver" option if there are patients without a caregiver
    if (noCaregiverCount > 0) {
      caregiverPatientCount['No Caregiver'] = '__NO_CAREGIVER__';
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

      // Reset display count when sorting/filtering changes
      setDisplayCount(ITEMS_PER_PAGE);
      setIsLoading(false);
    }
  };

  // On click button to add patient
  const handleOnClickAddPatient = () => {
    navigation.navigate(routes.PATIENT_ADD_PATIENT);
    setIsReloadPatientList(true);
  };

  // Cache screen width
  const screenWidth = useMemo(() => Dimensions.get('window').width, []);

  // Navigate to patient profile when patient item is clicked
  const handleOnClickPatientItem = useCallback((patientID) => {
    navigation.push(routes.PATIENT_PROFILE, { id: patientID });
  }, [navigation]);

  // Toggle a patient's favourite status
  const toggleFavourite = useCallback(async (patient) => {
    const id = String(patient.patientID ?? fav.getPatientId(patient));
    const updated = await fav.toggle(id);
    setFavoriteIds(new Set(updated));
  }, []);

  // Whether to show start date for each patient - depends on whether sort/filter using start date applied
  const showStartDate = useMemo(() => {
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
  }, [sort, datetime]);

  //  derived list: favourites first, then keep existing order from SearchFilterBar
  const listWithFavPinned = React.useMemo(() => {
    if (!listOfPatients || listOfPatients.length === 0) return [];
    if (favoriteIds.size === 0) return listOfPatients; // No sorting needed
    
    // Partition into favorites and non-favorites for performance
    const favorites = [];
    const nonFavorites = [];
    
    for (const patient of listOfPatients) {
      const id = String(patient.patientID ?? fav.getPatientId(patient));
      if (favoriteIds.has(id)) {
        favorites.push(patient);
      } else {
        nonFavorites.push(patient);
      }
    }
    
    return [...favorites, ...nonFavorites];
  }, [listOfPatients, favoriteIds]);

  const visiblePatients = React.useMemo(() => {
    if (!showFavOnly) return listWithFavPinned;
    return listWithFavPinned.filter(p =>
      favoriteIds.has(String(p.patientID ?? fav.getPatientId(p)))
    );
  }, [listWithFavPinned, showFavOnly, favoriteIds]);

  // Client-side pagination: only show up to displayCount items
  const displayedPatients = React.useMemo(() => {
    return visiblePatients.slice(0, displayCount);
  }, [visiblePatients, displayCount]);

  // Check if there are more items to show
  const hasMoreToShow = displayCount < visiblePatients.length;

  // Memoized renderItem for FlatList - favoriteIds intentionally excluded from deps
  // We'll use extraData prop on FlatList to trigger re-renders when favorites change
  const renderPatientItem = useCallback(({ item }) => {
    const patientId = String(item.patientID ?? fav.getPatientId(item));
    return (
      <PatientRow
        item={item}
        onPressPatient={handleOnClickPatientItem}
        onToggleFavourite={toggleFavourite}
        isFavourite={favoriteIds.has(patientId)}
        viewMode={viewMode}
        patientStatus={patientStatus}
        showStartDate={showStartDate}
        screenWidth={screenWidth}
      />
    );
  }, [handleOnClickPatientItem, toggleFavourite, favoriteIds, viewMode, patientStatus, showStartDate, screenWidth]);

  // Fixed item layout for better scroll performance
  const getItemLayout = useCallback(
    (data, index) => ({
      length: 70,
      offset: 70 * index,
      index,
    }),
    []
  );

  return (
    <>
      {isLoading ? (
        <ActivityIndicator testID="patients_loading" visible />
      ) : (
        <View testID="patients" style={styles.container}>
          <SearchFilterBar
            testID="patients_searchFilter"
            originalList={originalListOfPatients}
            setList={setListOfPatients}
            setIsLoading={setIsLoading}
            initializeData={isDataInitialized}
            onInitialize={() => setIsDataInitialized(false)}
            applySortFilter={applySortFilter}
            setApplySortFilter={setApplySortFilter}
            itemCount={displayedPatients ? displayedPatients.length : null}
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

          {/* show favourites-only toggle */}
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

          <View style={styles.listWrapper}>
            <FlatList
              testID="patients_flatlist"
              ref={patientListRef}
              contentContainerStyle={styles.flatListContent}
              onRefresh={refreshPatientData}
              refreshing={isLoading}
              onEndReached={loadMorePatients}
              onEndReachedThreshold={0.5}
              ListEmptyComponent={() =>
                noDataMessage(
                  statusCode,
                  isLoading,
                  isError,
                  'No patients found',
                  true,
                )
              }
              ListFooterComponent={() =>
                hasMoreToShow ? (
                  <View style={styles.loadingMoreContainer}>
                    <ActivityIndicator visible size="small" />
                  </View>
                ) : null
              }
              data={displayedPatients}
              keyExtractor={(item) => String(item.patientID ?? fav.getPatientId(item))}
              style={styles.patientListContainer}
              renderItem={renderPatientItem}
              getItemLayout={getItemLayout}
              extraData={favoriteIds}
              removeClippedSubviews={true}
              maxToRenderPerBatch={5}
              updateCellsBatchingPeriod={100}
              windowSize={21}
              initialNumToRender={10}
            />
          </View>
          <Center position="absolute" right="5" bottom="8%">
            <BackToTopButton
              flatListRef={patientListRef}
              position="bottom-right"
              offset={17.5}
            />
            <Fab
              testID="addPatients"
              backgroundColor={colors.pink}
              icon={
                <Icon
                  as={MaterialIcons}
                  color={colors.white}
                  name="person-add-alt"
                  size="lg"
                />
              }
              onPress={handleOnClickAddPatient}
              renderInPortal={false}
              shadow={2}
              size="sm"
            />
          </Center>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  listWrapper: {
    flex: 1,
  },
  patientListContainer: {
    paddingHorizontal: '5%',
  },
  flatListContent: {
    paddingBottom: 100, // Extra padding at bottom for FAB clearance
  },
  fabContainer: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    alignItems: 'center',
  },
  loadingMoreContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

export default PatientsScreen;
