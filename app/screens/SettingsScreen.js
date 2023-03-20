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
            vectorIconComponent={<MaterialCommunityIcons name="key" />}
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
