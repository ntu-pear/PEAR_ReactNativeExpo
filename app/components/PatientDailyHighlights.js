// Base
import React, { useState, useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  Pressable,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { FlatList, Icon } from 'native-base';

// APIs
import highlightApi from 'app/api/highlight';
import patientApi from 'app/api/patient';

// Configs
import colors from 'app/config/colors';
import { Platform } from 'react-native';

// Components
import MessageDisplayCard from 'app/components/MessageDisplayCard';
import SelectionInputField from 'app/components/input-components/SelectionInputField';
import HighlightsCard from 'app/components/HighlightsCard';
import SearchBar from './input-components/SearchBar';

function PatientDailyHighlights() {
  // State controlling whether modal is visible or not
  const [modalVisible, setModalVisible] = useState(true); //set as true if want to display highlight page on start

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [statusCode, setStatusCode] = useState();

  // highlightsData is all data pulled from backend, filteredData is data displayed
  const [highlightsData, setHighlightsData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isRetry, setIsRetry] = useState(false);

  // searchValue for SearchBar, filterValue for DropDownPicker
  const [searchValue, setSearchValue] = useState('');
  const [filterValue, setFilterValue] = useState('All');

  // new API v1 type values 
  const [dropdownItems, setDropdownItems] = useState([
    { label: 'All', value: 'All' },
    { label: 'New Prescription', value: 'Prescription' }, // Match API value
    { label: 'New Allergy', value: 'Allergy' },
    { label: 'New Activity Exclusion', value: 'ActivityExclusion' },
    { label: 'Abnormal Vital', value: ['Vital', 'AbnormalVital'] },
    { label: 'Problem', value: 'Problem' },
    { label: 'New Medical Records', value: 'MedicalHistory' },
  ]);




  const navigation = useNavigation();

  // useFocusEffect runs when user navigates to PatientDailyHighlights from another page
  // referencing: https://reactnavigation.org/docs/use-focus-effect/
  useFocusEffect(
    React.useCallback(() => {
      // Fetch data from highlights api
      getAllHighlights();
      // Reset searchValue and filterValue when user navigates away
      setSearchValue('');
      setFilterValue([]);
    }, []),
  );

  useEffect(() => {
    if (isRetry) {
      getAllHighlights();
      setSearchValue('');
      setFilterValue([]);
    }
  }, [isRetry]);

  // Using the new API v1 
  const getAllHighlights = async () => {
  setIsLoading(true);
  setIsError(false);

  try {
    // Call the new API endpoint that returns ALL patients' highlights
    const response = await highlightApi.getAllHighlights();

    // ADD THIS: Log raw highlights response
    console.log('[HIGHLIGHTS API] Raw response:', JSON.stringify(response, null, 2));
    console.log('[HIGHLIGHTS API] Response status:', response.status);
    console.log('[HIGHLIGHTS API] Response ok:', response.ok);
    console.log('[HIGHLIGHTS API] Response data type:', typeof response.data);
    console.log('[HIGHLIGHTS API] Is Array?:', Array.isArray(response.data));

    if (!response.ok) {
      setIsLoading(false);
      setIsError(true);
      setIsRetry(true);
      setStatusCode(response.status);
      return;
    }

    // Response is an array of highlights
    const allHighlights = Array.isArray(response.data) ? response.data : [];
    
    // Filter out deleted highlights
    const activeHighlights = allHighlights.filter(h => h.IsDeleted !== "1");
    
    console.log('[HIGHLIGHTS] Active highlights after filtering:', activeHighlights.length, 'of', allHighlights.length);

    // Get unique patient IDs from highlights
    const uniquePatientIds = [...new Set(activeHighlights.map(h => h.PatientId))];

    // ADD THIS: Log patient IDs being fetched
    console.log('[HIGHLIGHTS] Unique patient IDs:', uniquePatientIds);
    console.log('[HIGHLIGHTS] Fetching details for', uniquePatientIds.length, 'patients');

    
    // Fetch patient details for all patients with highlights
    const patientDetailsPromises = uniquePatientIds.map(id => 
      patientApi.readPatientV1(id)
    );
    const patientDetailsResponses = await Promise.all(patientDetailsPromises);

    // ✅ ADD THIS: Log each patient response
    patientDetailsResponses.forEach((res, index) => {
      const patientId = uniquePatientIds[index];
      console.log(`[PATIENT ${patientId}] Status: ${res.status}, OK: ${res.ok}`);
      console.log(`[PATIENT ${patientId}] Raw data:`, JSON.stringify(res.data, null, 2));
      
      // Log the nested structure
      if (res.ok && res.data) {
        console.log(`[PATIENT ${patientId}] res.data.data exists?`, !!res.data.data);
        console.log(`[PATIENT ${patientId}] Actual patient object:`, JSON.stringify(res.data.data || res.data, null, 2));
      }
    });
    
    // Helper function to pick first non-empty value from object
    const pickFirstFrom = (obj, ...paths) => {
      for (const path of paths) {
        const val = obj?.[path];
        if (val) return String(val).trim();
      }
      return '';
    };
    
    // Create a map of patient ID to patient details
    const patientDetailsMap = {};
    patientDetailsResponses.forEach((res, index) => {
      if (res.ok && res.data) {
        const patientId = uniquePatientIds[index];
        
        // Handle nested data structure - try both res.data.data and res.data
        const p = res.data.data || res.data;
        
        // Extract name fields using multiple possible field names
        const firstName = pickFirstFrom(p, 'firstname', 'firstName', 'givenname', 'givenName');
        const lastName = pickFirstFrom(p, 'lastname', 'lastName', 'familyname', 'familyName', 'surname');
        const preferred = pickFirstFrom(p, 'preferredName', 'preferredname', 'nickname');
        const fullName = pickFirstFrom(p, 'name', 'fullname', 'fullName', 'displayname', 'displayName');
        
        // Compute display name (preferred > full > first+last)
        let displayName = '';
        if (preferred) {
          displayName = preferred;
        } else if (fullName) {
          displayName = fullName;
        } else if (firstName && lastName) {
          displayName = `${firstName} ${lastName}`.trim();
        } else if (firstName) {
          displayName = firstName;
        } else if (lastName) {
          displayName = lastName;
        }
        
        patientDetailsMap[patientId] = {
          firstName: firstName,
          lastName: lastName,
          displayName: displayName,
          photo: p.profilePicture || p.profilepicture || p.photo || null,
        };
      }
    });

    // Group by patient and transform to match your UI structure
    const groupedByPatient = activeHighlights.reduce((acc, h) => {
      const patientId = h.PatientId;
      if (!acc[patientId]) {
        const patientDetails = patientDetailsMap[patientId] || {};
        // Use display name, fallback to "Patient X" if not found
        const patientName = patientDetails.displayName || `Patient ${patientId}`;
        
        acc[patientId] = {
          patientInfo: {
            patientId: patientId,
            patientName: patientName,
            patientPhoto: patientDetails.photo || null,
          },
          highlights: []
        };
      }
      
      // Transform highlight to match your UI format
      acc[patientId].highlights.push({
        highlightID: h.Id,
        highlightType: h.Type,
        highlightJson: h.HighlightJSON,
        startDate: h.StartDate,
        endDate: h.EndDate,
      });
      
      return acc;
    }, {});

    // Convert to array
    const transformedData = Object.values(groupedByPatient);

    // Apply your existing aggregation logic
    const aggregatedData = aggregateHighlightsByType(transformedData);
    
    console.log('[HIGHLIGHTS] Final aggregated data:', aggregatedData.length, 'patients with highlights');
    
    setHighlightsData(aggregatedData);
    setFilteredData(aggregatedData);
    setIsLoading(false);
    setStatusCode(response.status);
    setIsError(false);
    setIsRetry(false);
  } catch (error) {
    console.error('[HIGHLIGHTS] Error fetching highlights:', error);
    setIsLoading(false);
    setIsError(true);
    setStatusCode(500);
  }
};



  // Filter data when either searchValue or filterValue changes
  useEffect(() => {

    // Search by searchValue
    const dataAfterSearch = highlightsData.filter((item) =>
      item.patientInfo.patientName
        .toLowerCase()
        .includes(searchValue.toLowerCase()),
    );

    // Filter by filterValue (highlight types)
    let dataAfterFilter = highlightsData;
    
    // Handle filter: skip if 'All' or empty
    if (filterValue && filterValue !== 'All' && filterValue.length > 0) {
    // Flatten the filterValue in case it contains arrays (like ['Vital', 'AbnormalVital'])
      const filterArray = Array.isArray(filterValue) 
        ? filterValue.flat() // flatten nested arrays
        : [filterValue];
      
      dataAfterFilter = highlightsData.filter((item) =>
        item.highlights.some((h) => filterArray.includes(h.highlightType)),
      );
    }

    // Find intersection of dataAfterSearch and dataAfterFilter
    const data = dataAfterSearch.filter((value) =>
      dataAfterFilter.includes(value),
    );

    setFilteredData(data);
  }, [highlightsData, searchValue, filterValue]);


  const handlePullToRefresh = async () => {
    await getAllHighlights();
    return;
  };

  const aggregateHighlightsByType = (highlights) => {
    const aggregatedHighlights = [];

    highlights.forEach((highlight) => {
      const { highlights } = highlight; // Assuming this is an array of highlight objects
      const aggregated = {};

      highlights.forEach((h) => {
        if (!aggregated[h.highlightType]) {
          aggregated[h.highlightType] = { ...h, count: 1 }; // Copy the highlight and add a count
        } else {
          aggregated[h.highlightType].count += 1; // Increment the count
        }
      });

      aggregatedHighlights.push({
        ...highlight,
        highlights: Object.values(aggregated), // Replace with aggregated highlights
      });
    });

    return aggregatedHighlights;
  };

  const noDataMessage = () => {
    if (isLoading) {
      return <></>;
    }

    // Display error message if API request fails
    let message = '';
    if (isError) {
      if (statusCode === 401) {
        message = 'Error: User not Authenticated';
      } else if (statusCode >= 500) {
        message = 'Server is down. Please try again later.';
      } else {
        message = `${statusCode} error has occured`;
      }
    }
    // Display message when there are no new highlights
    return (
      <MessageDisplayCard
        accessibilityLabel="Text"
        TextMessage={isError ? message : 'Nothing to highlight today'}
        topPaddingSize={'32%'}
      />
    );
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setModalVisible(!modalVisible)}
        testID={'highlightsButton'}
        style={{ flexDirection: 'row' }}
      >
        <Icon
          as={<MaterialIcons name="announcement" />}
          size={10}
          color={colors.black}
        ></Icon>
        {highlightsData.length > 0 ? (
          <View style={styles.iconNumber}>
            <Text
              style={{ color: colors.white, fontSize: 11, fontWeight: '700' }}
            >
              {highlightsData.length}
            </Text>
          </View>
        ) : null}
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
        testID="highlightsModal"
      >
        <TouchableOpacity
          style={styles.centeredView}
          activeOpacity={1}
          onPressOut={() => {
            setModalVisible(!modalVisible);
          }}
        >
          <TouchableWithoutFeedback>
            <View style={styles.modalView}>
              <Text style={styles.modalHeaderText}>
                Patients Daily Highlights
              </Text>
              <Pressable
                style={styles.buttonClose}
                onPress={() => setModalVisible(!modalVisible)}
                testID="highlightsCloseButton"
              >
                <MaterialCommunityIcons
                  name="close"
                  size={Platform.OS === 'web' ? 42 : 20}
                />
              </Pressable>
              <View style={styles.searchBarDropDownView}>
                <View style={styles.flex}>
                  <SearchBar
                    value={searchValue}
                    onChangeText={setSearchValue}
                  />
                </View>
                <View style={styles.flex}>
                  <SelectionInputField
                    showTitle={false}
                    value={filterValue}
                    dataArray={dropdownItems}
                    onDataChange={setFilterValue}
                    placeholder={'Select Filter'}
                  />
                </View>
              </View>
              <FlatList
                w="100%"
                showsVerticalScrollIndicator={true}
                data={filteredData}
                keyExtractor={(item) => item.patientInfo.patientId}
                onRefresh={handlePullToRefresh}
                refreshing={isLoading}
                ListEmptyComponent={noDataMessage}
                renderItem={({ item }) => (
                  <HighlightsCard
                    item={item}
                    navigation={navigation}
                    setModalVisible={setModalVisible}
                  />
                )}
                testID="flatList"
              />
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalView: {
    margin: 20,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
    height: Platform.OS === 'web' ? '60%' : '70%',
    width: Platform.OS === 'web' ? '65%' : '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonClose: {
    padding: 10,
    alignSelf: 'flex-end',
    position: 'absolute',
  },
  modalHeaderText: {
    marginBottom: 15,
    marginTop: 10,
    textAlign: 'center',
    fontSize: Platform.OS === 'web' ? 18 : null,
    fontSize: 25,
  },
  modalText: {
    marginTop: Platform.OS === 'web' ? 24 : 15,
    marginLeft: 10,
    fontSize: Platform.OS === 'web' ? 18 : null,
    textAlign: Platform.OS === 'web' ? 'center' : null,
  },
  modalErrorText: {
    color: colors.red,
  },
  searchBarDropDownView: {
    flexDirection: 'row',
    width: '100%',
    zIndex: 1,
    justifyContent: 'space-between',
  },
  flex: {
    flex: 0.49,
  },
  iconNumber: {
    borderRadius: 27,
    height: 27,
    width: 27,
    backgroundColor: colors.red,
    borderColor: colors.white,
    borderWidth: 3,
    position: 'absolute',
    top: -11,
    right: -12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PatientDailyHighlights;
