import React from 'react';
import { Platform, StyleSheet, View, Text } from 'react-native';
import { HStack, Checkbox } from 'native-base';
import typography from 'app/config/typography';
import colors from 'app/config/colors';

function SingleOptionCheckBox({
  title,
  value,
  onChangeData,
  accessibilityText,
}) {
  return (
    <View style={styles.ComponentContainer}>
      <HStack justifyContent="space-between" alignItems="center">
        <Text style={styles.TitleMsg}>{title}</Text>
        <Checkbox
          isChecked={value}
          value={value}
          onChange={onChangeData}
          //   aria-label=" Do you wish to key in the Date of Leaving?"
          accessibilityLabel={accessibilityText}
          _checked={{ bgColor: colors.green }}
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
