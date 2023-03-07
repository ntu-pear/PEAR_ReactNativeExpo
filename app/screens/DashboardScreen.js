import React from 'react';
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

const DashboardScreen = ({
  selectedDate,
  setSelectedDate,
  filteredActivityData,
  currentTime,
}) => {
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
            alt={'previous date'}
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
            alt={'next-date'}
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
                  {item.activities.map((activity, i) => (
                    <ActivityCard
                      key={i}
                      activityTitle={activity.activityTitle}
                      activityStartTime={activity.startTime}
                      activityEndTime={activity.endTime}
                      currentTime={currentTime}
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
};

const styles = StyleSheet.create({
  patientName: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 12,
    color: colors.black_var1,
    width: 90,
  },
  patientContainer: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    margin: 25,
    paddingTop: 6,
    alignItems: 'center',
  },
  rowBox: {
    alignSelf: 'center',
    width: '95%',
    borderBottomWidth: 1,
    borderColor: 'muted.800',
    padding: 4,
  },
});

export default DashboardScreen;
