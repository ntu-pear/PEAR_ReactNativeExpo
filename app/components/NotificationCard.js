import React from "react";
import { StyleSheet, Platform, TouchableOpacity } from "react-native";
import colors from "../config/colors";
import typography from "../config/typography";
import { Text, Box, VStack, HStack, Avatar } from "native-base";


function NotificationCard({item, user, setSelectedId}) {
  return (
    <TouchableOpacity onPressIn={() => setSelectedId(item.notificationID)}>
      <Box
        borderBottomWidth="1"
        borderColor={colors.primary_gray}
        py="2"
        mt="1"
      >
        <VStack w="100%" space={2} flexWrap={"wrap"}>
          <HStack space={5} alignItems="center">
            <Avatar size="sm" bg={colors.pink} marginY="auto">
              {" "}
              {user && user.sub && user.sub.substring(0, 1)
                ? user.sub.substring(0, 1)
                : `--`}{" "}
            </Avatar>
            <Text
              color={colors.black_var1}
              fontFamily={
                Platform.OS === "ios" ? "Helvetica" : typography.android
              }
            >
              {item && item.title ? item.title : "Not Available"}
            </Text>
          </HStack>
          <HStack>
            <Text
              alignSelf="flex-start"
              color={colors.black_var1}
              fontFamily={
                Platform.OS === "ios" ? "Helvetica" : typography.android
              }
            >
              {item && item.message ? item.message : "Not Available"}
            </Text>
          </HStack>
          <HStack justifyContent="flex-start">
            <Text
              alignSelf="flex-start"
              color={colors.primary_overlay_color}
              fontFamily={
                Platform.OS === "ios" ? "Helvetica" : typography.android
              }
            >
              {" "}
              {item && item.createdDateTime
                ? `${item.createdDateTime.substring(
                    0,
                    10
                  )}   ${item.createdDateTime.substring(12, 19)} HRS`
                : "Not Available"}{" "}
            </Text>
          </HStack>
        </VStack>
      </Box>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({});
export default NotificationCard;
