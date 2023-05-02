import React from 'react';
import { Box, Popover } from 'native-base';
import { StyleSheet, Text, TouchableOpacity, Platform } from 'react-native';
import CalendarPicker from 'react-native-calendar-picker';
import colors from 'app/config/colors';

const ActivityCalendarCard = ({ selectedDate, setSelectedDate }) => {
  const initialFocusRef = React.useRef(null);

  return (
    <Box alignItems="center">
      <Popover
        initialFocusRef={initialFocusRef}
        trigger={(triggerProps) => {
          return (
            <TouchableOpacity {...triggerProps}>
              <Text style={styles.dayDateYear}>
                {selectedDate.toDateString()}
              </Text>
            </TouchableOpacity>
          );
        }}
      >
        <Popover.Content width="100%" alignSelf="center">
          <Popover.Arrow />
          <Popover.Body padding="2" alignSelf="center">
            <CalendarPicker
              textStyle={styles.calendarPickerText}
              todayBackgroundColor="#FFFFFF"
              selectedDayColor={colors.pink}
              width={Platform.OS === 'web' ? 400 : 330}
              height={Platform.OS === 'web' ? 400 : 330}
              onDateChange={(date) => setSelectedDate(new Date(date))}
            />
          </Popover.Body>
        </Popover.Content>
      </Popover>
    </Box>
  );
};

const styles = StyleSheet.create({
  dayDateYear: {
    textAlign: 'center',
    fontSize: Platform.OS === 'web' ? 26 : 22,
    color: colors.black_var1,
  },
  calendarPickerText: {
    fontSize: Platform.OS === 'web' ? 22 : 15,
  },
});
export default ActivityCalendarCard;
