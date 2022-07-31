import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Center, Image, VStack, Box, ScrollView } from "native-base";
import patientApi from "../api/patient";
import useCheckExpiredThenLogOut from "../hooks/useCheckExpiredThenLogOut";
import PatientScreenCard from "../components/PatientScreenCard";

function PatientsScreen() {
  const [listOfPatients, setListOfPatients] = useState();
  const checkExpiredLogOutHook = useCheckExpiredThenLogOut();

  useEffect(() => {
    // Reference https://stackoverflow.com/questions/21518381/proper-way-to-wait-for-one-function-to-finish-before-continuing
    // Resolved the issue of `setListOfPatients` before successfully calling getPatient api.
    const promiseFunction = async () => {
      const response = await getListOfPatients();
      setListOfPatients(response.data);
    };
    promiseFunction();
  }, []);

  const getListOfPatients = async () => {
    const response = await patientApi.getPatient(null, true, true);
    if (!response.ok) {
      // Check if token has expired, if yes, proceed to log out
      checkExpiredLogOutHook.handleLogOut(response);
      return;
    }
    return response;
  };

  return (
    <Center>
      <ScrollView>
        <VStack>
          {listOfPatients ? (
            listOfPatients.map((item, index) => (
              <PatientScreenCard patientProfile={item} key={index} />
            ))
          ) : (
            <Text> Loading... </Text>
          )}
        </VStack>
      </ScrollView>
    </Center>
  );
}

const styles = StyleSheet.create({});

export default PatientsScreen;
