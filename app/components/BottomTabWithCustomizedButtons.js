import React from 'react';
import { Platform } from 'react-native';
import { Button, Center, HStack, Divider } from 'native-base';
import colors from '../config/colors';
import typography from '../config/typography';

function BottomTabWithCustomizedButtons({ leftButtonText, rightButtonText }) {
  const onLeftButtonClick = () => {
    console.log('left clicked');
  };

  const onRightButtonClick = () => {
    console.log('right clicked');
  };
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
      <HStack
        w="100%"
        space="0"
        alignItems="center"
        justifyContent="space-around"
      >
        {leftButtonText ? (
          <Button
            onPress={onLeftButtonClick}
            w="25%"
            size="md"
            bg={colors.green}
            _text={{
              color: `${colors.white_var1}`,
              fontFamily:
                Platform.OS === 'ios' ? 'Helvetica' : typography.android,
              fontSize: 'sm',
            }}
          >
            {leftButtonText ? leftButtonText : null}
          </Button>
        ) : null}
        {rightButtonText ? (
          <Button
            onPress={onRightButtonClick}
            w="25%"
            size="md"
            bg={colors.pink}
            _text={{
              color: `${colors.white_var1}`,
              fontFamily:
                Platform.OS === 'ios' ? 'Helvetica' : typography.android,
              fontSize: 'sm',
            }}
          >
            {rightButtonText ? rightButtonText : null}
          </Button>
        ) : null}
      </HStack>
    </Center>
  );
}

export default BottomTabWithCustomizedButtons;
