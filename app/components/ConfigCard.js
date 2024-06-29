import React from 'react';
import { Box, Icon, Text, HStack, VStack } from 'native-base';
import colors from 'app/config/colors';
import { Platform, Alert, ActivityIndicator, TouchableOpacity, StyleSheet, View } from 'react-native';
// import { background } from 'native-base/lib/typescript/theme/styled-system';

import { useGetWeekDates } from 'app/hooks/useGetWeekDate';

// API
import scheduleAPI from 'app/api/schedule';

function ConfigCard(props) {
  const { vectorIconComponent, text, checkWeek} = props;
  const { thisWeek, nextWeek, weekAfterNext } = useGetWeekDates();

  const handleOnPress = async() => {
    let alertTitle = '';

    switch (checkWeek) {
      case thisWeek:
          const result = await scheduleAPI.generateThisWeek();          
          break;

      case nextWeek:
          break;

      case weekAfterNext:
          break;

      default:
          break;      
      }

      if (result.ok){
        console.log('Schedule for this week generated');
        alertTitle = 'Schedule for this week generated' + '\n('+ checkWeek + ')';
      }
      else{
        console.log('Error')
        alertTitle = 'Something went wrong';
      }
      Alert.alert(alertTitle);
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
