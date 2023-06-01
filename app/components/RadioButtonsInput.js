import React, { useState, useEffect } from 'react';
import { Platform, StyleSheet, View, Text } from 'react-native';
import { VStack, HStack, Radio } from 'native-base';
import typography from 'app/config/typography';
import colors from 'app/config/colors';
import ErrorMessage from 'app/components/ErrorMessage';

function RadioButtonInput({
  isRequired,
  title,
  value,
  dataArray,
  onChangeData,
  onChildData,
}) {
  const requiredIndicator = <Text style={styles.RequiredIndicator}> *</Text>;
  const [isFirstRender, setIsFirstRender] = useState(true);
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
    <View style={styles.ComponentContainer}>
      <VStack>
        <Text style={styles.TitleMsg}>
          {title}:{isRequired ? requiredIndicator : ''}
        </Text>
        <Radio.Group value={value} onChange={onChangeSelection}>
          <HStack space={4} flexWrap="wrap">
            {dataArray.map((item) => (
              <View paddingBottom={10} key={item.value}>
                <Radio
                  key={item.value}
                  value={item.value}
                  size="sm"
                  _icon={{ color: colors.green }}
                  _checked={{
                    borderColor: colors.green,
                  }}
                >
                  {item.label}
                </Radio>
              </View>
            ))}
          </HStack>
        </Radio.Group>
        {isError.errorMsg ? (
          <ErrorMessage message={isError.errorMsg} visible={true} />
        ) : null}
      </VStack>
    </View>
  );
}

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
  RequiredIndicator: {
    color: colors.red,
  },
});

export default RadioButtonInput;
