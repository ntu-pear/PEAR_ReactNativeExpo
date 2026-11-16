import React from 'react';
import { Button, Icon } from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
import colors from 'app/config/colors';

// "Favourites only" switch shared by the Dashboard and Patients lists, in the
// app's teal: outlined when off, filled when on.
export default function FavouritesToggle({ active, onPress, testID }) {
  const tint = active ? colors.white : colors.green;
  return (
    <Button
      testID={testID}
      onPress={onPress}
      variant={active ? 'solid' : 'outline'}
      bg={active ? colors.green : 'transparent'}
      borderColor={colors.green}
      _pressed={{ bg: active ? colors.green_lighter : colors.green_lightest }}
      _text={{ color: tint }}
      leftIcon={<Icon as={MaterialIcons} name="star" color={tint} />}
      accessibilityState={{ selected: !!active }}
      mx="5"
      mt="2"
      mb="1"
    >
      {active ? 'Showing favourites' : 'Favourites only'}
    </Button>
  );
}
