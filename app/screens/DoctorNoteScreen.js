// Libs
import React, { useContext, useRef, useState, useEffect } from 'react';
import {
  Alert,
  Keyboard,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import { FlatList, View } from 'native-base';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

// APIs
import doctorNoteApi from 'app/api/doctorNote';
import { readDoctorNotePage } from 'app/utility/doctorNoteRead';
import patientApi from 'app/api/patient';
import { patientProfileLines } from 'app/utility/patientHeader';

// Utilities
import {
  isEmptyObject,
  noDataMessage,
  sortFilterInitialState,
  formatDate,
} from 'app/utility/miscFunctions';

// Navigation
import routes from 'app/navigation/routes';

// Configurations
import colors from 'app/config/colors';

// Components
import ProfileNameButton from 'app/components/ProfileNameButton';
import ActivityIndicator from 'app/components/ActivityIndicator';
import SearchFilterBar from 'app/components/filter-components/SearchFilterBar';
import LoadingWheel from 'app/components/LoadingWheel';
import DynamicTable from 'app/components/DynamicTable';
import DoctorNoteItem from 'app/components/DoctorNoteItem';
import Swipeable from 'app/components/swipeable-components/Swipeable';

function DoctorNoteScreen(props) {
  let { patientID, patientId } = props.route.params;
  if (patientId) {
    patientID = patientId;
  }

  const testID = `doctor_note_screen_${patientID}`;

  const navigation = useNavigation();
  const readGeneration = useRef(0);
  const [noteError, setNoteError] = useState(false);
  const [headerError, setHeaderError] = useState(false);

  // API call related states
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isRetry, setIsRetry] = useState(false);
  const [statusCode, setStatusCode] = useState(200);

  // Patient data state
  const [patientData, setPatientData] = useState({});
  const [noteData, setNoteData] = useState([]);
  const [originalNoteData, setOriginalNoteData] = useState([]);

  // Display mode options
  const [displayMode, setDisplayMode] = useState('rows');
  const DISPLAY_MODES = ['rows', 'table'];

  const SEARCH_OPTIONS = ['Created Datetime'];

  // Sort and Filter options
  const SORT_OPTIONS = ['Created Datetime'];
  const FILTER_OPTIONS = ['Created Datetime'];

  // Mapping for fields
  const FIELD_MAPPING = {
    'Created Datetime': 'date',
  };

  // Filter details state
  const [filterOptionDetails, setFilterOptionDetails] = useState({
    'Created Datetime': {
      type: 'date',
      options: { min: {}, max: {} },
      isFilter: true,
    },
  });

  // Search, sort, and filter related states
  const [sort, setSort] = useState(sortFilterInitialState);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDataInitialized, setIsDataInitialized] = useState(false);
  const [datetime, setDatetime] = useState(sortFilterInitialState);

  // Scrollview state
  const [isScrolling, setIsScrolling] = useState(false);

  const refreshPageData = React.useCallback(async () => {
    const generation = ++readGeneration.current;
    setIsLoading(true);
    setNoteData([]);
    setOriginalNoteData([]);
    setPatientData({});
    const result = await readDoctorNotePage({
      patientId: patientID,
      readNotes: doctorNoteApi.getDoctorNote,
      readPatient: patientApi.getPatient,
    });
    if (generation !== readGeneration.current) {
      return;
    }
    setNoteData(result.notes);
    setOriginalNoteData(result.notes);
    setPatientData(result.patient);
    setNoteError(result.noteError);
    setHeaderError(result.headerError);
    setIsError(result.noteError || result.headerError);
    setIsRetry(result.noteError || result.headerError);
    setStatusCode(result.status);
    setIsDataInitialized(true);
    setIsLoading(false);
  }, [patientID]);
  useFocusEffect(
    React.useCallback(() => {
      refreshPageData();
      return () => {
        readGeneration.current += 1;
      };
    }, [refreshPageData]),
  );

  const onClickProfile = () => {
    navigation.navigate(routes.PATIENT_PROFILE, { id: patientID });
  };

  const getTableHeaderData = () => {
    return ['Doctor', 'Remarks', 'Created'];
  };

  const getTableRowData = () => {
    return noteData.map(({ ...item }) => {
      let rowData = [
        item.doctorName,
        item.doctorRemarks,
        formatDate(new Date(item.date), true),
      ];
      return rowData;
    });
  };

  return isLoading ? (
    <ActivityIndicator visible />
  ) : (
    <View style={styles.container}>
      {(noteError || headerError) && (
        <View testID="doctor_notes_read_error">
          <Text>
            {noteError
              ? 'Doctor Notes could not be loaded.'
              : 'The patient header could not be loaded.'}
          </Text>
          <TouchableOpacity
            testID="doctor_notes_retry"
            onPress={refreshPageData}
          >
            <Text>Retry Doctor Notes</Text>
          </TouchableOpacity>
        </View>
      )}
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
          ) : headerError ? (
            <Text>Patient header unavailable</Text>
          ) : (
            <LoadingWheel />
          )}
        </View>
        <View>
          <SearchFilterBar
            originalList={originalNoteData}
            setList={setNoteData}
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
            itemType="Note"
            itemCount={noteData.length}
            displayMode={displayMode}
            setDisplayMode={setDisplayMode}
            DISPLAY_MODES={DISPLAY_MODES}
          />
        </View>
        {displayMode == 'rows' ? (
          <FlatList
            onTouchStart={() => Keyboard.dismiss()}
            onScrollBeginDrag={() => setIsScrolling(true)}
            onScrollEndDrag={() => setIsScrolling(false)}
            onRefresh={refreshPageData}
            refreshing={isLoading}
            height={'72%'}
            ListEmptyComponent={() =>
              noDataMessage(
                statusCode,
                isLoading,
                isError,
                'No Notes Found',
                true,
              )
            }
            data={noteData}
            keyboardShouldPersistTaps="handled"
            keyExtractor={(item) => item.doctorNoteId}
            renderItem={({ item }) => {
              return (
                <Swipeable
                  key={item.doctorNoteId}
                  setIsScrolling={setIsScrolling}
                  item={
                    <TouchableOpacity
                      style={styles.logContainer}
                      activeOpacity={1}
                      disabled={!isScrolling}
                    >
                      <DoctorNoteItem
                        date={item.date}
                        doctorName={item.doctorName}
                        doctorRemarks={item.doctorRemarks}
                      />
                    </TouchableOpacity>
                  }
                />
              );
            }}
          />
        ) : (
          <View
            style={{ height: '72%', marginBottom: 20, marginHorizontal: 40 }}
          >
            <DynamicTable
              headerData={getTableHeaderData()}
              rowData={getTableRowData()}
              widthData={[
                180, 200, 200, 180, 100, 200, 120, 120, 200, 150, 150,
              ]}
              screenName={'Doctor Note'}
              noDataMessage={noDataMessage(
                statusCode,
                isLoading,
                isError,
                'No notes found',
                false,
              )}
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
  },
  logContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default DoctorNoteScreen;
