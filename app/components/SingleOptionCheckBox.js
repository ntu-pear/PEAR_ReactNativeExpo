import React from 'react';
import { Platform, StyleSheet, View, Text } from 'react-native';
import { HStack } from 'native-base';
import typography from 'app/config/typography';
import colors from 'app/config/colors';
import Checkbox from 'expo-checkbox';

function SingleOptionCheckBox({ title, value, onChangeData }) {
  return (
    <View style={styles.ComponentContainer}>
      <HStack justifyContent="space-between" alignItems="center">
        <Text style={styles.TitleMsg}>{title}</Text>
        <Checkbox
          disabled={false}
          value={value}
          onValueChange={(newValue) => onChangeData(newValue)}
        />
      </HStack>
    </View>
  );
}

const styles = StyleSheet.create({
  ComponentContainer: {
    display: 'flex',
    width: '80%',
    marginTop: 5,
    justifyContent: 'flex-start',
  },
  TitleMsg: {
    fontSize: 13.5,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 10,
    color: colors.light_gray2,
    fontFamily: Platform.OS === 'ios' ? typography.ios : typography.android,
  },
});

export default SingleOptionCheckBox;
