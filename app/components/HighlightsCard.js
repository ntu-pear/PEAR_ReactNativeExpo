/* eslint-disable no-console */
import React from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { Text, Box, VStack, HStack } from 'native-base';
import colors from 'app/config/colors';
import routes from 'app/navigation/routes';
import ProfileNameButton from 'app/components/ProfileNameButton';
import { useNavigation } from '@react-navigation/native';

function HighlightsCard({ item, setModalVisible }) {
  const navigation = useNavigation();

  const goToPatientProfile = () => {
    if (Platform.OS === 'web') {
      // TODO: close modal and navigate
    } else {
      // Close Highlights Modal and navigate to PatientProfileScreen
      setModalVisible(false);
      navigation.push(routes.PATIENT_PROFILE, {
        id: item.patientInfo.patientId,
        patientProfile: null,
      });
    }
  };

  // 1. UPDATE getDescription - Change highlightTypeID to highlightType and add value parsing
  const getDescription = (element) => {
    let desc;

    // Parse the value from highlightJson
    let highlightJsonValue = '';
    try {
      if (element.highlightJson && typeof element.highlightJson === 'string') {
        const parsed = JSON.parse(element.highlightJson);
        highlightJsonValue = parsed.value || '';
      }
    } catch (error) {
      console.error('Error parsing highlightJson:', error);
    }

    // CHANGED: highlightTypeID → highlightType
    switch (element.highlightType) {
      case 'Prescription':
      case 'Medication':
        desc = 'New Prescription';
        break;
      case 'Allergy':
        desc = 'New Allergy';
        break;
      case 'ActivityExclusion':
        desc = 'New Activity Exclusion';
        break;
      case 'Vital':
      case 'AbnormalVital':
        desc = 'Abnormal Vital';
        break;
      case 'Problem':
        desc = 'Problem';
        break;
      case 'MedicalHistory':
        desc = 'New Medical Record';
        break;
      default:
        desc = 'Highlight';
        break;
    }

    // Add the value if it exists
    return highlightJsonValue ? `${desc} - ${highlightJsonValue}` : desc;
  };

  // 2. UPDATE getIcon - Change highlightTypeID to highlightType
  const getIcon = (element) => {
    let icon;

    // CHANGED: highlightTypeID → highlightType
    switch (element.highlightType) {
      case 'Prescription':
      case 'Medication':
        icon = (
          <MaterialCommunityIcons
            name="pill"
            size={20}
            color={colors.primary}
          />
        );
        break;
      case 'Allergy':
        icon = (
          <FontAwesome5 name="allergies" size={20} color={colors.primary} />
        );
        break;
      case 'ActivityExclusion':
        icon = (
          <MaterialCommunityIcons name="run" size={20} color={colors.primary} />
        );
        break;
      case 'Vital':
      case 'AbnormalVital':
        icon = (
          <MaterialCommunityIcons
            name="heart-pulse"
            size={20}
            color={colors.primary}
          />
        );
        break;
      case 'Problem':
        icon = (
          <MaterialCommunityIcons
            name="alert-circle"
            size={20}
            color={colors.primary}
          />
        );
        break;
      case 'MedicalHistory':
        icon = (
          <MaterialCommunityIcons
            name="file-document"
            size={20}
            color={colors.primary}
          />
        );
        break;
      default:
        icon = (
          <MaterialCommunityIcons
            name="bell"
            size={20}
            color={colors.primary}
          />
        );
        break;
    }

    return icon;
  };

  // 3. UPDATE handleNavigation - Change highlightTypeID to highlightType
  const handleNavigation = (element) => {
    setModalVisible(false);

    // CHANGED: highlightTypeID → highlightType
    switch (element.highlightType) {
      case 'Prescription':
      case 'Medication':
        console.log('Prescription');
        navigation.navigate(routes.PATIENT_PRESCRIPTION, {
          patientID: item.patientInfo.patientId,
        });
        break;
      case 'Allergy':
        console.log('Allergy');
        console.log('item.patientInfo.patientId', item.patientInfo.patientId);
        navigation.navigate(routes.PATIENT_ALLERGY, {
          patientId: item.patientInfo.patientId,
        });
        break;
      case 'ActivityExclusion':
        console.log('ActivityExclusion');
        navigation.navigate(routes.PATIENT_ROUTINE, {
          patientID: item.patientInfo.patientId,
        });
        break;
      case 'Vital':
      case 'AbnormalVital':
        console.log('Vital');
        navigation.navigate(routes.PATIENT_VITAL, {
          patientID: item.patientInfo.patientId,
        });
        break;
      case 'Problem':
        console.log('Problem');
        navigation.navigate(routes.PATIENT_PROBLEM_LOG, {
          patientID: item.patientInfo.patientId,
        });
        break;
      case 'MedicalHistory':
        console.log('MedicalHistory');
        navigation.navigate(routes.PATIENT_MEDICAL_HISTORY, {
          patientID: item.patientInfo.patientId,
        });
        break;
      default:
        console.log('Unknown type');
        break;
    }
  };

  const list = () => {
    return item.highlights.map((element) => (
      <View key={element.highlightID} style={styles.highlightsList}>
        <HStack w="100%" space={2} alignItems="center">
          {getIcon(element)}
          <TouchableOpacity onPress={() => handleNavigation(element)}>
            {/* Show description with count if more than 1 */}
            <Text fontSize="13">
              {getDescription(element)}
              {element.count > 1 ? ` (x${element.count})` : ''}
            </Text>
          </TouchableOpacity>
        </HStack>
      </View>
    ));
  };

  // Just above the return in HighlightsCard
  const rawPhoto = item.patientInfo.patientPhoto;

  // Treat missing, "string", empty, or obviously broken URLs as invalid
  const isValidPhoto =
  typeof rawPhoto === 'string' &&
  rawPhoto.trim().length > 0 &&
  rawPhoto.toLowerCase() !== 'string' &&
  (rawPhoto.startsWith('http://') || rawPhoto.startsWith('https://'));

  const safePhoto = isValidPhoto ? rawPhoto : null;
  return (
    <TouchableOpacity testID="highlightsCard" onPress={goToPatientProfile}>
      <Box
        w="100%"
        borderWidth="1"
        borderColor={colors.grey_lighter}
        rounded="lg"
        p="2"
        mt="3"
      >
        <HStack w="100%" space={3} flexWrap="wrap" mb="1">
          <VStack w="28%">
            {/* --- Replace Avatar and Text component with ProfileNameButton --- Justin */}
            <ProfileNameButton
              profilePicture={safePhoto}
              profileLineOne={item.patientInfo.patientName}
              handleOnPress={goToPatientProfile}
            />
          </VStack>
          <VStack w="68%" space={2}>
            {list()}
          </VStack>
        </HStack>
      </Box>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  highlightsList: {
    borderBottomWidth: 1,
    borderBottomColor: colors.grey_lighter,
  },
});

export default HighlightsCard;
