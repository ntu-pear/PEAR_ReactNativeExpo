import React from 'react';
import {
  Text,
  Button,
  Box,
  VStack,
  Center,
  HStack,
  Divider,
  ScrollView,
} from 'native-base';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TopHeaderWithBackButton from '../components/TopHeaderWithBackButton';
import colors from '../config/colors';

function NotificationsApprovalRequestScreen(props) {
  const { navigation } = props;
  const insets = useSafeAreaInsets();

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

      <Center
        bg={colors.white_var1}
        position="absolute"
        bottom="0"
        height="8%"
        w="100%"
        safeAreaBottom
      >
        <Divider mb="4" />
        <HStack>
          <Text> HHHA</Text>
        </HStack>
      </Center>
    </Box>
  );
}

export default NotificationsApprovalRequestScreen;
