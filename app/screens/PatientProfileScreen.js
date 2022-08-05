import React from "react";
import { StyleSheet } from "react-native";
import { Center, VStack, ScrollView, Stack, Divider } from "native-base";
import PatientInformationCard from "../components/PatientInformationCard";
import colors from "../config/colors";
import PatientProfileCard from "../components/PatientProfileCard";
import routes from "../navigation/routes";
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
        <VStack ml="5" mr="5">
          <PatientInformationCard
            patientProfile={patientProfile}
            navigation={navigation}
          />
        
        <Divider />
        <VStack
          space="1"
          /* Reponsive design: https://docs.nativebase.io/responsive
          Note: These are the breakpoints
          breakpoints = {
            base: 0,
            sm: 480,
            md: 768,
            lg: 992,
            xl: 1280,
            };
          */
          ml={{
            base: "9",
            sm: "15",
            md: "15",
            lg: "15",
          }}
          mt="2"
          mb="4"
        >
          <Stack direction="row" mb="2.5" mt="1.5" space={3} flexWrap={"wrap"}>
            <PatientProfileCard
              iconTop={"4"}
              iconRight={"2"}
              iconSize={"100"}
              vectorIconComponent={<MaterialCommunityIcons name="allergy" />}
              textMarginTop={"5"}
              textMarginLeft={"1"}
              text="Allergy"
              navigation={navigation}
              routes={routes.PATIENT_ALLERGY}
              patientProfile={patientProfile}
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
              routes={routes.PATIENT_VITAL}
              patientProfile={patientProfile}
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
              routes={routes.PATIENT_PREFERENCE}
              patientProfile={patientProfile}
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
              routes={routes.PATIENT_ACTIVITY_PREFERENCE}
              patientProfile={patientProfile}
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
              routes={routes.PATIENT_ROUTINE}
              patientProfile={patientProfile}
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
              routes={routes.PATIENT_PHOTO_ALBUM}
              patientProfile={patientProfile}
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
              routes={routes.PATIENT_PRESCRIPTION}
              patientProfile={patientProfile}
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
              routes={routes.PATIENT_HOLIDAY}
              patientProfile={patientProfile}
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
              routes={routes.PATIENT_PROBLEM_LOG}
              patientProfile={patientProfile}
            />
          </Stack>
        </VStack>
        <Divider />
        </VStack>
      </ScrollView>
    </Center>
  );
}

const styles = StyleSheet.create({});
export default PatientProfileScreen;
