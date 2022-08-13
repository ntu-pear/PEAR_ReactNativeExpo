import React from 'react';
import { Platform } from 'react-native';
import { IconButton, Box, HStack, Text, Center, Divider } from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../config/colors';
import typography from '../config/typography';

function TopHeaderWithBackButton({ navigation, title }) {
  return (
    <Box mb="2" ml="5" mr="5" w="90%" h="8">
      <HStack justifyContent="space-between">
        <IconButton
          borderRadius="full"
          onPress={() => navigation.goBack()}
          right="2"
          _icon={{
            as: MaterialIcons,
            color: `${colors.black_var1}`,
            name: 'arrow-back-ios',
            pl: '1',
            size: 'lg',
          }}
          _pressed={{
            bg: `${colors.white_var1}`,
          }}
        />
        <Center w="30%">
          <Text
            color={colors.black}
            fontFamily={
              Platform.OS === 'ios' ? 'Helvetica' : typography.android
            }
            fontSize="lg"
            fontWeight="semibold"
          >
            {title ? title : ''}
          </Text>
        </Center>
        <Center w="20%">
          {/* Note: This is a placeholder, feel free to replace
          this with other icons*/}
          <Text />
        </Center>
      </HStack>
      <Divider />
    </Box>
  );
}

export default TopHeaderWithBackButton;
