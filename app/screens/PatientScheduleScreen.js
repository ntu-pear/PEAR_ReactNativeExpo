import React, { useCallback, useRef, useState } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import { FlatList, ScrollView, View, Text, Divider } from 'native-base';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import scheduleApi from 'app/api/schedule';
import {
  patientScheduleFailure,
  patientScheduleParameters,
  patientScheduleResult,
} from 'app/utility/patientScheduleRead';
import requestDeadline from 'app/utility/requestDeadline';
import { sortFilterInitialState, formatDate } from 'app/utility/miscFunctions';
import routes from 'app/navigation/routes';
import colors from 'app/config/colors';
import ActivityIndicator from 'app/components/ActivityIndicator';
import ProfileNameButton from 'app/components/ProfileNameButton';
import SearchFilterBar from 'app/components/filter-components/SearchFilterBar';
import ActivityCard from 'app/components/ActivityCard';

function PatientScheduleScreen({ route }) {
  const patientID = route.params?.patientId ?? route.params?.patientID;
  const date = route.params?.date;
  const readKey = JSON.stringify([patientID, date]);
  const currentKey = useRef(readKey);
  currentKey.current = readKey;
  const generation = useRef(0);
  const navigation = useNavigation();
  const [snapshot, setSnapshot] = useState({
    key: null,
    loading: true,
    weekly: [],
    original: [],
  });
  const [dropdown, setDropdown] = useState(sortFilterInitialState);
  const [datetime, setDatetime] = useState(sortFilterInitialState);

  const refreshSchedule = useCallback(async () => {
    const requestGeneration = ++generation.current;
    setSnapshot({
      key: readKey,
      generation: requestGeneration,
      loading: true,
      weekly: [],
      original: [],
      patientName: '',
    });
    setDropdown(sortFilterInitialState);
    setDatetime(sortFilterInitialState);
    let result;
    try {
      // Validate before even invoking the API, including in mocked/test transports.
      patientScheduleParameters(patientID, date);
      const response = await requestDeadline(
        scheduleApi.getPatientScheduleV1(patientID, date),
      );
      result = patientScheduleResult(response, patientID);
    } catch {
      result = patientScheduleFailure();
    }
    if (
      generation.current !== requestGeneration ||
      currentKey.current !== readKey
    ) {
      return;
    }
    setSnapshot({
      ...result,
      key: readKey,
      generation: requestGeneration,
      loading: false,
      original: result.weekly,
      initialize: true,
    });
  }, [patientID, date, readKey]);

  useFocusEffect(
    useCallback(() => {
      refreshSchedule();
      return () => {
        generation.current += 1;
      };
    }, [refreshSchedule]),
  );

  // Hide the preceding patient's data on the route-change render, before effects run.
  if (snapshot.key !== readKey || snapshot.loading) {
    return <ActivityIndicator visible />;
  }
  const isCurrentSnapshot = () =>
    currentKey.current === readKey &&
    generation.current === snapshot.generation;

  const activities = [
    ...new Set(
      snapshot.original.flatMap((day) =>
        day.activities.map((activity) => activity.activityTitle),
      ),
    ),
  ].sort();
  const filterOptionDetails = {
    'Activity Type': {
      type: 'dropdown',
      options: Object.fromEntries(activities.map((title) => [title, title])),
      isFilter: false,
      nestedFilter: 'activities',
    },
    'Activity Time': {
      type: 'time',
      options: { min: {}, max: {} },
      isFilter: false,
      nestedFilter: 'activities',
    },
  };
  const scheduleWeekly = snapshot.weekly.some((day) => day.activities.length)
    ? snapshot.weekly
    : [];

  return (
    <View style={styles.container}>
      {snapshot.error && (
        <View testID="patient_schedule_read_error">
          <Text>{snapshot.message}</Text>
          {snapshot.retry && (
            <TouchableOpacity
              testID="patient_schedule_retry"
              onPress={refreshSchedule}
            >
              <Text>Retry schedule</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      <View style={{ justifyContent: 'space-between' }}>
        {snapshot.patientName ? (
          <View style={{ alignSelf: 'center', marginTop: 15, maxHeight: 120 }}>
            <ProfileNameButton
              testID={`schedule_screen_${patientID}_profileNameButton`}
              profileLineOne={snapshot.patientName}
              profileLineTwo=""
              handleOnPress={() =>
                navigation.navigate(routes.PATIENT_PROFILE, { id: patientID })
              }
              isPatient
              isVertical={false}
              size={90}
            />
          </View>
        ) : null}
        <Divider width="94%" alignSelf="center" />
        <View marginRight="3%" marginLeft="3%">
          <SearchFilterBar
            key={readKey}
            originalList={snapshot.original}
            setList={(weekly) => {
              if (isCurrentSnapshot())
                setSnapshot((previous) =>
                  previous.key === readKey &&
                  previous.generation === snapshot.generation
                    ? { ...previous, weekly }
                    : previous,
                );
            }}
            FIELD_MAPPING={{
              'Activity Type': 'activityTitle',
              'Activity Time': 'startTime',
            }}
            FILTER_OPTIONS={['Activity Type', 'Activity Time']}
            filterOptionDetails={filterOptionDetails}
            datetime={datetime}
            setDatetime={setDatetime}
            dropdown={dropdown}
            setDropdown={setDropdown}
            initializeData={snapshot.initialize}
            onInitialize={() =>
              setSnapshot((previous) =>
                previous.key === readKey &&
                previous.generation === snapshot.generation
                  ? { ...previous, initialize: false }
                  : previous,
              )
            }
            hideSearchBar
          />
        </View>
      </View>
      <FlatList
        marginLeft="4%"
        marginRight="4%"
        marginBottom="4%"
        marginTop="1%"
        horizontal
        height="80%"
        ListEmptyComponent={() =>
          snapshot.error ? null : (
            <View width={Dimensions.get('window').width - 85} height="80%">
              <Text testID="patient_schedule_empty">
                No saved schedule found for this week.
              </Text>
            </View>
          )
        }
        data={scheduleWeekly}
        keyExtractor={(item) => `${item.patientID}-${item.date.toISOString()}`}
        renderItem={({ item }) => (
          <View style={styles.col}>
            <View style={styles.dateContainer}>
              <Text style={styles.dateText}>
                {formatDate(item.date, false)}
              </Text>
            </View>
            <ScrollView
              width="100%"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                flexGrow: 1,
                alignItems: 'center',
                justifyContent: item.activities.length
                  ? 'flex-start'
                  : 'center',
              }}
            >
              {item.activities.map((activity, index) => (
                <ActivityCard
                  key={index}
                  activityTitle={activity.activityTitle}
                  activityStartTime={activity.startTime}
                  activityEndTime={activity.endTime}
                  currentTime={new Date()}
                  medications={activity.medications}
                  patientName={item.patientName}
                  patientID={item.patientID}
                  date={formatDate(item.date, true)}
                  navigation={navigation}
                />
              ))}
            </ScrollView>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  col: {
    justifyContent: 'center',
    borderRightColor: colors.grey_lighter,
    borderRightWidth: 0.5,
  },
  dateText: { color: colors.white, fontSize: 18, fontWeight: 'bold' },
  dateContainer: {
    backgroundColor: colors.green,
    width: 210,
    alignSelf: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
});

export default PatientScheduleScreen;
