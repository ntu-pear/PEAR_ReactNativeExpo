import React from 'react';
import { Platform, TouchableOpacity } from 'react-native';
import { Text, Box, VStack, HStack, Avatar } from 'native-base';
import colors from '../config/colors';
import typography from '../config/typography';

function NotificationCard(
  { item, user, setSelectedId, setRequiresAction, readStatus, navigation },
  props,
) {
  /*
   * 1. Removes `\n` char w regex 3. trim empty spaces
   */
  const handleString = (message) => {
    return message.replace(/\n/g, '').trim();
  };

  // setRequiresAction and setSelectedID required to handle flatlist
  // in notificationScreen.
  const handlePressIn = () => {
    console.log('testing navigation');
    console.log(props);
    setSelectedId(item.notificationID);
    item && item.requiresAction
      ? setRequiresAction(item.requiresAction)
      : setRequiresAction(false);
  };

  return (
    // if readStatus is false, proceed to set the 1. ID and 2. requiredAction
    <TouchableOpacity onPressIn={readStatus ? null : handlePressIn}>
      <Box
        borderBottomWidth="1"
        borderColor={colors.primary_gray}
        py="2"
        mt="1"
      >
        <VStack w="100%" space={4} flexWrap="wrap" mb="1">
          <HStack space={5} alignItems="center">
            <Avatar size="sm" bg={colors.pink} marginY="auto">
              {' '}
              {user && user.sub && user.sub.substring(0, 1)
                ? user.sub.substring(0, 1)
                : '--'}{' '}
            </Avatar>
            <Text
              bold
              color={colors.black_var1}
              fontFamily={
                Platform.OS === 'ios' ? 'Helvetica' : typography.android
              }
            >
              {item && item.requiresAction ? 'Action Required' : ''}
            </Text>
          </HStack>
          <HStack>
            <Text
              alignSelf="flex-start"
              color={colors.black_var1}
              fontFamily={
                Platform.OS === 'ios' ? 'Helvetica' : typography.android
              }
            >
              {item && item.shortMessage
                ? handleString(item.shortMessage)
                : 'Not Available'}
            </Text>
          </HStack>
          {/* <HStack justifyContent="flex-start">
            <Text
              alignSelf="flex-start"
              color={colors.primary_overlay_color}
              fontFamily={
                Platform.OS === 'ios' ? 'Helvetica' : typography.android
              }
            >
              {' '}
              {item && item.createdDateTime
                ? `${item.createdDateTime.substring(
                    0,
                    10,
                  )}   ${item.createdDateTime.substring(12, 19)} HRS`
                : 'Not Available'}{' '}
            </Text>
          </HStack> */}
        </VStack>
      </Box>
    </TouchableOpacity>
  );
}

export default NotificationCard;
