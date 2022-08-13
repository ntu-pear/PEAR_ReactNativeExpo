import React from 'react';
import { Text, Box, VStack, ScrollView } from 'native-base';
import TopHeaderWithBackButton from '../components/TopHeaderWithBackButton';
import BottomTabWithCustomizedButtons from '../components/BottomTabWithCustomizedButtons';

function NotificationsApprovalRequestScreen(props) {
  const { navigation } = props;

  return (
    <Box h="100%" w="100%" safeAreaTop>
      <TopHeaderWithBackButton navigation={navigation} />
      <Box w="90%" ml="5" mr="5" mt="5">
        <VStack>
          <ScrollView>
            <Text>This is NotificationsApprovalRequestScreen</Text>
          </ScrollView>
        </VStack>
      </Box>

      <BottomTabWithCustomizedButtons />
    </Box>
  );
}

export default NotificationsApprovalRequestScreen;
