DashboardScreen.js;

import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import {
  Avatar,
  Box,
  Container,
  FlatList,
  HStack,
  ScrollView,
  Image,
  Stack,
  View,
} from 'native-base';
import ActivityCard from 'app/components/ActivityCard';

import colors from 'app/config/colors';
import ActivityCalendarCard from 'app/components/ActivityCalendarCard';

const mockApi = async () => {
  return [
    {
      patientImage: 'https://cdn-icons-png.flaticon.com/512/2202/2202112.png',
      patientId: 1,
      patientName: 'Mary Lim',
      activities: [
        {
          activityTitle: 'Drawing',
          date: '2023-01-01',
          startTime: '08:00',
          endTime: '10:00',
        },
        {
          activityTitle: 'Colouring',
          date: '2023-01-01',
          startTime: '10:00',
          endTime: '12:00',
        },
        {
          activityTitle: 'Pet Therapy',
          date: '2023-01-01',
          startTime: '14:00',
          endTime: '16:00',
        },
        {
          activityTitle: 'Singing',
          date: '2023-01-02',
          startTime: '10:00',
          endTime: '12:00',
        },
        {
          activityTitle: 'Exercise',
          date: '2023-01-03',
          startTime: '14:00',
          endTime: '16:00',
        },
        {
          activityTitle: 'Cooking',
          date: '2023-01-04',
          startTime: '18:00',
          endTime: '20:00',
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
          startTime: '08:00',
          endTime: '10:00',
        },
        {
          activityTitle: 'Colouring',
          date: '2023-01-01',
          startTime: '10:00',
          endTime: '12:00',
        },
        {
          activityTitle: 'Pet Therapy',
          date: '2023-01-01',
          startTime: '14:00',
          endTime: '16:00',
        },
        {
          activityTitle: 'Singing',
          date: '2023-01-01',
          startTime: '18:00',
          endTime: '20:00',
        },
        {
          activityTitle: 'Pet Therapy',
          date: '2023-01-02',
          startTime: '14:00',
          endTime: '16:00',
        },
        {
          activityTitle: 'Singing',
          date: '2023-01-02',
          startTime: '18:00',
          endTime: '20:00',
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
          startTime: '08:00',
          endTime: '10:00',
        },
        {
          activityTitle: 'Colouring',
          date: '2023-01-01',
          startTime: '10:00',
          endTime: '12:00',
        },
        {
          activityTitle: 'Pet Therapy',
          date: '2023-01-01',
          startTime: '14:00',
          endTime: '16:00',
        },
        {
          activityTitle: 'Singing',
          date: '2023-01-01',
          startTime: '18:00',
          endTime: '20:00',
        },
        {
          activityTitle: 'Pet Therapy',
          date: '2023-01-02',
          startTime: '14:00',
          endTime: '16:00',
        },
        {
          activityTitle: 'Singing',
          date: '2023-01-02',
          startTime: '18:00',
          endTime: '20:00',
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
          startTime: '08:00',
          endTime: '10:00',
        },
        {
          activityTitle: 'Colouring',
          date: '2023-01-01',
          startTime: '10:00',
          endTime: '12:00',
        },
        {
          activityTitle: 'Pet Therapy',
          date: '2023-01-01',
          startTime: '14:00',
          endTime: '16:00',
        },
        {
          activityTitle: 'Singing',
          date: '2023-01-01',
          startTime: '18:00',
          endTime: '20:00',
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
          startTime: '08:00',
          endTime: '10:00',
        },
        {
          activityTitle: 'Colouring',
          date: '2023-01-01',
          startTime: '10:00',
          endTime: '12:00',
        },
        {
          activityTitle: 'Pet Therapy',
          date: '2023-01-01',
          startTime: '14:00',
          endTime: '16:00',
        },
        {
          activityTitle: 'Singing',
          date: '2023-01-01',
          startTime: '18:00',
          endTime: '20:00',
        },
        {
          activityTitle: 'Pet Therapy',
          date: '2023-01-02',
          startTime: '14:00',
          endTime: '16:00',
        },
        {
          activityTitle: 'Singing',
          date: '2023-01-02',
          startTime: '18:00',
          endTime: '20:00',
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
          startTime: '08:00',
          endTime: '10:00',
        },
        {
          activityTitle: 'Colouring',
          date: '2023-01-01',
          startTime: '10:00',
          endTime: '12:00',
        },
        {
          activityTitle: 'Pet Therapy',
          date: '2023-01-01',
          startTime: '14:00',
          endTime: '16:00',
        },
        {
          activityTitle: 'Singing',
          date: '2023-01-01',
          startTime: '18:00',
          endTime: '20:00',
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
          startTime: '08:00',
          endTime: '10:00',
        },
        {
          activityTitle: 'Colouring',
          date: '2023-01-01',
          startTime: '10:00',
          endTime: '12:00',
        },
        {
          activityTitle: 'Pet Therapy',
          date: '2023-01-01',
          startTime: '14:00',
          endTime: '16:00',
        },
        {
          activityTitle: 'Singing',
          date: '2023-01-01',
          startTime: '18:00',
          endTime: '20:00',
        },
      ],
    },
  ];
};

