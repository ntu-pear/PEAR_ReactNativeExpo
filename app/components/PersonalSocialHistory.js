import React, { useState } from "react";
import { StyleSheet } from "react-native";
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

function PersonalSocialHistory() {
  const [isEditMode, setIsEditMode] = useState(false);
  let [service, setService] = useState("testhaha");

  return (
    <Stack alignItems="flex-start">
      <Text
        color={colors.black_var1}
        fontFamily="Helvetica"
        fontSize="2xl"
        fontWeight="semibold"
      >
        Social History
      </Text>
      <Text
        color={colors.primary_overlay_color}
        fontFamily="Helvetica"
        fontSize="md"
        fontWeight="hairline"
      >
        About
      </Text>
      <FormControl maxW="50%">
        <HStack space={2}>
          <FormControl.Label
            _text={{
              fontFamily: "Helvetica",
              fontSize: "lg",
              fontWeight: "thin",
            }}
          >
            Living with
          </FormControl.Label>
          {isEditMode ? (
            <Select
              fontFamily="Helvetica"
              fontSize="lg"
              label="hello"
              minW="100%"
              onValueChange={(itemValue) => setService(itemValue)}
              placeholder={service}
              selectedValue={service}
              variant="underlined"
              _selectedItem={{
                endIcon: (
                  <CheckIcon
                    size={5}
                    fontFamily="Helvetica"
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
              fontFamily="Helvetica"
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
        fontFamily="Helvetica"
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
