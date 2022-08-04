import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import {
  Avatar,
  Center,
  VStack,
  ScrollView,
  Stack,
  Divider,
  Box,
  AspectRatio,
  Image,
  Text,
  Input,
  FormControl,
  HStack,
  TextArea,
} from "native-base";
import colors from "../config/colors";

function PersonalInformationCard(props) {
  const { patientInformation } = props;
  const {
    address,
    profilePicture,
    dob,
    firstName,
    lastName,
    gender,
    nric,
    homeNo,
    handphoneNo,
    tempAddress,
  } = patientInformation.route.params;
  const handleThis = () => {
    console.log("IM CLIKING");
    console.log(patientInformation);
    console.log(firstName);
  };

  return (
    <Stack alignItems="flex-start">
      <Text
        color={colors.black_var1}
        fontFamily="Helvetica"
        fontSize="2xl"
        fontWeight="semibold"
      >
        Your Patient Information
      </Text>
      <FormControl>
        <HStack space={2}>
          <FormControl.Label
            _text={{
              fontFamily: "Helvetica",
              fontSize: "lg",
              fontWeight: "thin",
            }}
          >
            First Name
          </FormControl.Label>

          <Input
            color={colors.black_var1}
            fontFamily="Helvetica"
            fontSize="lg"
            isReadOnly={true}
            variant="unstyled"
            value={firstName}
            w="100%"
          />
        </HStack>
      </FormControl>
      <FormControl>
        <HStack space={2}>
          <FormControl.Label
            _text={{
              fontFamily: "Helvetica",
              fontSize: "lg",
              fontWeight: "thin",
            }}
          >
            Last Name
          </FormControl.Label>

          <Input
            color={colors.black_var1}
            fontFamily="Helvetica"
            fontSize="lg"
            isReadOnly={true}
            variant="unstyled"
            value={lastName}
            w="100%"
          />
        </HStack>
      </FormControl>
      <FormControl>
        <HStack space={2}>
          <FormControl.Label
            _text={{
              fontFamily: "Helvetica",
              fontSize: "lg",
              fontWeight: "thin",
            }}
          >
            NRIC
          </FormControl.Label>

          <Input
            color={colors.black_var1}
            fontFamily="Helvetica"
            fontSize="lg"
            isReadOnly={true}
            variant="unstyled"
            value={nric}
            w="100%"
          />
        </HStack>
      </FormControl>
      <FormControl>
        <HStack space={2}>
          <FormControl.Label
            _text={{
              fontFamily: "Helvetica",
              fontSize: "lg",
              fontWeight: "thin",
            }}
          >
            Gender
          </FormControl.Label>

          <Input
            color={colors.black_var1}
            fontFamily="Helvetica"
            fontSize="lg"
            isReadOnly={true}
            variant="unstyled"
            value={gender === "F" ? "Female" : "Male"}
            w="100%"
          />
        </HStack>
      </FormControl>
      <FormControl>
        <HStack space={2}>
          <FormControl.Label
            _text={{
              fontFamily: "Helvetica",
              fontSize: "lg",
              fontWeight: "thin",
            }}
          >
            DOB
          </FormControl.Label>

          <Input
            color={colors.black_var1}
            fontFamily="Helvetica"
            fontSize="lg"
            isReadOnly={true}
            variant="unstyled"
            value={dob.substring(0, 10)}
            w="100%"
          />
        </HStack>
      </FormControl>
      <FormControl>
        <HStack space={2}>
          <FormControl.Label
            _text={{
              fontFamily: "Helvetica",
              fontSize: "lg",
              fontWeight: "thin",
            }}
          >
            Home Number
          </FormControl.Label>

          <Input
            color={colors.black_var1}
            fontFamily="Helvetica"
            fontSize="lg"
            isReadOnly={true}
            variant="unstyled"
            value={homeNo}
            w="100%"
          />
        </HStack>
      </FormControl>
      <FormControl>
        <HStack space={2}>
          <FormControl.Label
            _text={{
              fontFamily: "Helvetica",
              fontSize: "lg",
              fontWeight: "thin",
            }}
          >
            Mobile Number
          </FormControl.Label>

          <Input
            color={colors.black_var1}
            fontFamily="Helvetica"
            fontSize="lg"
            isReadOnly={true}
            variant="unstyled"
            value={handphoneNo}
            w="100%"
          />
        </HStack>
      </FormControl>
      <FormControl>
        <Stack space={0} alignItems="flex-start" flexWrap={"wrap"}>
          <FormControl.Label
            width="100%"
            _text={{
              fontFamily: "Helvetica",
              fontSize: "lg",
              fontWeight: "thin",
            }}
          >
            Address
          </FormControl.Label>
          <TextArea
            color={colors.black_var1}
            fontFamily="Helvetica"
            fontSize="lg"
            isReadOnly={true}
            input="lg"
            ml="-2.5"
            minH="8%"
            maxH="40%"
            variant="unstyled"
            value={address ? address : "Not available"}
            w="100%"
          />
        </Stack>
      </FormControl>
      <FormControl>
        <Stack space={0} alignItems="flex-start" flexWrap={"wrap"}>
          <FormControl.Label
            width="100%"
            _text={{
              fontFamily: "Helvetica",
              fontSize: "lg",
              fontWeight: "thin",
            }}
          >
            Temporary Address
          </FormControl.Label>
          <TextArea
            color={colors.black_var1}
            fontFamily="Helvetica"
            fontSize="lg"
            isReadOnly={true}
            input="lg"
            ml="-2.5"
            minH="8%"
            maxH="40%"
            variant="unstyled"
            value={tempAddress ? tempAddress : "Not available"}
            w="100%"
          />
        </Stack>
      </FormControl>

      <Center position="absolute" right="0" py="1.5">
        <Avatar
          size="md"
          source={{
            uri: profilePicture,
          }}
        >
          {/* Note this is a fall-back, in case image isn't rendered */}
          {`${firstName.substring(0, 1)}${lastName.substring(0, 1)}`}
        </Avatar>
      </Center>
    </Stack>
  );
}

const styles = StyleSheet.create({});
export default PersonalInformationCard;
/*
firstName
lastName
NRIC
Gender
DOB
Home Number
Mobile Number
Address
Temporary Address (optional)
*/
