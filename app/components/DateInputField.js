// Libs
import React, { useState, useEffect } from 'react';
import {
  Platform,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { VStack } from 'native-base';
import DateTimePicker from '@react-native-community/datetimepicker';

// Configuration
import typography from 'app/config/typography';
import colors from 'app/config/colors';

// Components
import ErrorMessage from 'app/components/ErrorMessage';

function DateInputField({
  isRequired,
  selectionMode,
  title,
  handleFormData,
  value,
  minimumInputDate,
  maximumInputDate,
  onChildData,
  hideDayOfWeek,
}) {
  const [show, setShow] = useState(false);

  // This state is used to track if the component is in its first render
  const [isFirstRender, setIsFirstRender] = useState(true);

  // This state is used to track the error state of this component via validation
  const [isError, setIsError] = useState({
    error: false,
    errorMsg: '',
  });

  const listOfDays = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'];

  // Earliest year user can be born (150 years ago)
  const minimumDOB = new Date();
  minimumDOB.setFullYear(minimumDOB.getFullYear() - 150);

  // Latest year user can be born (15 years ago)
  const maximumDOB = new Date();
  maximumDOB.setFullYear(maximumDOB.getFullYear() - 15);

  const requiredIndicator = <Text style={styles.RequiredIndicator}> *</Text>;

  // Validation function for user input:
  // Error if:
  // 1) required but empty
  const validation = () => {
    let message = '';
    if (isRequired && value.toDateString() <= 0) {
      message = 'This field cannot be empty';
    } else {
      message = '';
    }
    setIsError({
      ...isError,
      error: message ? true : false,
      errorMsg: message,
    });
  };

  const onChangeData = (event, selected) => {
    setShow(false);
    handleFormData(selected);
    validation();
  };

  // Used to format the date to DD/MM/YYYY for display in the input field.
  const formatDate = (inputDate) => {
    let day, date, month, year;
    day = inputDate.getDay();
    date = inputDate.getDate();
    month = inputDate.getMonth() + 1;
    year = inputDate.getFullYear();
    date = date.toString().padStart(2, '0');
    month = month.toString().padStart(2, '0');

    return hideDayOfWeek
      ? `${date}/${month}/${year}`
      : `${listOfDays[day]}, ${date}/${month}/${year}`;
  };

  const showPicker = () => {
    setShow(true);
  };

  // This useEffect is used to track if the component is in its first render. This is mainly used to
  // ensure that the submission blocking in the parent component is active (as it is first rendered, user will not
  // likely have filled anything). This also ensures that since there is no input yet, the component error message
  // does not show until the user focuses and violates the validation with their input.
  useEffect(() => {
    onChildData ? onChildData(isFirstRender || isError.error) : null;
    setIsFirstRender(false);
    setIsError({
      ...isError,
      // error: isRequired && value.length === 0,
      error: isRequired && (value === '' || value === null),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // This is used to update the parent component that there is a validation error
  // validation passed via the onChildData prop.
  useEffect(() => {
    if (!isFirstRender) {
      onChildData ? onChildData(isError.error) : null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isError, onChildData]);

  return (
    <View style={styles.ComponentContainer}>
      <VStack>
        {title ? (
          <Text style={styles.TitleMsg}>
            {title}:{isRequired ? requiredIndicator : ''}
          </Text>
        ) : (
          <></>
        )}
        <View style={styles.pickerButton}>
          <TouchableOpacity onPress={() => showPicker()}>
            <Text style={styles.textField}>{formatDate(value)}</Text>
          </TouchableOpacity>
        </View>
        {show && (
          <DateTimePicker
            testID="dateTimePicker"
            value={value}
            display="default"
            mode="date"
            onChange={onChangeData}
            // if the selection mode is set to Date of Birth (DOB), fixed max and min years will be specified
            // else, the minimumInputDate and maximumInputDate will be used.
            // if there is no minimumInputDate or maximumInputDate specified in the prop, default DateTimePicker min and max dates will be used.
            minimumDate={
              selectionMode === 'DOB' ? minimumDOB : minimumInputDate
            }
            maximumDate={
              selectionMode === 'DOB' ? maximumDOB : maximumInputDate
            }
          />
        )}
        {isError.errorMsg ? (
          <ErrorMessage message={isError.errorMsg} visible={true} />
        ) : null}
      </VStack>
    </View>
  );
}

DateInputField.defaultProps = {
  isRequired: false,
  selectionMode: 'default',
  value: new Date(),
};

const styles = StyleSheet.create({
  ComponentContainer: {
    display: 'flex',
    width: '80%',
    // marginTop: 5,
    justifyContent: 'flex-start',
  },
  TitleMsg: {
    fontSize: 13.5,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 10,
    color: colors.light_gray2,
    fontFamily: Platform.OS === 'ios' ? typography.ios : typography.android,
  },
  pickerButton: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderRadius: 25,
    borderColor: colors.light_gray3,
  },
  textField: {
    fontSize: 18,
    textAlign: 'center',
    color: colors.black_var1,
    fontFamily: Platform.OS === 'ios' ? typography.ios : typography.android,
  },
  RequiredIndicator: {
    color: colors.red,
    fontSize: 18,
  },
});

export default DateInputField;
