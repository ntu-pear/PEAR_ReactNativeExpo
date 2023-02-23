import React from 'react';
import colors from 'app/config/colors';
import { StyleSheet, Text } from 'react-native';
import { Container } from 'native-base';

const ActivityCard = ({
  activityTitle,
  activityStartTime,
  activityEndTime,
}) => {
  return (
    <Container style={styles.activityContainer}>
      <Text style={styles.activityName}>{activityTitle}</Text>
      <Text style={styles.activityTime}>
        {activityStartTime} - {activityEndTime}
      </Text>
    </Container>
  );
};

const styles = StyleSheet.create({
  activityContainer: {
    width: 90,
    height: 85,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.pink,
    marginRight: 2,
    marginLeft: 2,
    paddingLeft: 1,
    paddingRight: 1,
  },
  activityName: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 5,
    fontSize: 18,
    color: colors.white_var1,
  },
  activityTime: {
    textAlign: 'center',
    fontWeight: 'normal',
    color: colors.white_var1,
  },
});

export default ActivityCard;
