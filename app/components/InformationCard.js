// Lib
import React from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import { VStack } from 'native-base';

//Configuration
import typography from 'app/config/typography';
import colors from 'app/config/colors';

function InformationCard({ displayData, title, subtitle }) {
  return (
    <View style={styles.cardContainer}>
      <VStack>
        {title ? (
          <Text style={[styles.TextContent, styles.titleText]}>{title}</Text>
        ) : null}
        {subtitle ? (
          <Text style={[styles.TextContent, styles.subtitleText]}>
            {subtitle}
          </Text>
        ) : null}
        {displayData.map((data, index) => (
          <View style={styles.fieldContainer} key={index}>
            <Text style={[styles.TextContent, styles.fieldLabel]}>
              {data === undefined ? 'undefined' : `${data.label}:  `}
            </Text>
            <Text style={[styles.TextContent, styles.fieldValue]}>
              {data === undefined ? 'undefined' : `${data.value}`}
            </Text>
          </View>
        ))}
      </VStack>
    </View>
  );
}

InformationCard.defaultProps = {
  title: null,
  subtitle: null,
};

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
  },
  TextContent: {
    fontFamily: Platform.OS === 'ios' ? typography.ios : typography.android,
    margin: 10,
  },
  titleText: {
    fontSize: 25,
    fontWeight: 'bold',
    color: colors.black_var1,
  },
  subtitleText: {
    fontSize: 22,
    color: colors.black_var1,
  },
  fieldLabel: {
    fontSize: 18,
    color: colors.light_gray2,
  },
  fieldValue: {
    fontSize: 18,
  },
  fieldContainer: {
    flexDirection: 'row',
  },
});

export default InformationCard;
