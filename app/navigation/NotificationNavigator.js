/* eslint-disable */
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform, View } from 'react-native';
import routes from './routes';
import NotificationsScreen from 'app/screens/notifications/NotificationsScreen';
import NotificationsRejectScreen from 'app/screens/notifications/NotificationsRejectScreen';
import NotificationsAcceptScreen from 'app/screens/notifications/NotificationsAcceptScreen';
import NotificationsReadScreen from 'app/screens/notifications/NotificationsReadScreen';
import NotificationsApprovalRequestScreen from 'app/screens/notifications/NotificationsApprovalRequestScreen';
import colors from '../config/colors';
import typography from '../config/typography';
import { useSafeArea } from 'react-native-safe-area-context';
import NotificationType from 'app/screens/notifications/NotificationType';

const Tab = createMaterialTopTabNavigator();
const Stack = createNativeStackNavigator();

/*
 * Reference: https://reactnavigation.org/docs/material-top-tab-navigator/
 * Note: V6 of documentation
 */
// TODO: Passing props between neighbouring children
// https://stackoverflow.com/questions/60439210/how-to-pass-props-to-screen-component-with-a-tab-navigator
// https://reactnavigation.org/docs/navigation-prop/#setparams
// https://www.reddit.com/r/reactnative/comments/td6ifk/passing_props_through_tab_navigator/
function NotificationTabNavigator() {
  const safeArea = useSafeArea();
  return (
    <View
      style={{
        flex: 1,
        paddingTop: safeArea.top,
        justifyContent: 'space-between',
      }}
    >
      <Tab.Navigator
        screenOptions={{
          tabBarIndicatorStyle: {
            backgroundColor: colors.pink,
          },
          tabBarLabelStyle: {
            fontFamily:
              Platform.OS === 'ios' ? 'Helvetica' : typography.android,
          },
          swipeEnabled: false,
        }}
      >
        <Tab.Screen
          component={NotificationsScreen}
          initialParams={{ notificationType: NotificationType.Unread }}
          name={routes.NOTIFICATION}
          options={{
            title: 'Unread',
          }}
        />
        <Tab.Screen
          component={NotificationsReadScreen}
          initialParams={{ notificationType: NotificationType.Read }}
          name={routes.NOTIFICATION_READ}
          options={{
            title: 'Read',
          }}
        />
        <Tab.Screen
          component={NotificationsAcceptScreen}
          initialParams={{ notificationType: NotificationType.Accept }}
          name={routes.NOTIFICATION_ACCEPT}
          options={{
            title: 'Accept',
          }}
        />
        <Tab.Screen
          component={NotificationsRejectScreen}
          initialParams={{ notificationType: NotificationType.Reject }}
          name={routes.NOTIFICATION_REJECT}
          options={{
            title: 'Reject',
          }}
        />
      </Tab.Navigator>
    </View>
  );
}
// Note: NotificationNavigator is an example of nested navigator
// Purpose: To allow tab components to navigate to `NotificationApprovalRequestScreen`.
// Reference: https://reactnavigation.org/docs/nesting-navigators/#each-navigator-keeps-its-own-navigation-history
function NotificationNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name={routes.NOTIFICATION_TAB}
        component={NotificationTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={routes.NOTIFICATION_APPROVAL_REQUEST}
        component={NotificationsApprovalRequestScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

export default NotificationNavigator;
