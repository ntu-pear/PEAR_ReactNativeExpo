import React, { useState } from 'react';
import { LogBox } from 'react-native';
import { View } from 'native-base';

// Custom import from https://docs.nativebase.io/
import { NativeBaseProvider } from 'native-base';
import colors from 'app/config/colors';

// Import from Screens or Components
import OfflineNotice from 'app/components/OfflineNotice';

// Navigation or Routing related import
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthNavigator from 'app/navigation/AuthNavigator';
import AppNavigator from 'app/navigation/AppNavigator';

import AuthContext from 'app/auth/context';
import DebugNavigator from 'app/navigation/DebugNavigator';

// Removal of token/user login persistence (see lines 36-37) -- Justin
// import authStorage from './app/auth/authStorage';
const AppStack = createNativeStackNavigator();

const AppStackScreen = ({user}) => (
  <AppStack.Navigator screenOptions={{ headerShown: false }}>
    {user ? <AppStack.Screen name = "App" component={AppNavigator} /> : 
            <AppStack.Screen name = "Auth" component={AuthNavigator} />}
  </AppStack.Navigator>
);

export default function App() {
  const [user, setUser] = useState(null);
  const [acceptRejectNotifID, setAcceptRejectNotifID] = useState(-1);

  // Reference on fixing theme issue
  // https://stackoverflow.com/questions/48253357/react-navigation-default-background-color
  const MyTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: colors.white_var1,
    },
  };
  LogBox.ignoreLogs(['Invalid prop textStyle of type array supplied to Cell']);

  // Removal of user login persistence as recommendation by prof for security issue: Enforce login
  // long-term token persistence is not very secure - imagine a banking app (meeting: 14/10/2023) -- Justin

  // useEffect(() => {
  //   restoreUser();
  // }, []);

  // const restoreUser = async () => {
  //   const user = await authStorage.getUser();
  //   if (user) setUser(user);
  // };

  return (
    // NativeBaseProvider is a component that makes the theme available throughout your app.
    <NativeBaseProvider>
      <AuthContext.Provider
        value={{ user, setUser, acceptRejectNotifID, setAcceptRejectNotifID }}
      >
        <OfflineNotice />
        <NavigationContainer theme={MyTheme}>
          {/* {user ? <AppNavigator /> : <AuthNavigator />} using this had render issues
          Reference to render fix: https://stackoverflow.com/questions/72800167/login-screen-rendering-twice-after-logout-on-react-navigation-6 */}

          {/* <DebugNavigator/> */}
          <AppStackScreen user={user} />
        </NavigationContainer>
      </AuthContext.Provider>
    </NativeBaseProvider>
  );
}

// Does not seem to be used. -- Justin
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });
