// Lib
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import { VStack, HStack, IconButton } from 'native-base';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Hooks
import formatDateTime from 'app/hooks/useFormatDateTime.js';

//Configuration
import typography from 'app/config/typography';
import colors from 'app/config/colors';

function InformationCard({ displayData, title, subtitle, handleOnPress=null, unMaskedNRIC=null }) {
  const [itemizedData, setItemizedData] = useState(displayData);
  const [masked, setMasked] = useState(true);

  // Handling of unmasking of NRIC
  const handleUnmaskNRIC = () => {
    if (masked) {
      const newData = itemizedData.map(item => {
        if (item.label === 'NRIC') {
          return { ...item, value: unMaskedNRIC };
        }
        return item;
      });
  
      setItemizedData(newData);
      setMasked(false);
    } else {
      const newData = itemizedData.map(item => {
        if (item.label === 'NRIC') {
          return { ...item, value: unMaskedNRIC.replace(/\d{4}(\d{3})/, 'xxxx$1') };
        }
        return item;
      });

      setItemizedData(newData);
      setMasked(true);
    }
  };

  useEffect(() =>{
    if (itemizedData.length === 0){
      setItemizedData(displayData);
    }
  }, [itemizedData, displayData]);

  return (
    <View style={styles.cardContainer}>
      <VStack>
        <HStack style={styles.buttonContainer}>
          {title ? (
            <Text style={[styles.TextContent, styles.titleText]}>{title}</Text>
          ) : null}
          {(handleOnPress !== null && title !== null && title !== "Guardian(s) Information") ? ( // editing button will appear if the title is not null
            <IconButton                                                                          // or "Guardian(s) Information"
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
          {subtitle ? (
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
        {itemizedData.length !== 0 ? 
          itemizedData.map((data, index) => (
          <View style={styles.fieldContainer} key={index}>
            <Text style={[styles.TextContent, styles.fieldLabel]}>
              {data === undefined ? 'undefined' : `${data.label}:  `}
            </Text>
            <Text style={[styles.TextContent, styles.fieldValue]} key={index+"text"}>
              {data === undefined ? 'undefined' :                             // formatting of data
                data.value === 'Not available' ? 'Not available' :
                data.value === 1 ? 'Yes' :
                data.value === true ? 'Yes' :
                data.value === 0 ? 'No' :
                data.value === null ? 'Not available' :
                data.value === 'null' ? 'Not available' :
                data.label === 'DOB' ? `${formatDateTime(data.value, true)}` : 
                data.label === 'Start Date' ? `${formatDateTime(data.value, true)}` : 
                data.label === 'End Date' ? `${formatDateTime(data.value, true)}` : 
                data.label === 'Date' ? `${formatDateTime(data.value, true)}` : 
                `${data.value}`}
            </Text>
            {(data.label !== null && data.label === 'NRIC' && masked === true) ? (
              <IconButton
                _icon={{
                  as: MaterialCommunityIcons,
                  name: 'eye-outline',
                }}
                padding={0}
                onPress={() => handleUnmaskNRIC()}
              />
            ) : (data.label !== null && data.label === 'NRIC' && masked === false) ? (
              <IconButton
                _icon={{
                  as: MaterialCommunityIcons,
                  name: 'eye',
                }}
                padding={0}
                onPress={() => handleUnmaskNRIC()}
              />
            ) : null}
          </View>
        )) :
          <View style={styles.fieldContainer}>
            <Text style={[styles.TextContent, styles.fieldLabel]}>
              Not available
            </Text>
          </View>
        }
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
    w: "100%",
  },
});

export default InformationCard;
