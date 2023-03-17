import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from 'app/screens/DashboardScreen';

// Import Constants from Routes
import routes from 'app/navigation/routes';
import { Image, Row } from 'native-base';
import { TouchableOpacity, Text } from 'react-native';
import ActivityFilterCard from 'app/components/ActivityFilterCard';
import dashboardApi from 'app/api/dashboard';

// Refer to this: https://reactnavigation.org/docs/hello-react-navigation
const Stack = createNativeStackNavigator();

// Refer to this for configuration: https://reactnavigation.org/docs/native-stack-navigator#options
function DashboardNavigator() {
  const [modalVisible, setModalVisible] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [selectedStartTime, setSelectedStartTime] = useState(
    new Date(
      currentDateTime.getFullYear(),
      currentDateTime.getMonth(),
      currentDateTime.getDate(),
      0,
      0,
      0,
    ),
  );
  const [selectedEndTime, setSelectedEndTime] = useState(
    new Date(
      currentDateTime.getFullYear(),
      currentDateTime.getMonth(),
      currentDateTime.getDate(),
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

  const getDefaultStartTime = () =>
    new Date(
      currentDateTime.getFullYear(),
      currentDateTime.getMonth(),
      currentDateTime.getDate(),
      0,
      0,
      0,
    );

  const getDefaultEndTime = () =>
    new Date(
      currentDateTime.getFullYear(),
      currentDateTime.getMonth(),
      currentDateTime.getDate(),
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

  const getDashboardData = async () => {
    setIsLoading(true);
    setIsError(false);
    const response = await dashboardApi.getDashboard();
    return new Promise((resolve, reject) => {
      if (response.ok) {
        setIsLoading(false);
        setStatusCode(response.status);
        resolve(response.data.data);
      } else {
        setIsLoading(false);
        setIsError(true);
        setStatusCode(response.status);
        reject('ERROR');
      }
    });
  };

  const noDataMessage = () => {
    // Display error message if API request fails
    if (isError) {
      if (statusCode === 401) {
        return <Text>Error: User is not authenticated.</Text>;
      } else if (statusCode >= 500) {
        return <Text>Error: Server is down. Please try again later.</Text>;
      }
      return <Text>{statusCode} error has occurred.</Text>;
    }

    return <Text>No schedule can be found.</Text>;
  };

  const handlePullToRefresh = async () => {
    await getDashboardData();
    setCurrentDateTime(new Date());
  };

  useEffect(() => {
    getDashboardData()
      .then((res) => {
        setPatientsData(res);
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.log(err);
      });
  }, []);

  useEffect(() => {
    updateFilteredPatientsData();
    setActivityList(getActivityList());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientsData]);

  useEffect(() => {
    setSelectedStartTime(
      new Date(
        currentDateTime.getFullYear(),
        currentDateTime.getMonth(),
        currentDateTime.getDate(),
        currentDateTime.setHours(0, 0, 0),
      ),
    );
    setSelectedEndTime(
      new Date(
        currentDateTime.getFullYear(),
        currentDateTime.getMonth(),
        currentDateTime.getDate(),
        currentDateTime.setHours(23, 59, 59),
      ),
    );
    setSelectedActivity(null);
    setActivityFilterList(null);
  }, [currentDateTime, selectedDate]);

  useEffect(() => {
    updateFilteredPatientsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStartTime, selectedEndTime, selectedActivity]);

  return (
    <Stack.Navigator>
      <Stack.Screen
        name={routes.DASHBOARD_SCREEN}
        options={{
          headerRight: () => (
            <Row space={4}>
              <TouchableOpacity onPress={() => setModalVisible(true)}>
                <Image
                  alt={'filter'}
                  source={{
                    uri: 'https://cdn-icons-png.flaticon.com/512/7693/7693332.png',
                  }}
                  size={'25px'}
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
              <TouchableOpacity>
                <Image
                  alt={'daily-highlights'}
                  source={{
                    uri: 'https://cdn-icons-png.flaticon.com/512/747/747310.png',
                  }}
                  size={'25px'}
                />
              </TouchableOpacity>
            </Row>
          ),
        }}
      >
        {() => (
          <DashboardScreen
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            filteredActivityData={filteredPatientsData}
            currentTime={currentDateTime}
            isLoading={isLoading}
            handlePullToRefresh={handlePullToRefresh}
            noDataMessage={noDataMessage}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

export default DashboardNavigator;
