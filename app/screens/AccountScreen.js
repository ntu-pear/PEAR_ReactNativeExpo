import React, { useContext } from "react";
import { StyleSheet, Text, View } from "react-native";
import AuthContext from "../auth/context";
import AppButton from "../components/AppButton";

function AccountScreen() {
  const { user, setUser } = useContext(AuthContext);

  const onPressLogOut = () => {
    setUser(null);
  }
  
  return (
    <View>
      <Text>This is my accountscreen</Text>
      <Text>{user.sub}</Text>
      <AppButton title="Logout" color="red" onPress={onPressLogOut}/>
    </View>
  );
}

const styles = StyleSheet.create({});

export default AccountScreen;
