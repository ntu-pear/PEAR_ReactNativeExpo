// Lib
import React from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import { VStack, HStack, IconButton } from 'native-base';
import { MaterialCommunityIcons } from '@expo/vector-icons';

//Configuration
import typography from 'app/config/typography';
import colors from 'app/config/colors';

// Import Constants from Routes
import routes from 'app/navigation/routes';

function InformationCard(props) {
  const { displayData, title, subtitle, navigation } = props;

  const formatDate = (str) => {
    let splitDate = str.split('-');
    // splitDate[0] = splitDate[0].split('').reverse().join('');

    return `${splitDate[2]}-${splitDate[1]}-${splitDate[0]}`;
  };

  const handleOnPress = () => {
    title === 'Patient Information' ? (
      navigation.push(routes.EDIT_PATIENT_INFO, { 
        displayData: displayData,
      })
    ) : title === 'Patient Preferences' ? (
      navigation.push(routes.EDIT_PATIENT_PREFERENCES, { 
        displayData: displayData,
      })
    ) : title === 'Guardian(s) Information' ? (
      navigation.push(routes.EDIT_PATIENT_GUARDIAN, { 
        displayData: displayData,
      })
    ) : title === 'Social History' ? (
      navigation.push(routes.EDIT_PATIENT_SOCIALHIST, { 
        displayData: displayData,
      })
    ) : (
      null
    )
  };

  return (
    <View style={styles.cardContainer}>
      <VStack>
        <HStack style={styles.buttonContainer}>
          {title ? (
            <Text style={[styles.TextContent, styles.titleText]}>{title}</Text>
          ) : null}
          {(subtitle === null && title !== "Doctor's Notes") ? (
            <IconButton
              _icon={{
                as: MaterialCommunityIcons,
                name: 'pencil',
              }}
              size="lg"
              onPress={handleOnPress}
            />
          ) : null}
        </HStack>
        <HStack style={styles.buttonContainer}>
          {subtitle ? (
            <Text style={[styles.TextContent, styles.subtitleText]}>
              {subtitle}
            </Text>
          ) : null}
          {title ===  "Guardian(s) Information" ? (
            <IconButton
              _icon={{
                as: MaterialCommunityIcons,
                name: 'pencil',
              }}
              size="lg"
              onPress={handleOnPress}
            />
          ) : null}
        </HStack>
        {displayData.map((data, index) => (
          <View style={styles.fieldContainer} key={index}>
            <Text style={[styles.TextContent, styles.fieldLabel]}>
              {data === undefined ? 'undefined' : `${data.label}:  `}
            </Text>
            <Text style={[styles.TextContent, styles.fieldValue]}>
              {data === undefined ? 'undefined' : data.label === 'DOB' ? `${formatDate(data.value.substring(0, 10))}` : `${data.value}`}
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
    marginTop: 10,
    marginBottom: 10,
    marginRight: 10,
  },
  titleText: {
    fontSize: 25,
    fontWeight: 'bold',
    color: colors.black_var1,
    marginRight: 0,
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
    maxWidth: '58%',
  },
  fieldContainer: {
    flexDirection: 'row',
  },
  buttonContainer:{
    w:"100%",
  }
});

export default InformationCard;
