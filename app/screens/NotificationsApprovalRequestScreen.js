import React from 'react';
import { View } from 'react-native';
import { Text, Button, Box, VStack } from 'native-base';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TopHeaderWithBackButton from '../components/TopHeaderWithBackButton';

function NotificationsApprovalRequestScreen(props) {
  const { navigation } = props;
  const insets = useSafeAreaInsets();

  return (
    <Box safeAreaTop>
      <TopHeaderWithBackButton navigation={navigation} />
      <Box w="90%" ml="5" mr="5" mt="5">
        <Text>This is NotificationsApprovalRequestScreen</Text>
      </Box>
    </Box>
  );
}

export default NotificationsApprovalRequestScreen;
