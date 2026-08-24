/* eslint-disable */
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Pressable, Text, View } from 'react-native';
import routes from './routes';
import NotificationsScreen from 'app/screens/notifications/NotificationsScreen';
import NotificationsRejectScreen from 'app/screens/notifications/NotificationsRejectScreen';
import NotificationsAcceptScreen from 'app/screens/notifications/NotificationsAcceptScreen';
import NotificationsReadScreen from 'app/screens/notifications/NotificationsReadScreen';
import NotificationsApprovalRequestScreen from 'app/screens/notifications/NotificationsApprovalRequestScreen';
import colors from '../config/colors';
import typography from '../config/typography';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import NotificationType from 'app/screens/notifications/NotificationType';
import NotificationContext from 'app/screens/notifications/NotificationContext';
import { useState } from 'react';

const Stack = createNativeStackNavigator();

const NOTIFICATION_SUBTABS = [
  {
    key: 'unread',
    title: 'Unread',
    Comp: NotificationsScreen,
    name: routes.NOTIFICATION,
    type: NotificationType.Unread,
  },
  {
    key: 'read',
    title: 'Read',
    Comp: NotificationsReadScreen,
    name: routes.NOTIFICATION_READ,
    type: NotificationType.Read,
  },
  {
    key: 'accept',
    title: 'Accept',
    Comp: NotificationsAcceptScreen,
    name: routes.NOTIFICATION_ACCEPT,
    type: NotificationType.Accept,
  },
  {
    key: 'reject',
    title: 'Reject',
    Comp: NotificationsRejectScreen,
    name: routes.NOTIFICATION_REJECT,
    type: NotificationType.Reject,
  },
];

/*
 * Material top-tabs + Reanimated layout reanimation crashes this Expo Android
 * build (IllegalViewOperationException: ViewManager for tag could not be found)
 * as soon as the Notifications bottom tab is focused. A static tab strip keeps
 * the same four lists without a pager.
 */
function NotificationTabNavigator({ navigation }) {
  const safeArea = useSafeAreaInsets();
  const [activeKey, setActiveKey] = useState(NOTIFICATION_SUBTABS[0].key);
  const current =
    NOTIFICATION_SUBTABS.find((tab) => tab.key === activeKey) ||
    NOTIFICATION_SUBTABS[0];
  const Comp = current.Comp;

  return (
    <View
      collapsable={false}
      style={{
        flex: 1,
        paddingTop: safeArea.top,
        backgroundColor: colors.white,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          borderBottomWidth: 1,
          borderBottomColor: colors.grey_lighter,
        }}
      >
        {NOTIFICATION_SUBTABS.map((tab) => {
          const selected = tab.key === current.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setActiveKey(tab.key)}
              style={{
                flex: 1,
                alignItems: 'center',
                paddingVertical: 12,
                borderBottomWidth: selected ? 2 : 0,
                borderBottomColor: colors.pink,
              }}
              testID={`notification_subtab_${tab.key}`}
            >
              <Text
                style={{
                  fontFamily: typography.subheading1.fontFamily,
                  fontSize: typography.subheading1.fontSize,
                  fontWeight: selected ? '600' : '400',
                  color: selected ? colors.pink : colors.black,
                }}
              >
                {tab.title}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View collapsable={false} style={{ flex: 1 }}>
        <Comp
          navigation={navigation}
          route={{
            key: current.key,
            name: current.name,
            params: { notificationType: current.type },
          }}
        />
      </View>
    </View>
  );
}

function NotificationNavigator() {
  const [shouldRefetchAcceptNotifications, setRefetchAcceptNotifications] =
    useState(false);
  const [shouldRefetchRejectNotifications, setRefetchRejectNotifications] =
    useState(false);
  return (
    <NotificationContext.Provider
      value={{
        shouldRefetchAcceptNotifications,
        shouldRefetchRejectNotifications,
        setRefetchAcceptNotifications,
        setRefetchRejectNotifications,
      }}
    >
      <Stack.Navigator screenOptions={{ animation: 'none' }}>
        <Stack.Screen
          name={routes.NOTIFICATION_TAB}
          component={NotificationTabNavigator}
          options={{ headerShown: false, animation: 'none' }}
        />
        <Stack.Screen
          name={routes.NOTIFICATION_APPROVAL_REQUEST}
          component={NotificationsApprovalRequestScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NotificationContext.Provider>
  );
}

export default NotificationNavigator;
