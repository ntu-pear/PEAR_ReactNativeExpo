import React, { useContext } from "react";
import { StyleSheet, Text, View } from "react-native";
import AuthContext from "../auth/context";

function AccountScreen() {
  const { user } = useContext(AuthContext);
  return (
    <View>
      <Text>This is my accountscreen</Text>
      <Text>{user.sub}</Text>
    </View>
  );
}

const styles = StyleSheet.create({});

export default AccountScreen;
