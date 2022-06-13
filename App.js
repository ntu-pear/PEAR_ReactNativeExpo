import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";

// Custom import from https://docs.nativebase.io/
import { NativeBaseProvider } from "native-base";

// Import from Screens or Compponents
import WelcomeScreen from "./app/screens/WelcomeScreen";
import OfflineNotice from "./app/components/OfflineNotice";

// Navigation or Routing related import
import { NavigationContainer } from "@react-navigation/native";
import AuthNavigator from "./app/navigation/AuthNavigator";
import AppNavigator from "./app/navigation/AppNavigator";

export default function App() {
  return (
    // NativeBaseProvider is a component that makes the theme available throughout your app.
    <NativeBaseProvider>
      <OfflineNotice/>
      <NavigationContainer>
        <AuthNavigator />
        {/* <AppNavigator/> */}
      </NavigationContainer>
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
