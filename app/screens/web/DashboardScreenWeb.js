import React, { useEffect, useState } from 'react';
import DashboardScreen from 'app/screens/DashboardScreen';

import { Image, Row, VStack } from 'native-base';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import ActivityFilterCard from 'app/components/ActivityFilterCard';
import dashboardApi from 'app/api/dashboard';
import PatientDailyHighlights from 'app/components/PatientDailyHighlights';

// Refer to this for configuration: https://reactnavigation.org/docs/native-stack-navigator#options
function DashboardScreenWeb(props) {
  const { sidebar } = props;
  const [modalVisible, setModalVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedStartTime, setSelectedStartTime] = useState(
    new Date(
      currentTime.getFullYear(),
      currentTime.getMonth(),
      currentTime.getDate(),
      0,
      0,
      0,
    ),
  );
  const [selectedEndTime, setSelectedEndTime] = useState(
    new Date(
      currentTime.getFullYear(),
      currentTime.getMonth(),
      currentTime.getDate(),
      23,
      59,
      59,
    ),
  );
  const [patientsData, setPatientsData] = useState([]);
  const [filteredPatientsData, setFilteredPatientsData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activityList, setActivityList] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [activityFilterList, setActivityFilterList] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [statusCode, setStatusCode] = useState();
  const [highlightsModalVisible, setHighlightsModalVisible] = useState(true);

  const getDefaultStartTime = () =>
    new Date(
      currentTime.getFullYear(),
      currentTime.getMonth(),
      currentTime.getDate(),
      0,
      0,
      0,
    );

  const getDefaultEndTime = () =>
    new Date(
      currentTime.getFullYear(),
      currentTime.getMonth(),
      currentTime.getDate(),
      23,
      59,
      59,
    );

  const getActivityList = () => {
    const activities = [];
    patientsData.forEach((patient) => {
      patient.activities.forEach((activity) => {
        if (!activities.includes(activity.activityTitle)) {
          activities.push(activity.activityTitle);
        }
      });
    });
    activities.sort();
    return activities;
  };
  const compareDates = (activityDate, selectedDateLocal) => {
    return (
      activityDate.getFullYear() === selectedDateLocal.getFullYear() &&
      activityDate.getMonth() === selectedDateLocal.getMonth() &&
      activityDate.getDate() === selectedDateLocal.getDate()
    );
  };

  const isSelectedActivity = (activityTitle) => {
    return (
      selectedActivity === null || selectedActivity.title === activityTitle
    );
  };

  const isWithinTimeRange = (activityStart, activityEnd) => {
    if (
      activityStart.getHours() > selectedEndTime.getHours() ||
      activityEnd.getHours() < selectedStartTime.getHours()
    ) {
      return false;
    }
    return !(
      (activityStart.getHours() === selectedEndTime.getHours() &&
        activityStart.getMinutes() > selectedEndTime.getMinutes()) ||
      (activityEnd.getHours() === selectedStartTime.getHours() &&
        activityEnd.getMinutes() < selectedStartTime.getMinutes())
    );
  };
  const updateFilteredPatientsData = () => {
    const filtered = [];
    patientsData.forEach((patient) => {
      const activities = [];
      patient.activities.forEach((activity) => {
        const activityDate = new Date(activity.date);
        if (compareDates(activityDate, selectedDate)) {
          if (
            isWithinTimeRange(
              new Date(activity.startTime),
              new Date(activity.endTime),
            ) &&
            isSelectedActivity(activity.activityTitle)
          ) {
            activities.push({
              activityTitle: activity.activityTitle,
              date: activity.date,
              startTime: activity.startTime,
              endTime: activity.endTime,
            });
          }
        }
      });

      if (activities.length !== 0) {
        filtered.push({
          patientImage: patient.patientImage,
          patientId: patient.patientId,
          patientName: patient.patientName,
          activities: activities,
        });
      }
    });

    setFilteredPatientsData(filtered);
  };

  const refreshDashboardData = () => {
    setIsLoading(true);
    setIsError(false);
    dashboardApi
      .getDashboard()
      .then((res) => {
        if (res.status === 200) {
          setPatientsData(res.data.data);
          setIsLoading(false);
          setStatusCode(res.status);
        } else {
          setIsLoading(false);
          setIsError(true);
          setStatusCode(res.status);
        }
      })
      .catch((err) => {
        setIsLoading(false);
        setIsError(true);
        setStatusCode(err.response.status);
      });
  };

  const noDataMessage = () => {
    // Display error message if API request fails
    if (isError) {
      if (statusCode === 401) {
        return (
          <Text style={styles.text}>Error: User is not authenticated.</Text>
        );
      } else if (statusCode >= 500) {
        return (
          <Text style={styles.text}>
            Error: Server is down. Please try again later.
          </Text>
        );
      }
      return <Text style={styles.text}>{statusCode} error has occurred.</Text>;
    }

    return <Text style={styles.text}>No schedule can be found.</Text>;
  };

  const handlePullToRefresh = () => {
    refreshDashboardData();
    setCurrentTime(new Date());
  };

  useEffect(() => {
    refreshDashboardData();
  }, []);

  useEffect(() => {
    updateFilteredPatientsData();
    setActivityList(getActivityList());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientsData]);

  useEffect(() => {
    setSelectedStartTime(getDefaultStartTime());
    setSelectedEndTime(getDefaultEndTime());
    setSelectedActivity(null);
    setActivityFilterList(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTime, selectedDate]);

  useEffect(() => {
    updateFilteredPatientsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStartTime, selectedEndTime, selectedActivity]);

  return (
    <VStack>
      <Row
        w={sidebar ? '83vw' : '98vw'}
        style={{ justifyContent: 'flex-end' }}
        space={4}
      >
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Image
            alt={'filter'}
            source={{
              uri: 'https://cdn-icons-png.flaticon.com/512/7693/7693332.png',
            }}
            size={'42px'}
            m="3"
          />
          <ActivityFilterCard
            modalVisible={modalVisible}
            setModalVisible={setModalVisible}
            selectedStartTime={selectedStartTime}
            setSelectedStartTime={setSelectedStartTime}
            selectedEndTime={selectedEndTime}
            setSelectedEndTime={setSelectedEndTime}
            updateFilteredActivityData={updateFilteredPatientsData}
            activityList={activityList}
            setSelectedActivity={setSelectedActivity}
            activityFilterList={activityFilterList}
            setActivityFilterList={setActivityFilterList}
            getDefaultStartTime={getDefaultStartTime}
            getDefaultEndTime={getDefaultEndTime}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setHighlightsModalVisible(!modalVisible)}
          testID={'highlightsButton'}
        >
          <Image
            alt={'daily-highlights'}
            source={{
              uri: 'https://cdn-icons-png.flaticon.com/512/747/747310.png',
            }}
            size={'42px'}
            m="3"
          />
          <PatientDailyHighlights
            modalVisible={highlightsModalVisible}
            setModalVisible={setHighlightsModalVisible}
          />
        </TouchableOpacity>
      </Row>
      <DashboardScreen
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        filteredActivityData={filteredPatientsData}
        currentTime={currentTime}
        isLoading={isLoading}
        handlePullToRefresh={handlePullToRefresh}
        noDataMessage={noDataMessage}
      />
    </VStack>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
    fontSize: 24,
    marginTop: 24,
  },
});
export default DashboardScreenWeb;
