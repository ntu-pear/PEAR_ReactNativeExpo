import React, { useState, useEffect, useContext } from "react";
import { StyleSheet, Platform, TouchableOpacity } from "react-native";
import AuthContext from "../auth/context";
import { Text, Box, FlatList, VStack, HStack, Avatar } from "native-base";
import colors from "../config/colors";
import typography from "../config/typography";
import Swipeable from "react-native-gesture-handler/Swipeable";

function NotifcationsScreen(props) {
  const { user } = useContext(AuthContext);
  // used to manage flatlist
  const [selectedId, setSelectedId] = useState(null);
  // TODO: Create API to retrieve data to puplate flat list
  // (1) Retrieves Data
  // (2) try out setParams() to filter `read` / `unread` / `accepted` / `rejected`
  useEffect(() => {
    // console.log(user);
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

  // const onViewableItemsChanged = ({viewableItems, changed })=> {console.log(viewableItems);
  //   console.log(changed);}

  // TODO: Create a handleSwipe 'accept' or 'reject' method
  // Peform (1) re-set current list with the updated data
  // (2) Calls a `put` api to set as `accepted` and `read`
  /*
   * Reference: (1) https://docs.swmansion.com/react-native-gesture-handler/docs/quickstart/quickstart
   * (2) https://blog.logrocket.com/react-native-gesture-handler-swipe-long-press-and-more/
   */

  const leftSwipeActions = () => {
    return (
      <VStack w="20" backgroundColor={colors.pink} justifyContent="center">
        <Text> Hello</Text>
      </VStack>
    );
  };

  const rightSwipeActions = () => {
    return (
      <Box>
        <Text>hey</Text>
      </Box>
    );
  };

  const swipeFromLeftOpen = (index) => {
    console.log("swipe from left");
    console.log(selectedId);
    // console.log(selectedId);
  };
  const swipeFromRightOpen = () => {
    console.log("swipe from right");
  };

  return (
    <VStack w="100%" h="100%" alignItems="center">
      <VStack w="90%">
        <FlatList
          // onViewableItemsChanged={onViewableItemsChanged}
          data={notificationData}
          extraData={selectedId}
          renderItem={({ item, index}) => (
            <Swipeable
              renderLeftActions={leftSwipeActions}
              renderRightActions={rightSwipeActions}
              onSwipeableLeftWillOpen={swipeFromLeftOpen}
              onSwipeableRightWillOpen={swipeFromRightOpen}
            >
              {}
              <TouchableOpacity onPressIn={() => setSelectedId(index)}>
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
                          Platform.OS === "ios"
                            ? "Helvetica"
                            : typography.android
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
                          Platform.OS === "ios"
                            ? "Helvetica"
                            : typography.android
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
                          Platform.OS === "ios"
                            ? "Helvetica"
                            : typography.android
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
            </Swipeable>
          )}
          keyExtractor={(item) => item.notificationID}
        />
      </VStack>
    </VStack>
  );
}

const styles = StyleSheet.create({});

export default NotifcationsScreen;
