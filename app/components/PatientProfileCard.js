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
import { useNavigate } from 'react-router-dom';

function PatientProfileCard(props) {
  const { vectorIconComponent, text, navigation, routes, patientProfile } =
    props;

  // useNavigate() hook cannot work on mobile
  // const navigate = Platform.OS === 'web' ? useNavigate() : null;

  const handleOnPressToNextScreen = () => {
    if (Platform.OS === 'web') {
      // TODO: (yapsiang) link to next screen via routes
      // console.log('route to: ' + '/' + routes);
      // navigate('/' + routes, { state: { ...patientProfile }});
    } else {
      navigation.push(routes, { ...patientProfile });
    }
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
          w="50%"
          h="60%"
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
