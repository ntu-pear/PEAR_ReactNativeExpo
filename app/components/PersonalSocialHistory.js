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
  Button
} from "native-base";
import colors from "../config/colors";
import typography from "../config/typography";

function PersonalSocialHistory( {socialHistory} ) {
  /*
   *  *** All States Related To <Select> Component ***
   */
  // Note: isEditMode is used to toggle between `Read-only` and `Write&Read` mode.
  const [isEditMode, setIsEditMode] = useState(false);
  const [liveWithListId, setLiveWithListId] = useState(socialHistory ? socialHistory.liveWithListId : null);
  const [educationListId, setEducationListId] = useState(
    socialHistory ?  socialHistory.educationListId : null
  );
  const [occupationListId, setOccupationListId] = useState(
    socialHistory ? socialHistory.occupationListId : null
  );
  const [religionListId, setReligionListId] = useState(
    socialHistory ? socialHistory.religionListId : null
  );
  const [petListId, setPetListId] = useState(socialHistory ? socialHistory.petListId : null);
  const [dietListId, setDietListId] = useState(socialHistory ? socialHistory.dietListId: null);
  const [exercise, setExercise] = useState(socialHistory ? socialHistory.exercise: null);
  const [sexuallyActive, setSexuallyActive] = useState(
    socialHistory? socialHistory.sexuallyActive : null
  );
  const [drugeUse, setDrugeUse] = useState(socialHistory ? socialHistory.drugeUse : null);
  const [caffeineUse, setCaffeineUse] = useState(socialHistory ? socialHistory.caffeineUse : null);
  const [alocholUse, setAlocholUse] = useState(socialHistory ? socialHistory.alocholUse : null);
  const [tobaccoUse, setTobaccoUse] = useState(socialHistory ? socialHistory.tobaccoUse : null);
  const [secondhandSmoker, setSecondhandSmoker] = useState(
    socialHistory ? socialHistory.secondhandSmoker : null
  );
  const [dietDesciption, setDietDesciption] = useState(
    socialHistory ? socialHistory.dietDescription : null
  );
  const [educationDescription, setEducationDescription] = useState(
    socialHistory ? socialHistory.educationDescription : null
  );
  const [liveWithDescription, setLiveWithDescription] = useState(socialHistory ? socialHistory.liveWithDescription : null);
  const [occupationDescription, setOccupationDescription] = useState(
    socialHistory ? socialHistory.occupationDescription : null
  );
  const [petDescription, setPetDescription] = useState(socialHistory ? socialHistory.petDescription : null);
  const [religionDescription, setReligionDescription] = useState(socialHistory ? socialHistory.religionDescription : null);
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

  /*
   * Common utility used to retrieve object of interest from list of Objects.
   * e.g. liveWithOptions = [{},...,{}]; will return selectedItem = liveWithOptions.slice(index-1, index)
   * Why index - 1? Refer to the mock data above, ID starts with `1`.
   */
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
              selectedValue={liveWithListId}
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
              value={socialHistory ? socialHistory.liveWithDescription : liveWithDescription}
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
              selectedValue={educationListId}
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
              value={socialHistory ? socialHistory.educationDescription : educationDescription}
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
              selectedValue={occupationListId}
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
              value={socialHistory ? socialHistory.occupationDescription : occupationDescription}
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
              selectedValue={religionListId}
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
              value={socialHistory ? socialHistory.religionDescription : religionDescription}
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
                setPetDescription(mapIndexToItem(itemValue, petOptions).value);
                setPetListId(itemValue);
              }}
              placeholder={petDescription}
              selectedValue={petListId}
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
              value={socialHistory ? socialHistory.petDescription : petDescription}
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
                setDietDesciption(mapIndexToItem(itemValue, dietOptions).value);
                setDietListId(itemValue);
              }}
              placeholder={dietDesciption}
              selectedValue={dietListId}
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
              value={socialHistory ? socialHistory.dietDescription : dietDesciption}
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
            Exercise
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
                setExercise(itemValue);
              }}
              placeholder={exercise === 0 || exercise === "0" ? "No" : "Yes"}
              selectedValue={exercise}
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
              <Select.Item label="Yes" value="0" />
              <Select.Item label="No" value="1" />
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
              value={socialHistory && parseInt(socialHistory.exercise) === 0 || exercise === "0" ? "No" : "Yes"}
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
            Sexually Active
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
                setSexuallyActive(itemValue);
              }}
              placeholder={
                sexuallyActive === 0 || sexuallyActive === "0" ? "No" : "Yes"
              }
              selectedValue={sexuallyActive}
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
              <Select.Item label="Yes" value="0" />
              <Select.Item label="No" value="1" />
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
              value={
                socialHistory && parseInt(socialHistory.sexuallyActive) === 0 || parseInt(sexuallyActive) === 0 ? "No" : "Yes"
              }
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
            Drug use
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
                setDrugeUse(itemValue);
              }}
              placeholder={drugeUse === 0 || drugeUse === "0" ? "No" : "Yes"}
              selectedValue={drugeUse}
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
              <Select.Item label="Yes" value="0" />
              <Select.Item label="No" value="1" />
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
              value={drugeUse === 0 || drugeUse === "0" ? "No" : "Yes"}
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
            Caffeine use
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
                setCaffeineUse(itemValue);
              }}
              placeholder={
                caffeineUse === 0 || caffeineUse === "0" ? "No" : "Yes"
              }
              selectedValue={caffeineUse}
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
              <Select.Item label="Yes" value="0" />
              <Select.Item label="No" value="1" />
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
              value={caffeineUse === 0 || caffeineUse === "0" ? "No" : "Yes"}
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
            Alcohol use
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
                setAlocholUse(itemValue);
              }}
              placeholder={
                alocholUse === 0 || alocholUse === "0" ? "No" : "Yes"
              }
              selectedValue={alocholUse}
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
              <Select.Item label="Yes" value="0" />
              <Select.Item label="No" value="1" />
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
              value={alocholUse === 0 || alocholUse === "0" ? "No" : "Yes"}
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
            Tobacco use
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
                setTobaccoUse(itemValue);
              }}
              placeholder={
                tobaccoUse === 0 || tobaccoUse === "0" ? "No" : "Yes"
              }
              selectedValue={tobaccoUse}
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
              <Select.Item label="Yes" value="0" />
              <Select.Item label="No" value="1" />
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
              value={tobaccoUse === 0 || tobaccoUse === "0" ? "No" : "Yes"}
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
            Secondhand smoker
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
                setSecondhandSmoker(itemValue);
              }}
              placeholder={
                secondhandSmoker === 0 || secondhandSmoker === "0"
                  ? "No"
                  : "Yes"
              }
              selectedValue={secondhandSmoker}
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
              <Select.Item label="Yes" value="0" />
              <Select.Item label="No" value="1" />
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
              value={
                secondhandSmoker === 0 || secondhandSmoker === "0"
                  ? "No"
                  : "Yes"
              }
              w="100%"
            />
          )}
        </HStack>
      </FormControl>
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
