import React from 'react';
import { Box, Icon, Text, HStack, VStack } from 'native-base';
import colors from 'app/config/colors';
import { TouchableOpacity } from 'react-native';

function AccountCard(props) {
  const { vectorIconComponent, text, navigation, routes } = props;

  const handleOnPressToNextScreen = () => {
    navigation.push(routes);
  };

  return (
    <TouchableOpacity onPress={handleOnPressToNextScreen}>
      <VStack w="100%" alignItems="center">
        <Box
          rounded="lg"
          borderWidth="1"
          borderColor={colors.primary_gray}
          minW="100%"
          minH="20"
        >
          <VStack w="100%" space={4} flexWrap="wrap" mb="1">
            <HStack space={5} alignItems="center">
              <Icon
                // Reference: Passing component to child
                // https://stackoverflow.com/questions/39652686/pass-react-component-as-props
                as={{ ...vectorIconComponent }}
                top="3"
                left="2"
                color={colors.black_var1}
                size="50"
              />
              <Text
                alignSelf="flex-start"
                fontSize="lg"
                mt="6"
                ml="1"
                color={colors.black_var1}
              >
                {text}
              </Text>
            </HStack>
          </VStack>
        </Box>
      </VStack>
    </TouchableOpacity>
  );
}

export default AccountCard;
