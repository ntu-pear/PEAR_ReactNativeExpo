import React, { useState, useEffect } from 'react';
import { Platform, StyleSheet, View, Text } from 'react-native';
import { VStack } from 'native-base';
import DateTimePicker from '@react-native-community/datetimepicker';
import typography from 'app/config/typography';
import colors from 'app/config/colors';
import { TouchableOpacity } from 'react-native';
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
}) {
  const [show, setShow] = useState(false);
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [isError, setIsError] = useState({
    error: false,
    errorMsg: '',
  });

  const minimumDOB = new Date();
  minimumDOB.setFullYear(minimumDOB.getFullYear() - 150);

  const maximumDOB = new Date();
  maximumDOB.setFullYear(maximumDOB.getFullYear() - 15);

  const minimumDate = new Date();
  minimumDate.setDate(minimumDate.getDate() - 30); // 30 days ago

  const maximumDate = new Date();
  maximumDate.setDate(maximumDate.getDate() + 30); // 30 days later

  const requiredIndicator = <Text style={styles.RequiredIndicator}> *</Text>;

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

  const formatDate = (inputDate) => {
    let date, month, year;

    date = inputDate.getDate();
    month = inputDate.getMonth() + 1;
    year = inputDate.getFullYear();
    date = date.toString().padStart(2, '0');
    month = month.toString().padStart(2, '0');

    return `${date}/${month}/${year}`;
  };

  const showPicker = () => {
    setShow(true);
  };

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

  useEffect(() => {
    if (!isFirstRender) {
      onChildData ? onChildData(isError.error) : null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isError, onChildData]);

  return (
    <View style={styles.ComponentContainer}>
      <VStack>
        <Text style={styles.TitleMsg}>
          {title}:{isRequired ? requiredIndicator : ''}
        </Text>
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
            minimumDate={
              selectionMode === 'DOB'
                ? minimumInputDate
                  ? minimumInputDate
                  : minimumDOB
                : minimumDate
            }
            maximumDate={
              selectionMode === 'DOB'
                ? maximumInputDate
                  ? maximumInputDate
                  : maximumDOB
                : maximumDate
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
    marginTop: 5,
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
  dateTimePickerStyle: {
    padding: Platform.OS === 'ios' ? 30 : 60,
    width: '100%',
    fontSize: 20,
  },
  pickerButton: {
    display: 'flex',
    justifyContent: 'flex-start',
    width: '50%',
    height: 50,
    borderWidth: 1,
    borderRadius: 25,
    borderColor: colors.light_gray3,
  },
  textField: {
    fontSize: 16,
    paddingVertical: '4.2%',
    paddingLeft: '5%',
    color: colors.black_var1,
    fontFamily: Platform.OS === 'ios' ? typography.ios : typography.android,
  },
  RequiredIndicator: {
    color: colors.red,
  },
});

export default DateInputField;
