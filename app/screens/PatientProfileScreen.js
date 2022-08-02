import React from "react";
import { StyleSheet } from "react-native";
import { Center, VStack, ScrollView, Stack, Divider } from "native-base";
import PatientInformationCard from "../components/PatientInformationCard";
import colors from "../config/colors";
import PatientProfileCard from "../components/PatientProfileCard";
import {
  MaterialCommunityIcons,
  MaterialIcons,
  FontAwesome5,
} from "@expo/vector-icons";

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
        <VStack space="3" mt="2" mb="4" px="8">
          <Stack direction="row" mb="2.5" mt="1.5" space={5} flexWrap={"wrap"}>
            <PatientProfileCard
              iconTop={"4"}
              iconRight={"2"}
              iconSize={"100"}
              vectorIconComponent={<MaterialCommunityIcons name="allergy" />}
              textMarginTop={"5"}
              textMarginLeft={"1"}
              text="Allergy"
              navigation={navigation}
            />
            <PatientProfileCard
              iconTop={"4"}
              iconRight={"0"}
              iconSize={"100"}
              vectorIconComponent={<FontAwesome5 name="heartbeat" />}
              textMarginTop={"5"}
              textMarginLeft={"1"}
              text="Vital"
              navigation={navigation}
            />
            <PatientProfileCard
              iconTop={"4"}
              iconRight={"0"}
              iconSize={"100"}
              vectorIconComponent={<FontAwesome5 name="smile-beam" />}
              textMarginTop={"5"}
              textMarginLeft={"1"}
              text="Patient Preference"
              navigation={navigation}
            />
            <PatientProfileCard
              iconTop={"4"}
              iconRight={"-15"}
              iconSize={"100"}
              vectorIconComponent={<FontAwesome5 name="clipboard-check" />}
              textMarginTop={"5"}
              textMarginLeft={"1"}
              text="Activity Preference"
              navigation={navigation}
            />
            <PatientProfileCard
              iconTop={"4"}
              iconRight={"-10"}
              iconSize={"100"}
              vectorIconComponent={<FontAwesome5 name="calendar-day" />}
              textMarginTop={"5"}
              textMarginLeft={"1"}
              text="Routine"
              navigation={navigation}
            />
            <PatientProfileCard
              iconTop={"4"}
              iconRight={"-0"}
              iconSize={"100"}
              vectorIconComponent={<MaterialIcons name="insert-photo" />}
              textMarginTop={"5"}
              textMarginLeft={"1"}
              text="Photo Album"
              navigation={navigation}
            />
            <PatientProfileCard
              iconTop={"4"}
              iconRight={"-2"}
              iconSize={"100"}
              vectorIconComponent={<MaterialCommunityIcons name="pill" />}
              textMarginTop={"5"}
              textMarginLeft={"1"}
              text="Prescription"
              navigation={navigation}
            />
            <PatientProfileCard
              iconTop={"4"}
              iconRight={"1"}
              iconSize={"100"}
              vectorIconComponent={
                <MaterialCommunityIcons name="umbrella-beach" />
              }
              textMarginTop={"5"}
              textMarginLeft={"1"}
              text="Holiday"
              navigation={navigation}
            />
            <PatientProfileCard
              iconTop={"4"}
              iconRight={"-2"}
              iconSize={"100"}
              vectorIconComponent={
                <MaterialCommunityIcons name="note-text-outline" />
              }
              textMarginTop={"5"}
              textMarginLeft={"1"}
              text="Problem Log"
              navigation={navigation}
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
