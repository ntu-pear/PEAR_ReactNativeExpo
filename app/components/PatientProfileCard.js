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
  const { vectorIconComponent, text, routes, patientProfile, patientId } =
    props;

  const navigation = useNavigation();

  const handleOnPressToNextScreen = () => {
    navigation.navigate(routes, {
      patientId: patientId,
      ...patientProfile,
    });
  };

  const SCREEN_HEIGHT = Dimensions.get('window').height;

  return (
    <TouchableOpacity
      onPress={handleOnPressToNextScreen}
      testID="patientProfileCard"
      style={styles.container}
      
    >
        
        {vectorIconComponent}
        <Text
          fontSize={SCREEN_HEIGHT * 0.013}
          mt={SCREEN_HEIGHT * 0.01}
          color={colors.black_var1}
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
    margin:'4%',
    aspectRatio: 1.1,
  },
});

export default PatientProfileCard;
