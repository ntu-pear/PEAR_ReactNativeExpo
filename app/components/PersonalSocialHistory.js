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
  /*
   *  *** All States Related To <Select> Component ***
   */
  const [isEditMode, setIsEditMode] = useState(false);
  const [liveWithListId, setLiveWithListId] = useState(1);
  const [educationListId, setEducationListId] = useState(1);
  const [occupationListId, setOccupationListId] = useState(1);
  const [religionListId, setReligionListId] = useState(1);
  const [petListId, setPetListId] = useState(1);
  const [dietListId, setDietListId] = useState(1);
  const [exercise, setExercise] = useState(1);
  const [sexuallyActive, setSexuallyActive] = useState(1);
  const [drugeUse, setDrugeUse] = useState(1);
  const [caffeineUse, setCaffeineUse] = useState(1);
  const [alocholUse, setAlocholUse] = useState(1);
  const [tobaccoUse, settobaccoUse] = useState(1);
  const [secondhandSmoker, setSecondhandSmoker] = useState(1);
  const [dietDesciption, setDietDesciption] = useState("Diabetic");
  const [educationDescription, setEducationDescription] = useState(
    "Primary or lower"
  );
  const [liveWithDescription, setLiveWithDescription] = useState("Alone");
  const [occupationDescription, setOccupationDescription] = useState(
    "Accountant"
  );
  const [petDescription, setPetDescription] = useState("Bird");
  const [religionDescription, setReligionDescription] = useState("Atheist");
  /*
   *  *** All possible list of questionaires to map to ***
   */
  const [educationOptions, setEducationOptions] = useState([]);
  const [occupationOptions, setOccupationOptions] = useState([]);
  const [petOptions, setPetOptions] = useState([]);
  const [dietOptions, setDietOptions] = useState([]);
  const [religionOptions, setReligionOptions] = useState([]);
  const [liveWithOptions, setliveWithOptions] = useState([
    {
      list_LiveWithID: 1,
      value: "Alone",
      isDeleted: false,
      createdDateTime: "2021-01-01T00:00:00",
      updatedDateTime: "2021-01-01T00:00:00",
    },
    {
      list_LiveWithID: 2,
      value: "Children",
      isDeleted: false,
      createdDateTime: "2021-01-01T00:00:00",
      updatedDateTime: "2021-01-01T00:00:00",
    },
    {
      list_LiveWithID: 3,
      value: "Friend",
      isDeleted: false,
      createdDateTime: "2021-01-01T00:00:00",
      updatedDateTime: "2021-01-01T00:00:00",
    },
    {
      list_LiveWithID: 4,
      value: "Relative",
      isDeleted: false,
      createdDateTime: "2021-01-01T00:00:00",
      updatedDateTime: "2021-01-01T00:00:00",
    },
    {
      list_LiveWithID: 5,
      value: "Spouse",
      isDeleted: false,
      createdDateTime: "2021-01-01T00:00:00",
      updatedDateTime: "2021-01-01T00:00:00",
    },
    {
      list_LiveWithID: 6,
      value: "Family",
      isDeleted: false,
      createdDateTime: "2021-01-01T00:00:00",
      updatedDateTime: "2021-01-01T00:00:00",
    },
    {
      list_LiveWithID: 7,
      value: "Parents",
      isDeleted: false,
      createdDateTime: "2021-01-01T00:00:00",
      updatedDateTime: "2021-01-01T00:00:00",
    },
  ]);

  const mapIndexToItem = (curIndex, obj) => {
    var selectedItem = [...obj.slice(curIndex - 1, curIndex)];
    return selectedItem[0];
  };

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
            Live with
          </FormControl.Label>
          {isEditMode ? (
            <Select
              fontFamily={
                Platform.OS === "ios" ? "Helvetica" : typography.android
              }
              fontSize="lg"
              minW="100%"
              // Peforms setDescription and setId
              onValueChange={(itemValue) => {
                setLiveWithDescription(
                  mapIndexToItem(itemValue, liveWithOptions).value
                );
                setLiveWithListId(itemValue);
              }}
              placeholder={liveWithDescription}
              selectedValue={liveWithDescription}
              _selectedItem={{
                endIcon: (
                  <CheckIcon
                    size="5"
                    fontFamily={
                      Platform.OS === "ios" ? "Helvetica" : typography.android
                    }
                    fontSize="lg"
                    color={colors.pink}
                  />
                ),
              }}
            >
              {/* Map Issue Resolved Reference: https://github.com/GeekyAnts/NativeBase/issues/4543 */}
              {liveWithOptions.map((item) => (
                <Select.Item
                  label={item.value}
                  value={item.list_LiveWithID}
                  key={item.list_LiveWithID}
                />
              ))}
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
              value={liveWithDescription}
              w="100%"
            />
          )}
        </HStack>
      </FormControl>
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
            Education
          </FormControl.Label>
          {isEditMode ? (
            <Select
              fontFamily={
                Platform.OS === "ios" ? "Helvetica" : typography.android
              }
              fontSize="lg"
              minW="100%"
              // Peforms setDescription and setId
              onValueChange={(itemValue) => {
                setEducationDescription(
                  mapIndexToItem(itemValue, educationOptions).value
                );
                setEducationListId(itemValue);
              }}
              placeholder={educationDescription}
              selectedValue={educationDescription}
              _selectedItem={{
                endIcon: (
                  <CheckIcon
                    size="5"
                    fontFamily={
                      Platform.OS === "ios" ? "Helvetica" : typography.android
                    }
                    fontSize="lg"
                    color={colors.pink}
                  />
                ),
              }}
            >
              {/* Map Issue Resolved Reference: https://github.com/GeekyAnts/NativeBase/issues/4543 */}
              {educationOptions.map((item) => (
                <Select.Item
                  label={item.value}
                  value={item.list_EducationID}
                  key={item.list_EducationID}
                />
              ))}
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
              value={educationDescription}
              w="100%"
            />
          )}
        </HStack>
      </FormControl>
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
            Occupation
          </FormControl.Label>
          {isEditMode ? (
            <Select
              fontFamily={
                Platform.OS === "ios" ? "Helvetica" : typography.android
              }
              fontSize="lg"
              minW="100%"
              // Peforms setDescription and setId
              onValueChange={(itemValue) => {
                setOccupationDescription(
                  mapIndexToItem(itemValue, occupationOptions).value
                );
                setOccupationListId(itemValue);
              }}
              placeholder={occupationDescription}
              selectedValue={occupationDescription}
              _selectedItem={{
                endIcon: (
                  <CheckIcon
                    size="5"
                    fontFamily={
                      Platform.OS === "ios" ? "Helvetica" : typography.android
                    }
                    fontSize="lg"
                    color={colors.pink}
                  />
                ),
              }}
            >
              {/* Map Issue Resolved Reference: https://github.com/GeekyAnts/NativeBase/issues/4543 */}
              {occupationOptions.map((item) => (
                <Select.Item
                  label={item.value}
                  value={item.list_OccupationID}
                  key={item.list_OccupationID}
                />
              ))}
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
              value={occupationDescription}
              w="100%"
            />
          )}
        </HStack>
      </FormControl>
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
            Religion
          </FormControl.Label>
          {isEditMode ? (
            <Select
              fontFamily={
                Platform.OS === "ios" ? "Helvetica" : typography.android
              }
              fontSize="lg"
              minW="100%"
              // Peforms setDescription and setId
              onValueChange={(itemValue) => {
                setReligionDescription(
                  mapIndexToItem(itemValue, religionOptions).value
                );
                setReligionListId(itemValue);
              }}
              placeholder={religionDescription}
              selectedValue={religionDescription}
              _selectedItem={{
                endIcon: (
                  <CheckIcon
                    size="5"
                    fontFamily={
                      Platform.OS === "ios" ? "Helvetica" : typography.android
                    }
                    fontSize="lg"
                    color={colors.pink}
                  />
                ),
              }}
            >
              {/* Map Issue Resolved Reference: https://github.com/GeekyAnts/NativeBase/issues/4543 */}
              {religionOptions.map((item) => (
                <Select.Item
                  label={item.value}
                  value={item.list_ReligionID}
                  key={item.list_ReligionID}
                />
              ))}
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
              value={religionDescription}
              w="100%"
            />
          )}
        </HStack>
      </FormControl>
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
            Pet
          </FormControl.Label>
          {isEditMode ? (
            <Select
              fontFamily={
                Platform.OS === "ios" ? "Helvetica" : typography.android
              }
              fontSize="lg"
              minW="100%"
              // Peforms setDescription and setId
              onValueChange={(itemValue) => {
                setPetDescription(
                  mapIndexToItem(itemValue, petOptions).value
                );
                setPetListId(itemValue);
              }}
              placeholder={petDescription}
              selectedValue={petDescription}
              _selectedItem={{
                endIcon: (
                  <CheckIcon
                    size="5"
                    fontFamily={
                      Platform.OS === "ios" ? "Helvetica" : typography.android
                    }
                    fontSize="lg"
                    color={colors.pink}
                  />
                ),
              }}
            >
              {/* Map Issue Resolved Reference: https://github.com/GeekyAnts/NativeBase/issues/4543 */}
              {petOptions.map((item) => (
                <Select.Item
                  label={item.value}
                  value={item.list_PetID}
                  key={item.list_PetID}
                />
              ))}
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
              value={petDescription}
              w="100%"
            />
          )}
        </HStack>
      </FormControl>
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
            Diet
          </FormControl.Label>
          {isEditMode ? (
            <Select
              fontFamily={
                Platform.OS === "ios" ? "Helvetica" : typography.android
              }
              fontSize="lg"
              minW="100%"
              // Peforms setDescription and setId
              onValueChange={(itemValue) => {
                setDietDesciption(
                  mapIndexToItem(itemValue, dietOptions).value
                );
                setDietListId(itemValue);
              }}
              placeholder={dietDesciption}
              selectedValue={dietDesciption}
              _selectedItem={{
                endIcon: (
                  <CheckIcon
                    size="5"
                    fontFamily={
                      Platform.OS === "ios" ? "Helvetica" : typography.android
                    }
                    fontSize="lg"
                    color={colors.pink}
                  />
                ),
              }}
            >
              {/* Map Issue Resolved Reference: https://github.com/GeekyAnts/NativeBase/issues/4543 */}
              {dietOptions.map((item) => (
                <Select.Item
                  label={item.value}
                  value={item.list_DietID}
                  key={item.list_DietID}
                />
              ))}
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
              value={dietDesciption}
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
