import React from 'react';
import { Box, Popover } from 'native-base';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
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
              width={330}
              height={330}
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
    fontSize: 22,
    color: colors.black_var1,
  },
  calendarPickerText: {
    fontSize: 15,
  },
});
export default ActivityCalendarCard;
