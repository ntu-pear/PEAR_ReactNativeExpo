import React from 'react';
import { Box, FormControl, Input, Pressable } from 'native-base';
import { Platform, StyleSheet } from 'react-native';

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
      {field == 'DOB' ? (
        <Box>
          <FormControl.Label
            _text={{
              fontFamily: `${
                Platform.OS === 'ios' ? typography.ios : typography.android
              }`,
              fontWeight: 'bold',
            }}
            w="100%"
          >
            {label}
          </FormControl.Label>
          <DateTimePicker
            value={value}
            display={'default'}
            mode={'date'}
            onChange={handleFormData(page, field)}
            minimumDate={minimumDOB}
            maximumDate={maximumDOB}
            placeHolderText="Select Date"
            style={styles.dateTimePickerStyle}
          />
        </Box>
      ) : field == 'StartDate' ? (
        <>
          <FormControl.Label
            _text={{
              fontFamily: `${
                Platform.OS === 'ios' ? typography.ios : typography.android
              }`,
              fontWeight: 'bold',
            }}
            w="100%"
          >
            {label}
          </FormControl.Label>

          <DateTimePicker
            value={value}
            display={'default'}
            onChange={handleFormData(page, field)}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            style={styles.dateTimePickerStyle}
          />
        </>
      ) : (
        <>
          {isChecked ? (
            <>
              <DateTimePicker
                value={value}
                display={'default'}
                onChange={handleFormData(page, field)}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                style={styles.dateTimePickerStyle}
              />
              {/* {value.getTime() === 0 ? (
                <ErrorMessage
                  visible
                  message="Please select the Date of Leaving." // quick fix for validation
                />
              ) : (
                <></>
              )} */}
            </>
          ) : (
            <></>
          )}
        </>
      )}
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
      {field == 'DOB' || field == 'StartDate' ? (
        <>
          <FormControl.Label>{label} </FormControl.Label>
          <Pressable onPress={showPicker(field)}>
            <Input
              color={colors.black_var1}
              borderRadius="25"
              height="50"
              fontFamily={
                Platform.OS === 'ios' ? typography.ios : typography.android
              }
              size="18"
              w="100%"
              editable={false}
              value={value.toDateString()}
            />
            {show[field] ? (
              field == 'DOB' ? (
                <DateTimePicker
                  value={value}
                  display={'default'}
                  onChange={handleFormData(page, field)}
                  minimumDate={minimumDOB}
                  maximumDate={maximumDOB}
                />
              ) : (
                <DateTimePicker
                  value={value}
                  display={'default'}
                  onChange={handleFormData(page, field)}
                  minimumDate={minimumDate}
                  maximumDate={maximumDate}
                />
              )
            ) : (
              <></>
            )}
          </Pressable>
        </>
      ) : (
        // field === 'DOL'
        <>
          {isChecked ? (
            <>
              <Pressable onPress={showPicker(field)}>
                <Input
                  color={colors.black_var1}
                  borderRadius="25"
                  height="50"
                  fontFamily={
                    Platform.OS === 'ios' ? typography.ios : typography.android
                  }
                  size="18"
                  w="100%"
                  editable={false}
                  value={
                    value.getTime() === 0
                      ? 'Please select a date.'
                      : value.toDateString()
                  }
                />
              </Pressable>
              {value.getTime() === 0 ? (
                <ErrorMessage
                  visible
                  message="Please select the Date of Leaving." // quick fix for validation
                />
              ) : (
                <></>
              )}
            </>
          ) : (
            <></>
          )}
          {show[field] ? (
            <DateTimePicker
              value={value}
              display={'default'}
              onChange={handleFormData(page, field)}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
            />
          ) : (
            <></>
          )}
        </>
      )}
    </Box>
  );
}
const styles = StyleSheet.create({
  dateTimePickerStyle: {
    padding: Platform.OS === 'ios' ? 30 : 60,
    width: '100%',
    fontSize: 20,
  },
});
export default DatePickerComponent;
