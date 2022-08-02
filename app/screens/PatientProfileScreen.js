import React from "react";
import { StyleSheet } from "react-native";
import { Center, VStack, ScrollView, Stack, Box, Divider } from "native-base";
import PatientInformationCard from "../components/PatientInformationCard";
import colors from "../config/colors"

function PatientProfileScreen(props) {
  const { navigation, route } = props;
  const patientProfile = route.params;
  //   const handleProfileButton = () => {
  //     console.log("tesitn profile");
  //     console.log(patientProfile);
  //   };

  return (
    <Center 
    minH="100%"
    backgroundColor={colors.white_var1}>
      <ScrollView>
        <VStack>
          <PatientInformationCard
            patientProfile={patientProfile}
            navigation={navigation}
          />
        </VStack>
        <Divider />
        <VStack space="3" mt="4" px="8">
          <Stack direction="row" mb="2.5" mt="1.5" space={3}>
            <Box alignItems="center" rounded="lg" minW="40" minH="40" backgroundColor={colors.lighter_var2} shadow="2">
                <Box>
                    Test
                </Box>
            </Box>
          </Stack>
        </VStack>
        <Divider />
      </ScrollView>
    </Center>
  );
}

const styles = StyleSheet.create({});
export default PatientProfileScreen;
