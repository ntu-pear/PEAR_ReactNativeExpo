import { useState, useEffect } from "react";
import { StyleSheet } from "react-native";

// Custom import from https://docs.nativebase.io/
import { NativeBaseProvider } from "native-base";

// Import from Screens or Compponents
import OfflineNotice from "./app/components/OfflineNotice";

// Navigation or Routing related import
import { NavigationContainer } from "@react-navigation/native";
import AuthNavigator from "./app/navigation/AuthNavigator";
import AppNavigator from "./app/navigation/AppNavigator";
import AuthContext from "./app/auth/context";
import authStorage from "./app/auth/authStorage";
import jwt_decode from "jwt-decode";

export default function App() {
  const [user, setUser] = useState();

  useEffect(() => {
    restoreToken();
  }, []);

  /*
   * restoreToken is responsible for persisting user's auth token. e.g. when app reloads
   */
  const restoreToken = async () => {
    const token = await authStorage.getToken();
    if (!token) return;
    setUser(jwt_decode(token));
  };

  return (
    // NativeBaseProvider is a component that makes the theme available throughout your app.
    <NativeBaseProvider>
      <AuthContext.Provider value={{ user, setUser }}>
        <OfflineNotice />
        <NavigationContainer>
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
