import { useState } from "react";
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

export default function App() {
  const [user, setUser] = useState();

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
