import React from 'react';
import { Button, Center, HStack, Divider } from 'native-base';
import colors from '../config/colors';

function BottomTabWithCustomizedButtons() {
  return (
    <Center
      bg={colors.white_var1}
      position="absolute"
      bottom="0"
      height="8%"
      w="100%"
      safeAreaBottom
    >
      <Divider mb="4" />
      <HStack space="5" alignItems="flex-start">
        <Button
          size="md"
          _text={{
            color: `${colors.white_var1}`,
          }}
        >
          Accept
        </Button>
        <Button size="md">Reject</Button>
      </HStack>
    </Center>
  );
}

export default BottomTabWithCustomizedButtons;
