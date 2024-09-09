import React, { useState } from 'react';
import { Box, Icon, Text, HStack, VStack } from 'native-base';
import colors from 'app/config/colors';
import { Platform, Alert, TouchableOpacity, StyleSheet, View } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useGetWeekDates } from 'app/hooks/useGetWeekDate';

// API
import scheduleAPI from 'app/api/schedule';
import routes from 'app/navigation/routes';

function ConfigCard(props) {
  const { vectorIconComponent, text, checkWeek } = props;
  const { thisWeek, nextWeek, weekAfterNext } = useGetWeekDates();
  const navigation = useNavigation();
  const [isScheduleAvail, setIsScheduleAvail] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      checkSchedule();
    }, [])
  );

  const checkSchedule = async () => {
    const response = await scheduleAPI.getPatientWeeklySchedule();

    if (response.data.data === null) {
      setIsScheduleAvail(false);
    } else {
      setIsScheduleAvail(true);
    }
  };

  const handleOnPress = async () => {
    if (isScheduleAvail) {
      const alertTitle = 'Schedule already exists, continue to generate?';

      // Prompt the user to confirm if they want to continue
      Alert.alert(alertTitle, '', [
        {
          text: 'No', // Do nothing if the user chooses "No"
          style: 'cancel',
          onPress: () => {
            console.log('User chose not to continue');
          },
        },
        {
          text: 'Yes', // Proceed with the code if the user chooses "Yes"
          onPress: async () => {
            await continueGeneratingSchedule(); // Call the continuation function
          },
        },
      ]);
    } else {
      await continueGeneratingSchedule(); // Directly continue if no schedule is available
    }
  };

  // Function to handle the continuation of the code
  const continueGeneratingSchedule = async () => {
    setIsScheduleAvail(true); // To see it as available after first instance
    let result = null;

    switch (checkWeek) {
      case thisWeek:
        result = await scheduleAPI.generateThisWeek();
        break;

      case nextWeek:
        // result =
        break;

      case weekAfterNext:
        // result =
        break;

      default:
        break;
    }

    if (result && result.ok) {
      console.log('Schedule for this week generated');
      const alertTitle = 'Schedule for this week generated' + '\n(' + checkWeek + ')';

      Alert.alert(alertTitle, '', [
        {
          text: 'OK',
          onPress: () => {
            Alert.alert('Do you want to view the schedule?\n(redirected to dashboard)', '', [
              {
                text: 'No',
                style: 'cancel',
              },
              {
                text: 'Yes',
                onPress: () => navigation.navigate(routes.DASHBOARD_SCREEN),
              },
            ]);
          },
        },
      ]);
    } else {
      console.log('Error');
      const alertTitle = 'Something went wrong';
      Alert.alert(alertTitle);
    }
  };

  return (
    <TouchableOpacity onPress={handleOnPress}>
      <VStack style={styles.VStackOuter}>
        <Box style={styles.CardBoxContainer}>
          <VStack style={styles.VStackInner}>
            <HStack style={styles.HStackWrapper}>
              <Icon
                as={{ ...vectorIconComponent }}
                top="3"
                left="2"
                color={colors.black_var1}
                size="50"
              />
              <Text style={styles.TextContent}>{text}</Text>
            </HStack>
          </VStack>
        </Box>
      </VStack>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  CardBoxContainer: {
    borderRadius: 10,
    borderWidth: Platform.OS === 'web' ? null : 1,
    borderColor: colors.primary_gray,
    minWidth: '100%',
    minHeight: Platform.OS === 'web' ? null : 20,
  },
  VStackOuter: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 5,
  },
  VStackInner: {
    width: '100%',
    space: 4,
    flexWrap: 'wrap',
    marginBottom: 25,
  },
  TextContent: {
    alignSelf: 'flex-start',
    fontSize: 19,
    marginTop: Platform.OS === 'web' ? 2 : 28,
    marginLeft: 19,
    color: colors.black_var1,
  },
  HStackWrapper: {
    space: 5,
    alignItems: 'center',
  },
});

export default ConfigCard;
