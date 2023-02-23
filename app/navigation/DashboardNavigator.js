import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from 'app/screens/DashboardScreen';

// Import Constants from Routes
import routes from 'app/navigation/routes';
import { Image } from 'native-base';
import { TouchableOpacity } from 'react-native';

// Refer to this: https://reactnavigation.org/docs/hello-react-navigation
const Stack = createNativeStackNavigator();

// Refer to this for configuration: https://reactnavigation.org/docs/native-stack-navigator#options
function DashboardNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name={routes.DASHBOARD_SCREEN}
        component={DashboardScreen}
        options={{
          headerRight: () => (
            // eslint-disable-next-line no-console
            <TouchableOpacity onPress={() => console.log('This is a button!')}>
              <Image
                source={{
                  uri: 'https://cdn-icons-png.flaticon.com/512/7693/7693332.png',
                }}
                size={'25px'}
              />
            </TouchableOpacity>
          ),
        }}
      />
    </Stack.Navigator>
  );
}

export default DashboardNavigator;
