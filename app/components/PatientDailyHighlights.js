// Base
import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  Pressable,
  View,
  TouchableOpacity,
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
    { label: 'New Prescription', value: 'Prescription' },
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
      setFilterValue('All');
    }, []),
  );

  useEffect(() => {
    if (isRetry) {
      getAllHighlights();
      setSearchValue('');
      setFilterValue('All');
    }
  }, [isRetry]);

  // Helper function to pick first non-empty value from object
  const pickFirstFrom = useCallback((obj, ...paths) => {
    for (const path of paths) {
      const val = obj?.[path];
      if (val) return String(val).trim();
    }
    return '';
  }, []);

  // Memoize aggregation function to prevent unnecessary recalculations
  const aggregateHighlightsByType = useCallback((highlights) => {
    return highlights.map((highlight) => {
      const aggregated = {};
      
      highlight.highlights.forEach((h) => {
        if (!aggregated[h.highlightType]) {
          aggregated[h.highlightType] = { ...h, count: 1 };
        } else {
          aggregated[h.highlightType].count += 1;
        }
      });

      return {
        ...highlight,
        highlights: Object.values(aggregated),
      };
    });
  }, []);

  // Using the new API v1 with optimizations
  const getAllHighlights = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);

    try {
      // Call the new API endpoint that returns ALL patients' highlights
      const response = await highlightApi.getAllHighlights();

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
      
      console.log('[HIGHLIGHTS] Active highlights:', activeHighlights.length);

      // Get unique patient IDs from highlights
      const uniquePatientIds = [...new Set(activeHighlights.map(h => h.PatientId))];

      // Use Promise.allSettled for better error handling
      const patientDetailsResponses = await Promise.allSettled(
        uniquePatientIds.map(id => patientApi.readPatientV1(id))
      );
      
      const patientDetailsMap = {};
      patientDetailsResponses.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.ok && result.value.data) {
          const patientId = uniquePatientIds[index];
          const p = result.value.data.data || result.value.data;
          
          const firstName = pickFirstFrom(p, 'firstname', 'firstName', 'givenname', 'givenName');
          const lastName = pickFirstFrom(p, 'lastname', 'lastName', 'familyname', 'familyName', 'surname');
          const preferred = pickFirstFrom(p, 'preferredName', 'preferredname', 'nickname');
          const fullName = pickFirstFrom(p, 'name', 'fullname', 'fullName', 'displayname', 'displayName');
          
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
            firstName,
            lastName,
            displayName,
            photo: p.profilePicture || p.profilepicture || p.photo || null,
          };
        }
      });

      const groupedByPatient = activeHighlights.reduce((acc, h) => {
        const patientId = h.PatientId;
        if (!acc[patientId]) {
          const patientDetails = patientDetailsMap[patientId] || {};
          const patientName = patientDetails.displayName || `Patient ${patientId}`;
          
          acc[patientId] = {
            patientInfo: {
              patientId,
              patientName,
              patientPhoto: patientDetails.photo || null,
            },
            highlights: []
          };
        }
        
        acc[patientId].highlights.push({
          highlightID: h.Id,
          highlightType: h.Type,
          highlightJson: h.HighlightJSON,
          startDate: h.StartDate,
          endDate: h.EndDate,
        });
        
        return acc;
      }, {});

      const transformedData = Object.values(groupedByPatient);
      const aggregatedData = aggregateHighlightsByType(transformedData);
      
      setHighlightsData(aggregatedData);
      setFilteredData(aggregatedData);
      setIsLoading(false);
      setStatusCode(response.status);
      setIsError(false);
      setIsRetry(false);
    } catch (error) {
      console.error('[HIGHLIGHTS] Error:', error);
      setIsLoading(false);
      setIsError(true);
      setStatusCode(500);
    }
  }, [pickFirstFrom, aggregateHighlightsByType]);

  // Filter data when either searchValue or filterValue changes
  useEffect(() => {
    const dataAfterSearch = highlightsData.filter((item) =>
      item.patientInfo.patientName
        .toLowerCase()
        .includes(searchValue.toLowerCase()),
    );

    let dataAfterFilter = highlightsData;
    
    if (filterValue && filterValue !== 'All' && filterValue.length > 0) {
      const filterArray = Array.isArray(filterValue) 
        ? filterValue.flat()
        : [filterValue];
      
      dataAfterFilter = highlightsData.filter((item) =>
        item.highlights.some((h) => filterArray.includes(h.highlightType)),
      );
    }

    const data = dataAfterSearch.filter((value) =>
      dataAfterFilter.includes(value),
    );

    setFilteredData(data);
  }, [highlightsData, searchValue, filterValue]);

  const handlePullToRefresh = useCallback(async () => {
    await getAllHighlights();
  }, [getAllHighlights]);

  const noDataMessage = useCallback(() => {
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
  }, [isLoading, isError, statusCode]);

  const renderHighlightItem = useCallback(({ item }) => (
    <HighlightsCard
      item={item}
      navigation={navigation}
      setModalVisible={setModalVisible}
    />
  ), [navigation]);

  const keyExtractor = useCallback((item) => String(item.patientInfo.patientId), []);

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setSearchValue('');
    setFilterValue('All');
  }, []);

  const openModal = useCallback(() => {
    setModalVisible(true);
    setSearchValue('');
    setFilterValue('All');
  }, []);

  return (
    <>
      <TouchableOpacity
        onPress={openModal}
        testID={'highlightsButton'}
        style={{ flexDirection: 'row' }}
      >
        <Icon
          as={<MaterialIcons name="announcement" />}
          size={10}
          color={colors.black}
        />
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
        onRequestClose={closeModal}
        testID="highlightsModal"
      >
        <Pressable 
          style={styles.centeredView}
          onPress={closeModal}
        >
          <Pressable 
            style={styles.modalView}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.modalHeaderText}>
              Patients Daily Highlights
            </Text>
            <Pressable
              style={styles.buttonClose}
              onPress={closeModal}
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
              keyExtractor={keyExtractor}
              onRefresh={handlePullToRefresh}
              refreshing={isLoading}
              ListEmptyComponent={noDataMessage}
              renderItem={renderHighlightItem}
              testID="flatList"
              removeClippedSubviews={Platform.OS === 'android'}
              maxToRenderPerBatch={10}
              windowSize={10}
              initialNumToRender={10}
              scrollEnabled={true}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    zIndex: 10,
  },
  modalHeaderText: {
    marginBottom: 15,
    marginTop: 10,
    textAlign: 'center',
    fontSize: Platform.OS === 'web' ? 18 : 25,
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
