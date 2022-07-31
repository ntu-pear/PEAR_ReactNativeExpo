import React from "react";
import { StyleSheet, View, TouchableHighlight } from "react-native";

import { Center, Image, Text, VStack } from "native-base";
import colors from "../config/colors";

function PatientScreenCard(props) {
  const handleOnPress = () => {
    console.log("CLICKING");
    // TODO: Navigate to PatientProfile
  };
  return (
    <TouchableHighlight
      onPress={handleOnPress}
      underlayColor={colors.lighter_var2}
    >
      <VStack>
        <Center>
          <Image
            alt="patient_image"
            borderRadius={100}
            fallbackSource={{
              uri:
                "https://res.cloudinary.com/dbpearfyp/image/upload/v1640487405/Patient/Alice_Lee_Sxxxx567D/ProfilePicture/zsw7dyprsvn0bjmatofg.jpg",
            }}
            resizeMode={"contain"}
            source={{
              uri:
                "https://res.cloudinary.com/dbpearfyp/image/upload/v1640487405/Patient/Alice_Lee_Sxxxx567D/ProfilePicture/zsw7dyprsvn0bjmatofg.jpg",
            }}
            size="xl"
          />
        </Center>
        <Center>
          <Text bold fontSize="md">
            Alice Lee
          </Text>
        </Center>
        <Center>
          <Text>Alice</Text>
        </Center>
        <Center>
          <Text>Sxxxx525X</Text>
        </Center>
      </VStack>
    </TouchableHighlight>
  );
}

const styles = StyleSheet.create({});

export default PatientScreenCard;
/*


https://res.cloudinary.com/dbpearfyp/image/upload/v1640487405/Patient/Alice_Lee_Sxxxx567D/ProfilePicture/zsw7dyprsvn0bjmatofg.jpg




"},{"patientID":2,"preferredLanguage":"English","firstName":"Yan","lastName":"Yi","nric":"Sxxxx525X","address":null,"tempAddress":null,"homeNo":null,"handphoneNo":null,"gender":"M","dob":"1996-02-02T00:00:00","preferredName":"Alex","privacyLevel":1,"updateBit":true,"autoGame":true,"startDate":"2020-02-02T00:00:00","endDate":null,"terminationReason":null,"isActive":true,"inactiveReason":null,"inactiveDate":null,"isRespiteCare":true,"profilePicture":"https://res.cloudinary.com/dbpearfyp/image/upload/v1634521792/Patient/Yan_Yi_Sxxxx148C/ProfilePicture/g5gnecfsoc8igp56dwnb.jpg"},{"patientID":3,"preferredLanguage":"Hainanese","firstName":"Jon","lastName":"Ong","nric":"Sxxxx300H","address":"Blk 3007 Ubi Rd 1 05-412, 406701, Singapore","tempAddress":null,"homeNo":"67485000","handphoneNo":"67489859","gender":"M","dob":"1960-02-02T00:00:00","preferredName":"Jon","privacyLevel":2,"updateBit":true,"autoGame":true,"startDate":"2021-01-01T00:00:00","endDate":"2021-11-12T00:00:00","terminationReason":null,"isActive":true,"inactiveReason":null,"inactiveDate":null,"isRespiteCare":false,"profilePicture":"https://res.cloudinary.com/dbpearfyp/image/upload/v1634522355/Patient/Jon_Ong_Sxxxx300H/ProfilePicture/arkceots9px0niro7iwh.jpg"},{"patientID":4,"preferredLanguage":"Hakka","firstName":"Bi","lastName":"Gong","nric":"Sxxxx443F","address":"41 Sungei Kadut Loop S 729509, Singapore","tempAddress":"42 Sungei Kadut Loop S 729509, Singapore","homeNo":"98123120","handphoneNo":"98123133","gender":"M","dob":"1980-04-04T00:00:00","preferredName":"Bi","privacyLevel":3,"updateBit":false,"autoGame":false,"startDate":"2021-01-01T00:00:00","endDate":null,"terminationReason":null,"isActive":true,"inactiveReason":null,"inactiveDate":"2021-01-01T00:00:00","isRespiteCare":false,"profilePicture":"https://res.cloudinary.com/dbpearfyp/image/upload/v1634522583/Patient/Bi_Gong_Sxxxx443F/ProfilePicture/dwo0axohyhur5mp16lep.jpg"},{"patientID":5,"preferredLanguage":"English","firstName":"Jeline","lastName":"Mao","nric":"Sxxxx123Z","address":"12 Ang Mio Kio Road #98-55 546512,Singapore","tempAddress":null,"homeNo":"65231565","handphoneNo":"86543216","gender":"M","dob":"0001-09-01T06:15:35.587","preferredName":"Tom","privacyLevel":3,"updateBit":false,"autoGame":false,"startDate":"2021-01-01T00:00:00","endDate":null,"terminationReason":null,"isActive":true,"inactiveReason":null,"inactiveDate":null,"isRespiteCare":false,"profilePicture":null}]
*/
