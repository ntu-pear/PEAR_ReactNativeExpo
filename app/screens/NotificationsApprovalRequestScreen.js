import React from 'react';
import { View } from 'react-native';
import { Text, Button, Box } from 'native-base';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function NotificationsApprovalRequestScreen(props) {
  const { navigation } = props;
  const insets = useSafeAreaInsets();

  return (
    <Box safeAreaTop="20">
      <Text>This is NotificationsApprovalRequestScreen</Text>
      <Button onPress={() => navigation.goBack()}> Go Back </Button>
    </Box>
  );
}

export default NotificationsApprovalRequestScreen;
