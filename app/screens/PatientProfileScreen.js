import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Center, VStack, ScrollView, HStack, Box } from "native-base";
import AppButton from "../components/AppButton";
import PatientInformationCard from "../components/PatientInformationCard";

function PatientProfileScreen(props) {
  const { navigation, route } = props;
  const patientProfile = route.params;
  const handleProfileButton = () => {
    console.log("tesitn profile");
    console.log(patientProfile);
  };

  return (
    // <View>
    //     <Text>
    //         This is patient Profile screen.

    //     </Text>
    //     <AppButton title="test" color="red" onPress={handleProfileButton}/>
    // </View>
    <Center>
      <ScrollView>
        <VStack>
          <PatientInformationCard patientProfile={patientProfile} navigation={navigation}/>
        </VStack>
        <HStack>
          <Box>
            <Center>
              <Text>Hello</Text>
            </Center>
          </Box>
        </HStack>
      </ScrollView>
    </Center>
  );
}

const styles = StyleSheet.create({});
export default PatientProfileScreen;
