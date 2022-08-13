import { useState, useEffect } from "react";
import { StyleSheet } from "react-native";

// Custom import from https://docs.nativebase.io/
import { NativeBaseProvider } from "native-base";
import colors from "./app/config/colors";

// Import from Screens or Compponents
import OfflineNotice from "./app/components/OfflineNotice";

// Navigation or Routing related import
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import AuthNavigator from "./app/navigation/AuthNavigator";
import AppNavigator from "./app/navigation/AppNavigator";
import AuthContext from "./app/auth/context";
import authStorage from "./app/auth/authStorage";

export default function App() {
  const [user, setUser] = useState();
  const [acceptRejectNotifID, setAcceptRejectNotifID] = useState(-1);

  // Reference on fixing theme issue
  // https://stackoverflow.com/questions/48253357/react-navigation-default-background-color
  const MyTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: colors.white_var1
    }
  }

  useEffect(() => {
    restoreUser();
  }, []);

  /*
   * restoreUser is responsible for persisting user's auth token. e.g. when app reloads
   */
  const restoreUser = async () => {
    const user = await authStorage.getUser();
    if (user) setUser(user);
  };

  return (
    // NativeBaseProvider is a component that makes the theme available throughout your app.
    <NativeBaseProvider>
      <AuthContext.Provider value={{ user, setUser, acceptRejectNotifID, setAcceptRejectNotifID }}>
        <OfflineNotice />
        <NavigationContainer theme={MyTheme}>
          {user ? <AppNavigator /> : <AuthNavigator />}
        </NavigationContainer>
      </AuthContext.Provider>
    </NativeBaseProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
