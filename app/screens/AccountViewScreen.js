import React, { useCallback, useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import {
  Image,
  AspectRatio,
  ScrollView,
  Box,
  Pressable,
  Icon,
  Badge,
} from 'native-base';
import DefaultImage from 'app/assets/placeholder.png';
import userApi from 'app/api/user';
import AuthContext from 'app/auth/context';
import routes from 'app/navigation/routes';
import ActivityIndicator from 'app/components/ActivityIndicator';
import InformationCard from 'app/components/InformationCard';
import AppButton from 'app/components/AppButton';
import useCareRead from 'app/hooks/useCareRead';
import { requireRead } from 'app/utility/careReadResults';
import { currentUserId } from 'app/utility/medicationAdminister';
import requestDeadline from 'app/utility/requestDeadline';
import layout from 'app/config/layout';

export default function AccountViewScreen({ navigation }) {
  const { user } = useContext(AuthContext) || {};
  const actor = String(currentUserId(user));
  const load = useCallback(async () => {
    const response = await requestDeadline(userApi.getUser());
    requireRead(response, 'personal information');
    if (!actor || String(currentUserId(response.data)) !== actor) {
      throw new Error('Your account identity could not be verified.');
    }
    // Profile and photo currently have separate service contracts.
    let photo = null;
    try {
      const result = await requestDeadline(userApi.getProfilePicV1());
      const raw =
        result?.data?.url ||
        result?.data?.image_url ||
        result?.data?.profile_pic_url;
      if (result?.ok && typeof raw === 'string' && /^https?:\/\//.test(raw)) {
        photo = raw;
      }
    } catch {
      /* The neutral placeholder remains available. */
    }
    return { profile: response.data, photo };
  }, [actor]);
  const state = useCareRead(actor, load, !!actor);
  if (state.loading) {
    return <ActivityIndicator visible />;
  }
  if (state.error) {
    return (
      <View style={layout.formContent}>
        <Text accessibilityRole="alert">{state.error}</Text>
        {state.retry ? (
          <AppButton
            title="Retry personal information"
            color="green"
            onPress={state.reload}
          />
        ) : null}
      </View>
    );
  }
  const p = state.data.profile;
  const nric = typeof p.nric === 'string' ? p.nric : '';
  const gender = String(p.nric_Gender || p.gender || '').toUpperCase();
  const rows = [
    { label: 'Preferred Name', value: p.preferredName },
    { label: 'Contact Number', value: p.contactNo },
    {
      label: 'Full Name',
      value:
        p.nric_FullName || [p.firstName, p.lastName].filter(Boolean).join(' '),
    },
    { label: 'Role', value: p.roleName || p.role },
    { label: 'NRIC', value: nric.replace(/\d{4}(\d{3})/, 'xxxx$1') },
    {
      label: 'Gender',
      value: ['F', 'FEMALE'].includes(gender)
        ? 'FEMALE'
        : ['M', 'MALE'].includes(gender)
        ? 'MALE'
        : null,
    },
    { label: 'DOB', value: p.nric_DateOfBirth || p.dob },
    { label: 'Email', value: p.email },
    { label: 'Address', value: p.nric_Address || p.address },
  ];
  return (
    <ScrollView style={layout.page} contentContainerStyle={layout.formContent}>
      <AspectRatio w="80%" maxW={240} ratio={1} mb="6" alignSelf="center">
        <Box w="100%" h="100%">
          <Pressable
            testID="account-edit-photo"
            accessibilityRole="button"
            accessibilityLabel="Edit profile photo"
            onPress={() => navigation.navigate(routes.ACCOUNT_PHOTO)}
            style={styles.photo}
          >
            <Image
              w="100%"
              h="100%"
              borderRadius="full"
              source={
                state.data.photo ? { uri: state.data.photo } : DefaultImage
              }
              alt="Profile photo"
            />
          </Pressable>
          <Badge
            pointerEvents="none"
            position="absolute"
            right="3"
            bottom="3"
            rounded="full"
            bg="primary.600"
            p="2"
          >
            <Icon
              as={MaterialIcons}
              name="photo-camera"
              color="white"
              size="sm"
            />
          </Badge>
        </Box>
      </AspectRatio>
      <InformationCard
        title="Personal Information"
        displayData={rows}
        unMaskedNRIC={nric}
        handleOnPress={() =>
          navigation.push(routes.ACCOUNT_EDIT, {
            ...p,
            userData: rows,
            unMaskedUserNRIC: nric,
          })
        }
      />
    </ScrollView>
  );
}
const styles = StyleSheet.create({ photo: { width: '100%', height: '100%' } });
