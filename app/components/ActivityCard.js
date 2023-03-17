import React from 'react';
import colors from 'app/config/colors';
import { StyleSheet, Text } from 'react-native';
import { Container } from 'native-base';

const ActivityCard = ({
  activityTitle,
  activityStartTime,
  activityEndTime,
  currentTime,
}) => {
  const isCurrentDate = () => {
    const startTime = new Date(activityStartTime);
    return (
      startTime.getFullYear() === currentTime.getFullYear() &&
      startTime.getMonth() === currentTime.getMonth() &&
      startTime.getDate() === currentTime.getDate()
    );
  };
  const isCurrentActivity = () => {
    const startTime = new Date(activityStartTime);
    const endTime = new Date(activityEndTime);
    if (
      currentTime.getHours() > endTime.getHours() ||
      currentTime.getHours() < startTime.getHours()
    ) {
      return false;
    }
    return !(
      (currentTime.getHours() === endTime.getHours() &&
        currentTime.getMinutes() > endTime.getMinutes()) ||
      (currentTime.getHours() === startTime.getHours() &&
        currentTime.getMinutes() < startTime.getMinutes())
    );
  };

  return (
    <Container
      style={
        isCurrentDate() && isCurrentActivity()
          ? styles.activityContainerPink
          : styles.activityContainerGray
      }
    >
      <Text style={styles.activityName}>{activityTitle}</Text>
      <Text style={styles.activityTime}>
        {new Date(activityStartTime).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}{' '}
        -{' '}
        {new Date(activityEndTime).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
    </Container>
  );
};

const styles = StyleSheet.create({
  activityContainerPink: {
    width: 120,
    height: 90,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.pink,
    marginRight: 5,
    marginLeft: 5,
    paddingLeft: 3,
    paddingRight: 3,
  },
  activityContainerGray: {
    width: 120,
    height: 90,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray,
    marginRight: 5,
    marginLeft: 5,
    paddingLeft: 3,
    paddingRight: 3,
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
    paddingLeft: 5,
    paddingRight: 5,
  },
});

export default ActivityCard;
