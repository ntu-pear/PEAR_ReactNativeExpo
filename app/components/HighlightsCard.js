import React from 'react';
import { StyleSheet, Platform, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { Text, Box, VStack, HStack, Avatar } from 'native-base';
import colors from 'app/config/colors';
import typography from 'app/config/typography';

function HighlightsCard({ item }) {
  const getDescription = (element) => {
    let desc;
    // TODO: Highlight description is the value in highlightJson which is not captured in BE yet
    // let highlightJsonValue = element.highlightJson.value
    // return highlightJsonValue;

    switch (element.highlightTypeID) {
      case 1:
        desc = 'New Prescription';
        break;
      case 2:
        desc = 'New Allergy';
        break;
      case 3:
        desc = 'New Activity Exclusion';
        break;
      case 4:
        desc = 'Abnormal Vital';
        break;
      case 5:
        desc = 'Problem';
        break;
      case 6:
        desc = 'New Medical Record';
        break;
    }

    return desc;
  };

  const getIcon = (element) => {
    let icon;

    switch (element.highlightTypeID) {
      case 1:
        icon = (
          <FontAwesome5 name="pills" size={16} color={colors.black_var1} />
        );
        break;
      case 2:
        icon = (
          <MaterialCommunityIcons
            name="bacteria"
            size={18}
            color={colors.black_var1}
          />
        );
        break;
      case 3:
        icon = <FontAwesome5 name="ban" size={18} color={colors.black_var1} />;
        break;
      case 4:
        icon = (
          <MaterialCommunityIcons
            name="heart-pulse"
            size={18}
            color={colors.black_var1}
          />
        );
        break;
      case 5:
        icon = (
          <FontAwesome5
            name="exclamation-triangle"
            size={18}
            color={colors.black_var1}
          />
        );
        break;
      case 6:
        icon = (
          <MaterialCommunityIcons
            name="clipboard-text"
            size={18}
            color={colors.black_var1}
          />
        );
        break;
    }

    return icon;
  };

  const list = () => {
    return item.highlights.map((element) => {
      return (
        <View
          key={element.highlightID}
          style={{ borderBottomWidth: 1, borderBottomColor: colors.gray }}
        >
          <HStack w="100%" space={2} alignItems="center">
            {getIcon(element)}
            <Text fontSize="13">{getDescription(element)}</Text>
          </HStack>
        </View>
      );
    });
  };

  return (
    <TouchableOpacity>
      <Box
        w="100%"
        borderWidth="1"
        borderColor={colors.primary_gray}
        rounded="lg"
        p="2"
        mt="3"
      >
        <HStack w="100%" space={3} flexWrap="wrap" mb="1">
          <VStack w="28%" space={1} alignItems="center">
            <Avatar
              size="lg"
              bg={colors.pink}
              marginY="auto"
              source={{
                uri: `${item.profilePicture}`,
              }}
            >
              {' '}
              {item && item.patientName && item.patientName.substring(0, 1)
                ? item.patientName.substring(0, 1)
                : '--'}{' '}
            </Avatar>

            <Text
              bold
              color={colors.black_var1}
              fontFamily={
                Platform.OS === 'ios' ? 'Helvetica' : typography.android
              }
            >
              {item.patientName}
            </Text>
          </VStack>
          <VStack w="68%" space={2}>
            {list()}
          </VStack>
        </HStack>
      </Box>
    </TouchableOpacity>
  );
}

// const styles = StyleSheet.create({
// });

export default HighlightsCard;