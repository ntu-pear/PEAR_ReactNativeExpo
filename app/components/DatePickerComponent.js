import React, { useState } from 'react';
import { Box, FormControl, Text, Input, Pressable } from 'native-base';
// import colors from 'app/config/colors';
import { ScrollView, Platform, TouchableOpacity } from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';

function DatePickerComponent({
  label,
  value,
  page,
  field,
  handleFormData,
  show,
  setShow,
}) {
  // handle state of picker for android
  const showPicker = (input) => (e) => {
    setShow((prevState) => ({
      ...prevState,
      [input]: true,
    }));
  };

  return Platform.OS === 'ios' ? (
    <Box>
      <FormControl.Label>{label} </FormControl.Label>
      <DateTimePicker value={value} onChange={handleFormData(page, field)} />
    </Box>
  ) : (
    <Box>
      <Pressable onPress={showPicker(field)}>
        <FormControl.Label>{label} </FormControl.Label>
        <Input isDisabled placeholder={value.toISOString().split('T')[0]} />
      </Pressable>
      {show[field] ? (
        <DateTimePicker value={value} onChange={handleFormData(page, field)} />
      ) : (
        <></>
      )}
    </Box>
  );
}

export default DatePickerComponent;
