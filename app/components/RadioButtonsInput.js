// Libs
import React, { useState, useEffect } from 'react';
import { Platform, StyleSheet, View, Text } from 'react-native';
import { VStack, HStack } from 'native-base';
import { RadioButton } from 'react-native-paper';

// Configurations
import typography from 'app/config/typography';
import colors from 'app/config/colors';

// Components
import ErrorMessage from 'app/components/ErrorMessage';
import RequiredIndicator from './RequiredIndicator';

function RadioButtonInput({
  isRequired,
  title,
  value,
  dataArray,
  onChangeData,
  onChildData,
}) {

  // This state is used to track if the component is in its first render
  const [isFirstRender, setIsFirstRender] = useState(true);

  // This state is used to track the error state of this component via validation
  const [isError, setIsError] = useState({
    error: false,
    errorMsg: '',
  });

  const validation = () => {
    let message = '';
    if (isRequired && (value === null || value === undefined)) {
      message = 'Please select one option.';
    } else {
      message = '';
    }
    setIsError({
      ...isError,
      error: message ? true : false,
      errorMsg: message,
    });
  };

  const onChangeSelection = (selectionData) => {
    onChangeData(selectionData);
    validation();
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
      error: isRequired && value.length === 0,
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
    <View style={styles.componentContainer}>
      <VStack>
        <Text style={styles.titleMsg}>
        {title}:{isRequired ? <RequiredIndicator/> : ''}
        </Text>
        <RadioButton.Group value={value} onValueChange={onChangeSelection}>
          <HStack space={1} flexWrap="wrap">
            {dataArray.map((item) => (
              <View style={styles.radioButtonContainer} key={item.value}>
                <RadioButton.Item
                  key={item.value}
                  value={item.value}
                  label={item.label}
                  color={colors.green}
                  style={styles.radioButton}
                />
              </View>
            ))}
          </HStack>
        </RadioButton.Group>
        {isError.errorMsg ? (
          <ErrorMessage message={isError.errorMsg} visible={true} />
        ) : null}
      </VStack>
    </View>
  );
}

const styles = StyleSheet.create({
  componentContainer: {
    display: 'flex',
    width: '100%',
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
  radioButtonContainer: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButton: {
    paddingLeft: 10,
    paddingRight: 0,
    paddingVertical: 0,
  },
});

export default RadioButtonInput;
