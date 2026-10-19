import React from 'react';
import {
  Dimensions,
  TouchableOpacity,
  Platform,
  View,
  StyleSheet,
} from 'react-native';
import { Box, Text } from 'native-base';
import colors from 'app/config/colors';
import { useNavigation } from '@react-navigation/native';

function PatientProfileCard(props) {
  const {
    vectorIconComponent,
    text,
    routes,
    patientProfile,
    patientId,
    style,
    testID,
  } = props;

  const navigation = useNavigation();

  const handleOnPressToNextScreen = () => {
    navigation.navigate(routes, {
      patientProfile: patientProfile,
      patientId: patientId ?? patientProfile?.patientID ?? patientProfile?.id,
    });
  };

  const SCREEN_HEIGHT = Dimensions.get('window').height;

  return (
    <TouchableOpacity
      onPress={handleOnPressToNextScreen}
      disabled={!text}
      testID={testID}
      style={[
        styles.container,
        text
          ? {
              minHeight: Math.max(120, Math.min(160, SCREEN_HEIGHT * 0.1 + 20)),
            }
          : null,
        style,
      ]}
    >
      {vectorIconComponent}
      <Text
        fontSize={Math.max(14, Math.min(18, SCREEN_HEIGHT * 0.013))}
        mt={2}
        color={colors.black}
        textAlign="center"
        flexWrap="wrap"
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.pink,
    borderWidth: 1,
    borderRadius: 12,
    flex: 1,
    paddingVertical: 8,
    margin: '3%',
    aspectRatio: 1.1,
  },
});

export default PatientProfileCard;
