import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import routes from 'app/navigation/routes';
import ConfigScreen from 'app/screens/ConfigScreen';
import CentreActivitiesScreen from 'app/screens/CentreActivitiesScreen';
import ActivityTemplatesScreen from 'app/screens/ActivityTemplatesScreen';
import NextWeekPreviewScreen from 'app/screens/NextWeekPreviewScreen';
import EmptyScreen from 'app/screens/EmptyScreen';
import AuthContext from 'app/auth/context';

const Stack = createNativeStackNavigator();

function ConfigNavigator() {
  const { user } = useContext(AuthContext) || {};
  const roleName = (user?.roleName || user?.role || '').toUpperCase();
  const isSupervisor = roleName === 'SUPERVISOR';

  return (
    <Stack.Navigator
      initialRouteName={
        isSupervisor ? routes.CONFIG_SCREEN : routes.EMPTY_SCREEN
      }
    >
      {isSupervisor ? (
        <Stack.Screen
          name={routes.ACTIVITY_TEMPLATES}
          component={ActivityTemplatesScreen}
          options={{ title: 'Activity templates' }}
        />
      ) : null}
      {isSupervisor ? (
        <Stack.Screen
          name={routes.NEXT_WEEK_PREVIEW}
          component={NextWeekPreviewScreen}
          options={{ title: 'Next-week preview' }}
        />
      ) : null}
      {isSupervisor ? (
        <Stack.Screen
          name={routes.CENTRE_ACTIVITIES}
          component={CentreActivitiesScreen}
          options={{ title: 'Centre Activities' }}
        />
      ) : null}
      <Stack.Screen
        name={isSupervisor ? routes.CONFIG_SCREEN : routes.EMPTY_SCREEN}
        component={isSupervisor ? ConfigScreen : EmptyScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

export default ConfigNavigator;
