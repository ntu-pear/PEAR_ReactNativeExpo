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
    >
      <Box
        alignItems="center"
        rounded="lg"
        w={Platform.OS === 'web' ? '110' : '100%'}
        h={Platform.OS === 'web' ? '90' : '100%'}
      >
        <Box
          alignItems="center"
          justifyContent="center"
          rounded="xl"
          w={Platform.OS === 'web' ? '100%' : '50%'}
          h={Platform.OS === 'web' ? '100%' : '60%'}
          borderWidth="1"
          // borderColor={colors.primary_gray}
          borderColor={colors.pink}
        >
          {vectorIconComponent}
        </Box>
        <View style={styles.container}>
          <Text
            fontSize={SCREEN_HEIGHT * 0.013}
            mt={SCREEN_HEIGHT * 0.01}
            color={colors.black_var1}
            textAlign="center"
            lineHeight="xs"
            flex="1"
            flexWrap="wrap"
          >
            {text}
          </Text>
        </View>
      </Box>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
});

export default PatientProfileCard;
