/* eslint-disable */
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Platform } from 'react-native';
import routes from './routes';
import NotifcationsScreen from '../screens/NotifcationsScreen';
import NotificationsRejectScreen from '../screens/NotificationsRejectScreen';
import NotificationsAcceptScreen from '../screens/NotificationsAcceptScreen';
import NotificationsReadScreen from '../screens/NotificationsReadScreen';
import colors from '../config/colors';
import typography from '../config/typography';

const Tab = createMaterialTopTabNavigator();

/*
 * Reference: https://reactnavigation.org/docs/material-top-tab-navigator/
 * Note: V6 of documentation
 */
// TODO: Passing props between neighbouring children
// https://stackoverflow.com/questions/60439210/how-to-pass-props-to-screen-component-with-a-tab-navigator
// https://reactnavigation.org/docs/navigation-prop/#setparams
// https://www.reddit.com/r/reactnative/comments/td6ifk/passing_props_through_tab_navigator/
function NotificationNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarIndicatorStyle: {
          backgroundColor: colors.pink,
        },
        tabBarLabelStyle: {
          fontFamily: Platform.OS === 'ios' ? 'Helvetica' : typography.android,
        },
        swipeEnabled: false,
      }}
    >
      <Tab.Screen
        component={NotifcationsScreen}
        name={routes.NOTIFICATION}
        options={{
          title: 'Unread',
        }}
      />
      <Tab.Screen
        component={NotificationsReadScreen}
        name={routes.NOTIFICATION_READ}
        options={{
          title: 'Read',
        }}
      />
      <Tab.Screen
        component={NotificationsAcceptScreen}
        name={routes.NOTIFICATION_ACCEPT}
        options={{
          title: 'Accepted',
        }}
      />
      <Tab.Screen
        component={NotificationsRejectScreen}
        name={routes.NOTIFICATION_REJECT}
        options={{
          title: 'Rejected',
        }}
      />
    </Tab.Navigator>
  );
}

export default NotificationNavigator;
