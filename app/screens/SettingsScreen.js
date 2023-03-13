import { Center, VStack } from 'native-base';
import React from 'react';
import { Text, View } from 'react-native';

import AccountCard from 'app/components/AccountCard';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import routes from 'app/navigation/routes';

function SettingsScreen(props) {
  const { navigation } = props;

  return (
    <View>
      <Center>
        <VStack flexWrap="wrap" mb="1">
          <AccountCard
            iconTop="3"
            iconLeft="2"
            iconSize="50"
            vectorIconComponent={<MaterialCommunityIcons name="key" />}
            textMarginTop="6"
            textMarginLeft="1"
            text="Change Password"
            navigation={navigation}
            routes={routes.CHANGE_PASSWORD}
          />
        </VStack>
      </Center>
    </View>
  );
}

export default SettingsScreen;