function DashboardScreen() {
  const [activityData, setActivityData] = useState([]);
  const [filteredActivityData, setFilteredActivityData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date('2023-01-01'));

  const updateFilteredActivityData = () => {
    const filtered = [];
    activityData.forEach((patient) => {
      const activities = [];
      patient.activities.forEach((activity) => {
        if (new Date(activity.date).getDate() === selectedDate.getDate()) {
          activities.push({
            activityTitle: activity.activityTitle,
            date: activity.date,
            startTime: activity.startTime,
            endTime: activity.endTime,
          });
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

    setFilteredActivityData(filtered);
  };

  useEffect(() => {
    // API GET Activity Data
    mockApi()
      .then((res) => {
        setActivityData(res);
      })
      .then(() => updateFilteredActivityData());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    updateFilteredActivityData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const handlePreviousDate = () => {
    const previous = new Date(selectedDate.getTime());
    previous.setDate(selectedDate.getDate() - 1);
    setSelectedDate(previous);
  };

  const handleNextDate = () => {
    const next = new Date(selectedDate.getTime());
    next.setDate(selectedDate.getDate() + 1);
    setSelectedDate(next);
  };

  return (
    <View>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="center"
        margin="2"
      >
        <TouchableOpacity onPress={handlePreviousDate}>
          <Image
            marginRight="3"
            source={{
              uri: 'https://cdn-icons-png.flaticon.com/512/2722/2722991.png',
            }}
            size={'30px'}
          />
        </TouchableOpacity>
        <ActivityCalendarCard
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />
        <TouchableOpacity onPress={handleNextDate}>
          <Image
            marginLeft="3"
            source={{
              uri: 'https://cdn-icons-png.flaticon.com/512/2722/2722991.png',
            }}
            style={{
              transform: [{ rotate: '180deg' }],
            }}
            size={'30px'}
          />
        </TouchableOpacity>
      </Stack>
      <FlatList
        data={filteredActivityData}
        renderItem={({ item }) => (
          <Box style={styles.rowBox}>
            <HStack justifyContent="space-between">
              <Container style={styles.patientContainer}>
                <Avatar
                  size="60px"
                  source={{
                    uri: item.patientImage,
                  }}
                />
                <Text style={styles.patientName}>{item.patientName}</Text>
              </Container>
              <ScrollView
                horizontal={true}
                width="100%"
                showsHorizontalScrollIndicator={false}
              >
                <HStack>
                  {item.activities.map((activity) => (
                    <ActivityCard
                      activityTitle={activity.activityTitle}
                      activityStartTime={activity.startTime}
                      activityEndTime={activity.endTime}
                    />
                  ))}
                </HStack>
              </ScrollView>
            </HStack>
          </Box>
        )}
        keyExtractor={(item) => item.patientId}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  patientName: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 13,
    color: colors.black_var1,
    width: 90,
  },
  patientContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    margin: 25,
    paddingTop: 10,
    alignItems: 'center',
  },
  rowBox: {
    alignSelf: 'center',
    width: '95%',
    borderBottomWidth: 1,
    borderColor: 'muted.800',
    padding: 4,
    _dark: { borderColor: 'muted.50' },
  },
});

export default DashboardScreen;
