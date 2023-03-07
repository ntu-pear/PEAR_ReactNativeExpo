import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from 'app/screens/DashboardScreen';

// Import Constants from Routes
import routes from 'app/navigation/routes';
import { Image, Row } from 'native-base';
import { TouchableOpacity } from 'react-native';
import ActivityFilterCard from 'app/components/ActivityFilterCard';

// Refer to this: https://reactnavigation.org/docs/hello-react-navigation
const Stack = createNativeStackNavigator();

const mockApiV2 = () => {
  return new Promise((resolve, reject) => {
    const data = [
      {
        patientImage: 'https://cdn-icons-png.flaticon.com/512/2202/2202112.png',
        patientId: 1,
        patientName: 'Mary Lim',
        activities: [
          {
            activityTitle: 'Drawing',
            date: '2023-01-01',
            startTime: '2023-01-01T08:00:00+08:00',
            endTime: '2023-01-01T10:00:00+08:00',
          },
          {
            activityTitle: 'Colouring',
            date: '2023-01-01',
            startTime: '2023-01-01T10:00:00+08:00',
            endTime: '2023-01-01T12:00:00+08:00',
          },
          {
            activityTitle: 'Pet Therapy',
            date: '2023-01-01',
            startTime: '2023-01-01T14:00:00+08:00',
            endTime: '2023-01-01T16:00:00+08:00',
          },
          {
            activityTitle: 'Singing',
            date: '2023-01-02',
            startTime: '2023-01-02T10:00:00+08:00',
            endTime: '2023-01-02T12:00:00+08:00',
          },
          {
            activityTitle: 'Exercise',
            date: '2023-01-03',
            startTime: '2023-01-03T14:00:00+08:00',
            endTime: '2023-01-03T16:00:00+08:00',
          },
          {
            activityTitle: 'Cooking',
            date: '2023-01-04',
            startTime: '2023-01-04T18:00:00+08:00',
            endTime: '2023-01-04T20:00:00+08:00',
          },
        ],
      },
      {
        patientImage: 'https://cdn-icons-png.flaticon.com/512/2202/2202112.png',
        patientId: 2,
        patientName: 'Justin Lim',
        activities: [
          {
            activityTitle: 'Drawing',
            date: '2023-01-01',
            startTime: '2023-01-01T08:00:00+08:00',
            endTime: '2023-01-01T10:00:00+08:00',
          },
          {
            activityTitle: 'Colouring',
            date: '2023-01-01',
            startTime: '2023-01-01T10:00:00+08:00',
            endTime: '2023-01-01T12:00:00+08:00',
          },
          {
            activityTitle: 'Pet Therapy',
            date: '2023-01-01',
            startTime: '2023-01-01T14:00:00+08:00',
            endTime: '2023-01-01T16:00:00+08:00',
          },
          {
            activityTitle: 'Singing',
            date: '2023-01-01',
            startTime: '2023-01-01T18:00:00+08:00',
            endTime: '2023-01-01T20:00:00+08:00',
          },
          {
            activityTitle: 'Pet Therapy',
            date: '2023-01-02',
            startTime: '2023-01-02T14:00:00+08:00',
            endTime: '2023-01-02T16:00:00+08:00',
          },
          {
            activityTitle: 'Singing',
            date: '2023-01-02',
            startTime: '2023-01-02T18:00:00+08:00',
            endTime: '2023-01-02T20:00:00+08:00',
          },
        ],
      },
      {
        patientImage: 'https://cdn-icons-png.flaticon.com/512/2202/2202112.png',
        patientId: 3,
        patientName: 'Bob Tan',
        activities: [
          {
            activityTitle: 'Drawing',
            date: '2023-01-01',
            startTime: '2023-01-01T08:00:00+08:00',
            endTime: '2023-01-01T10:00:00+08:00',
          },
          {
            activityTitle: 'Colouring',
            date: '2023-01-01',
            startTime: '2023-01-01T10:00:00+08:00',
            endTime: '2023-01-01T12:00:00+08:00',
          },
          {
            activityTitle: 'Pet Therapy',
            date: '2023-01-01',
            startTime: '2023-01-01T14:00:00+08:00',
            endTime: '2023-01-01T16:00:00+08:00',
          },
          {
            activityTitle: 'Singing',
            date: '2023-01-01',
            startTime: '2023-01-01T18:00:00+08:00',
            endTime: '2023-01-01T20:00:00+08:00',
          },
          {
            activityTitle: 'Pet Therapy',
            date: '2023-01-02',
            startTime: '2023-01-02T14:00:00+08:00',
            endTime: '2023-01-02T16:00:00+08:00',
          },
          {
            activityTitle: 'Singing',
            date: '2023-01-02',
            startTime: '2023-01-02T18:00:00+08:00',
            endTime: '2023-01-02T20:00:00+08:00',
          },
        ],
      },
      {
        patientImage: 'https://cdn-icons-png.flaticon.com/512/2202/2202112.png',
        patientId: 4,
        patientName: 'Xenia Tan',
        activities: [
          {
            activityTitle: 'Drawing',
            date: '2023-01-01',
            startTime: '2023-01-01T08:00:00+08:00',
            endTime: '2023-01-01T10:00:00+08:00',
          },
          {
            activityTitle: 'Colouring',
            date: '2023-01-01',
            startTime: '2023-01-01T10:00:00+08:00',
            endTime: '2023-01-01T12:00:00+08:00',
          },
          {
            activityTitle: 'Pet Therapy',
            date: '2023-01-01',
            startTime: '2023-01-01T14:00:00+08:00',
            endTime: '2023-01-01T16:00:00+08:00',
          },
          {
            activityTitle: 'Singing',
            date: '2023-01-01',
            startTime: '2023-01-01T18:00:00+08:00',
            endTime: '2023-01-01T20:00:00+08:00',
          },
        ],
      },
      {
        patientImage: 'https://cdn-icons-png.flaticon.com/512/2202/2202112.png',
        patientId: 5,
        patientName: 'Frank Chua',
        activities: [
          {
            activityTitle: 'Drawing',
            date: '2023-01-01',
            startTime: '2023-01-01T08:00:00+08:00',
            endTime: '2023-01-01T10:00:00+08:00',
          },
          {
            activityTitle: 'Colouring',
            date: '2023-01-01',
            startTime: '2023-01-01T10:00:00+08:00',
            endTime: '2023-01-01T12:00:00+08:00',
          },
          {
            activityTitle: 'Pet Therapy',
            date: '2023-01-01',
            startTime: '2023-01-01T14:00:00+08:00',
            endTime: '2023-01-01T16:00:00+08:00',
          },
          {
            activityTitle: 'Singing',
            date: '2023-01-01',
            startTime: '2023-01-01T18:00:00+08:00',
            endTime: '2023-01-01T20:00:00+08:00',
          },
          {
            activityTitle: 'Pet Therapy',
            date: '2023-01-02',
            startTime: '2023-01-02T14:00:00+08:00',
            endTime: '2023-01-02T16:00:00+08:00',
          },
          {
            activityTitle: 'Singing',
            date: '2023-01-02',
            startTime: '2023-01-02T18:00:00+08:00',
            endTime: '2023-01-02T20:00:00+08:00',
          },
        ],
      },
      {
        patientImage: 'https://cdn-icons-png.flaticon.com/512/2202/2202112.png',
        patientId: 6,
        patientName: 'Joan Wong',
        activities: [
          {
            activityTitle: 'Drawing',
            date: '2023-01-01',
            startTime: '2023-01-01T08:00:00+08:00',
            endTime: '2023-01-01T10:00:00+08:00',
          },
          {
            activityTitle: 'Colouring',
            date: '2023-01-01',
            startTime: '2023-01-01T10:00:00+08:00',
            endTime: '2023-01-01T12:00:00+08:00',
          },
          {
            activityTitle: 'Pet Therapy',
            date: '2023-01-01',
            startTime: '2023-01-01T14:00:00+08:00',
            endTime: '2023-01-01T16:00:00+08:00',
          },
          {
            activityTitle: 'Singing',
            date: '2023-01-01',
            startTime: '2023-01-01T18:00:00+08:00',
            endTime: '2023-01-01T20:00:00+08:00',
          },
        ],
      },
      {
        patientImage: 'https://cdn-icons-png.flaticon.com/512/2202/2202112.png',
        patientId: 7,
        patientName: 'Brandon Goh',
        activities: [
          {
            activityTitle: 'Drawing',
            date: '2023-01-01',
            startTime: '2023-01-01T08:00:00+08:00',
            endTime: '2023-01-01T10:00:00+08:00',
          },
          {
            activityTitle: 'Colouring',
            date: '2023-01-01',
            startTime: '2023-01-01T10:00:00+08:00',
            endTime: '2023-01-01T12:00:00+08:00',
          },
          {
            activityTitle: 'Pet Therapy',
            date: '2023-01-01',
            startTime: '2023-01-01T14:00:00+08:00',
            endTime: '2023-01-01T16:00:00+08:00',
          },
          {
            activityTitle: 'Singing',
            date: '2023-01-01',
            startTime: '2023-01-01T18:00:00+08:00',
            endTime: '2023-01-01T20:00:00+08:00',
          },
        ],
      },
    ];
    if (true) {
      resolve(data);
    } else {
      reject('ERROR');
    }
  });
};

// Refer to this for configuration: https://reactnavigation.org/docs/native-stack-navigator#options
function DashboardNavigator() {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStartTime, setSelectedStartTime] = useState(
    new Date('2023-01-01T00:00:00+08:00'),
  );
  const [selectedEndTime, setSelectedEndTime] = useState(
    new Date('2023-01-01T23:59:59+08:00'),
  );
  const [patientsData, setPatientsData] = useState([]);
  const [filteredPatientsData, setFilteredPatientsData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date('2023-01-01'));
  const [activityList, setActivityList] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [activityFilterList, setActivityFilterList] = useState(null);
  const [currentTime, setCurrentTime] = useState(
    new Date('2023-01-01T14:30:00+08:00'),
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

  useEffect(() => {
    // API GET Activity Data
    mockApiV2()
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
    setSelectedStartTime(new Date('2023-01-01T00:00:00+08:00'));
    setSelectedEndTime(new Date('2023-01-01T23:59:59+08:00'));
    setSelectedActivity(null);
    setActivityFilterList(null);
  }, [selectedDate]);

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
            currentTime={currentTime}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

export default DashboardNavigator;
