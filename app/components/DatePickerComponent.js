import React, { useState } from 'react';
import { Box, FormControl, Text, Input, Pressable } from 'native-base';
// import colors from 'app/config/colors';
import { ScrollView, Platform, TouchableOpacity } from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import TextField from '@mui/material/TextField';

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
  ) : Platform.OS === 'web' ? (
    <Box>
      <FormControl.Label>{label} </FormControl.Label>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          value={value}
          onChange={handleFormData(page, field)}
          renderInput={(params) => <TextField {...params} />}
        />
      </LocalizationProvider>
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
