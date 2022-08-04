import React, { useState } from "react";
import { StyleSheet, Platform } from "react-native";
import {
  Stack,
  Text,
  Input,
  FormControl,
  HStack,
  Select,
  CheckIcon,
} from "native-base";
import colors from "../config/colors";
import typography from "../config/typography";

function PersonalSocialHistory() {
  const [isEditMode, setIsEditMode] = useState(false);
  let [formLiveWith, setFormLiveWith] = useState("Alone");
  let [formEducation, setFormEducation] = useState("Primary or lower");
  let [formOccupation, setFormOccupation] = useState("Accountant");
  let [formReligion, setFormReligion] = useState("Christian");
  let [formPet, setFormPet] = useState("Bird");
  let [formReligion, setFormReligion] = useState("Alone");
  let [formDiet, setFormDiet] = useState("Yes");
  let [formExercise, setFormExercise] = useState("Yes");
  let [formSexuallyActive, setFormSexuallyActive] = useState("Yes");
  let [formDrugUse, setFormDrugUse] = useState("Yes");
  let [formFormCaffeine, setFormFormCaffeine] = useState("Yes");
  let [formAlcohol, setFormAlcohol] = useState("Yes");
  let [formTobacco, setFormTobacco] = useState("Yes");
  let [formSecondHandSmoker, setFormSecondHandSmoker] = useState("Yes");

  const liveWithOptions = [
    "Alone",
    "Children",
    "Friend",
    "Relative",
    "Spouse",
    "Family",
    "Parents",
  ];

  return (
    <Stack space={2}>
      <Text
        color={colors.black_var1}
        fontFamily={Platform.OS === "ios" ? "Helvetica" : typography.android}
        fontSize="2xl"
        fontWeight="semibold"
      >
        Social History
      </Text>
      <Text
        color={colors.primary_overlay_color}
        fontFamily={Platform.OS === "ios" ? "Helvetica" : typography.android}
        fontSize="md"
        fontWeight="hairline"
      >
        About
      </Text>
      <FormControl maxW="50%">
        <HStack space={2} alignItems="center">
          <FormControl.Label
            _text={{
              fontFamily: `${
                Platform.OS === "ios" ? "Helvetica" : typography.android
              }`,
              fontSize: "lg",
              fontWeight: "thin",
            }}
          >
            Living with
          </FormControl.Label>
          {isEditMode ? (
            <Select
              fontFamily={
                Platform.OS === "ios" ? "Helvetica" : typography.android
              }
              fontSize="lg"
              label="hello"
              minW="100%"
              onValueChange={(itemValue) => setFormLiveWith(itemValue)}
              placeholder={formLiveWith}
              selectedValue={formLiveWith}
              variant="underlined"
              _selectedItem={{
                endIcon: (
                  <CheckIcon
                    size={5}
                    fontFamily={
                      Platform.OS === "ios" ? "Helvetica" : typography.android
                    }
                    fontSize="lg"
                    color={colors.pink}
                  />
                ),
              }}
            >
              <Select.Item label="test1" value="test1" />
            </Select>
          ) : (
            <Input
              color={colors.black_var1}
              fontFamily={
                Platform.OS === "ios" ? "Helvetica" : typography.android
              }
              fontSize="lg"
              isReadOnly={true}
              variant="unstyled"
              value={"test"}
              w="100%"
            />
          )}
        </HStack>
      </FormControl>
      <Text
        color={colors.primary_overlay_color}
        fontFamily={Platform.OS === "ios" ? "Helvetica" : typography.android}
        fontSize="md"
        fontWeight="hairline"
        mt="5"
      >
        Lifestyle
      </Text>
    </Stack>
  );
}

const styles = StyleSheet.create({});
export default PersonalSocialHistory;
/*
About Patient:
- Live with 
- Education
- Occupation
- Religion
- Pet
- Diet 

LifeStyle:
- Exercise
- Sexually Active
- Drug Use
- Caffeine Use
- Alcohol Use
- Tobacco Use
- Secondhand Smoker

*/
