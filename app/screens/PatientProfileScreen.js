import React from "react";
import { StyleSheet } from "react-native";
import { Center, VStack, ScrollView, Stack, Divider } from "native-base";
import PatientInformationCard from "../components/PatientInformationCard";
import colors from "../config/colors";
import PatientProfileCard from "../components/PatientProfileCard";
import { MaterialCommunityIcons } from "@expo/vector-icons";

function PatientProfileScreen(props) {
  const { navigation, route } = props;
  const patientProfile = route.params;
  //   const handleProfileButton = () => {
  //     console.log("tesitn profile");
  //     console.log(patientProfile);
  //   };

  return (
    <Center minH="100%" backgroundColor={colors.white_var1}>
      <ScrollView>
        <VStack>
          <PatientInformationCard
            patientProfile={patientProfile}
            navigation={navigation}
          />
        </VStack>
        <Divider />
        <VStack space="3" mt="4" px="8">
          <Stack direction="row" mb="2.5" mt="1.5" space={5} flexWrap={"wrap"}>
            <PatientProfileCard 
            iconTop={"4"}
            iconRight={"2"}
            iconSize={"100"}
            vectorIconComponent={<MaterialCommunityIcons name="allergy"/>}
            textMarginTop={"5"}
            textMarginLeft={"1"}
            text="Allergy"
            />
          </Stack>
        </VStack>
        <Divider />
      </ScrollView>
    </Center>
  );
}

const styles = StyleSheet.create({});
export default PatientProfileScreen;

