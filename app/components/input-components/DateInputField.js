// Libs
import React, { useState, useEffect } from 'react';
import {
  Platform,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Icon, VStack } from 'native-base';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';

// Configuration
import typography from 'app/config/typography';
import colors from 'app/config/colors';

// Hook
import formatDateTime from 'app/hooks/useFormatDateTime.js';

// Components
import ErrorMessage from 'app/components/ErrorMessage';
import RequiredIndicator from '../RequiredIndicator';

// Utilities
import { formatDate, formatTimeAMPM } from 'app/utility/miscFunctions';

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
  mode='date',
  placeholder=mode == 'date' ? 'Select date' : 'Select time',
  allowNull=false,
  dateForTime,
  centerDate=false
}) {
  const [show, setShow] = useState(false);

  // This state is used to track if the component is in its first render
  const [isFirstRender, setIsFirstRender] = useState(true);

  // This state is used to track the error state of this component via validation
  const [isError, setIsError] = useState({
    error: false,
    errorMsg: '',
  });

  // Earliest year user can be born (150 years ago)
  const minimumDOB = new Date();
  minimumDOB.setFullYear(minimumDOB.getFullYear() - 150);

  // Latest year user can be born (15 years ago)
  const maximumDOB = new Date();
  maximumDOB.setFullYear(maximumDOB.getFullYear() - 15);

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
    if(event == null || event.type != 'dismissed') {
      handleFormData(selected);
      validation();
    }
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

  const setFieldText = () => {
    if(value != null) {
      return mode == 'date' ? formatDateTime(value, true) : formatTimeAMPM(value);
    }  else {
      return placeholder;
    }
  }

  const clearDate = () => {
    value = null;
    onChangeData(null, null)
  }

  return (
    <View style={styles.componentContainer}>
        {title ? (
          <Text style={styles.titleMsg}>
            {title}:{isRequired ? <RequiredIndicator/> : ''}
          </Text>
        ) : (
          <></>
        )}
        <View style={styles.dateWrapper}>
            <TouchableOpacity style={[styles.dateContainer, {alignItems: allowNull && !centerDate ? 'flex-start' : 'center'}]} onPress={showPicker}>
              <Text style={[styles.textField]}>{setFieldText()}</Text>
            </TouchableOpacity>
            {allowNull && value != null? (
              <TouchableOpacity 
                onPress={clearDate} 
                disabled={value==null}
                activeOpacity={value==null ? 1 : 0.5}
                style={styles.resetIcon}
                >
                <Icon 
                  as={
                    <MaterialIcons 
                    name="close" 
                    />
                  } 
                  size={6}    
                  style={{alignSelf: 'flex-end', marginRight: 5}} 
                />
              </TouchableOpacity>
            ) : null}
        </View>
        {show && (
          <DateTimePicker
            testID="dateTimePicker"
            value={value || dateForTime || new Date()}
            display="default"
            mode={mode}
            onChange={(onChangeData)}
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
    </View>
  );
}

DateInputField.defaultProps = {
  isRequired: false,
  selectionMode: 'default',
  value: new Date(),
};

const styles = StyleSheet.create({
  componentContainer: {
    flexDirection: 'column',
    marginTop: 5,
    justifyContent: 'flex-start',
  },
  titleMsg: {
    fontSize: 13.5,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 10,
    color: colors.light_gray2,
    fontFamily: Platform.OS === 'ios' ? typography.ios : typography.android,
  },
  textField: {
    fontSize: 16,
    textAlign: 'left',
    color: colors.black_var1,
    fontFamily: Platform.OS === 'ios' ? typography.ios : typography.android,
    paddingHorizontal: 10,
  },
  dateWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',    
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderRadius: 25,
    borderColor: colors.light_gray3,
  },
  dateContainer: {
    width: '90%',    
    borderTopLeftRadius: 25, 
    borderBottomLeftRadius: 25,
    height: 50, 
    justifyContent: 'center'
  },
  resetIcon: {
    width: '10%', 
    justifyContent: 'flex-end',
    borderTopRightRadius: 25,
    borderBottomRightRadius: 25
  }
});

export default DateInputField;
