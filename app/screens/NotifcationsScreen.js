import React, { useState, useEffect, useContext } from "react";
import { StyleSheet } from "react-native";
import AuthContext from "../auth/context";
import { Text, Box, FlatList, VStack, HStack, Avatar } from "native-base";
import colors from "../config/colors";

function NotifcationsScreen(props) {
  const { user } = useContext(AuthContext);
  // TODO: Create API to retrieve data to puplate flat list
  // (1) Retrieves Data
  // (2) try out setParams() to filter `read` / `unread` / `accepted` / `rejected`
  useEffect(() => {
    console.log(user);
  }, []);

  /*
   * Mock Data to populate flat list
   */
  const [notificationData, setNotificationData] = useState([
    {
      notificationID: 446,
      title: "Approval request (Delete LikeDislike)",
      createdDateTime: "2022-05-08T20:16:29.8150851",
      logID: 3535,
      approvalRequestID: 437,
      receiverUserID: "B22698B8-42A2-4115-9631-1C2D1E2AC5F4",
      message:
        "Caregiver Adeline Tan has requested to delete a LikeDislike item for Patient Alice Lee.",
      readStatus: false,
    },
    {
      notificationID: 445,
      title: "Approval request (Update LikeDislike)",
      createdDateTime: "2022-05-08T20:16:10.9527239",
      logID: 3534,
      approvalRequestID: 436,
      receiverUserID: "B22698B8-42A2-4115-9631-1C2D1E2AC5F4",
      message:
        "Caregiver Adeline Tan has requested to update a LikeDislike item.",
      readStatus: false,
    },
    {
      notificationID: 444,
      title: "Approval request (Add LikeDislike)",
      createdDateTime: "2022-05-08T20:15:50.3813064",
      logID: 3533,
      approvalRequestID: 435,
      receiverUserID: "B22698B8-42A2-4115-9631-1C2D1E2AC5F4",
      message:
        "Caregiver Adeline Tan has requested to add a LikeDislike item for Patient Alice Lee.",
      readStatus: false,
    },
  ]);

  // TODO: Create a handleSwipe 'accept' or 'reject' method
  // Peform (1) re-set current list with the updated data
  // (2) Calls a `put` api to set as `accepted` and `read`

  return (
    <VStack w="100%" h="100%" alignItems="center">
      <VStack w="90%">
        <FlatList
          data={notificationData}
          renderItem={({ item }) => (
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
                  <Text>
                    {item && item.title ? item.title : "Not Available"}
                  </Text>
                </HStack>
                <HStack>
                  <Text alignSelf="flex-start">
                    {item && item.message ? item.message : "Not Available"}
                  </Text>
                </HStack>
                <HStack justifyContent="flex-end">
                  <Text alignSelf="flex-start">
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
          )}
          keyExtractor={(item) => item.notificationID}
        />
      </VStack>
    </VStack>
  );
}

const styles = StyleSheet.create({});

export default NotifcationsScreen;
