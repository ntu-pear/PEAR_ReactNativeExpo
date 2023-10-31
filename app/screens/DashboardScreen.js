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
import globalStyles from 'app/utility/styles.js';
import colors from 'app/config/colors';
// import ActivityCalendarCard from 'app/components/ActivityCalendarCard';
// import ProfileNameButton from 'app/components/ProfileNameButton';
// import routes from 'app/navigation/routes';
import DateInputField from 'app/components/DateInputField';
// import MessageDisplayCard from 'app/components/MessageDisplayCard';

function DashboardScreen({
  selectedDate,
  setSelectedDate,
  filteredActivityData,
  currentTime,
  isLoading,
  handlePullToRefresh,
  noDataMessage,
  // navigation,
}) {
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
    // prevent tab bar covering the schedule list
    <View
      style={globalStyles.mainContentContainer}
      // {...panResponder.panHandlers}
    >
      {/* < Day MM dd YYYY > */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="center"
        margin="2"
      >
        <View style={styles.dateSelectionContainer}>
          {/* < icon button */}
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
          <DateInputField
            handleFormData={setSelectedDate}
            value={selectedDate}
          />
          {/* > icon button */}
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
        </View>
      </Stack>
      <FlatList
        onRefresh={handlePullToRefresh}
        refreshing={isLoading}
        ListEmptyComponent={noDataMessage}
        // eslint-disable-next-line react/no-unstable-nested-components
        // ListEmptyComponent={() => (
        //   <MessageDisplayCard
        //     TextMessage={
        //       noDataMessage ? noDataMessage : 'No schedules found today'
        //     }
        //     topPaddingSize={'42%'}
        //   />
        // )}
        data={filteredActivityData}
        renderItem={({ item }) => (
          <Box style={styles.rowBox}>
            <HStack justifyContent="space-between">
              <Container style={styles.patientContainer}>
                <Avatar
                  size={'60px'}
                  source={{
                    uri: item.patientImage,
                  }}
                />
                <Text style={styles.patientName}>{item.patientName}</Text>
                {/* <ProfileNameButton
                  navigation={navigation}
                  route={routes.PATIENT_PROFILE}
                  profile={item}
                  isPatient={true}
                  size={65}
                /> */}
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
}

const styles = StyleSheet.create({
  dateSelectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
  },
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
