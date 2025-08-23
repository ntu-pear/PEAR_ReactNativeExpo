
import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  Box, Center, VStack, AspectRatio, Image, Button,
  Actionsheet, useDisclose, Icon
} from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
import userApi from 'app/api/user';

const FALLBACK =
  'https://res.cloudinary.com/dbpearfyp/image/upload/v1634523641/User/Adeline_Tan_Sxxxx515G/ProfilePicture/ffo5oc4jhurmtjjhqcib.jpg';

export default function AccountPhotoScreen() {
  const [uri, setUri] = useState(null);
  const [busy, setBusy] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclose();

  const load = async () => {
    try {
      const r = await userApi.getProfilePicV1();
      const raw = r?.data?.url || r?.data?.image_url || r?.data?.profile_pic_url || null;
      const clean =
        (typeof raw === 'string' && raw.trim() && /^https?:\/\//.test(raw)) ? raw : null;
      setUri(clean);
    } catch {}
  };

  useEffect(() => { load(); }, []);

  const pickAndUpload = async () => {
    onClose();
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== 'granted') {
      Alert.alert('Profile Photo', 'Permission to access photos is required.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    if (res.canceled) return;

    const a = res.assets[0];
    const file = { uri: a.uri, name: a.fileName || 'profile.jpg', type: a.mimeType || 'image/jpeg' };

    try {
      setBusy(true);
      const up = await userApi.uploadProfilePicV1(file);
      if (!up?.ok) throw new Error(up?.data?.detail || 'Upload failed.');
      await load();
      Alert.alert('Profile Photo', 'Uploaded successfully.');
    } catch (e) {
      Alert.alert('Profile Photo', e.message || 'Upload failed.');
    } finally {
      setBusy(false);
    }
  };

  const removePhoto = async () => {
    onClose();
    Alert.alert('Remove Photo', 'Are you sure you want to remove your profile picture?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            setBusy(true);
            const del = await userApi.deleteProfilePicV1();
            if (!del?.ok) throw new Error(del?.data?.detail || 'Delete failed.');
            setUri(null);
            Alert.alert('Profile Photo', 'Removed successfully.');
          } catch (e) {
            Alert.alert('Profile Photo', e.message || 'Delete failed.');
          } finally {
            setBusy(false);
          }
        }
      }
    ]);
  };

  return (
    <Center flex={1} px="6">
      <VStack space="6" w="full" maxW="420">
        <AspectRatio ratio={1} w="full">
          <Image
            w="100%"
            h="100%"
            borderRadius="full"
            source={{ uri: uri || FALLBACK }}
            alt="profile_photo"
          />
        </AspectRatio>

        <Button
          isDisabled={busy}
          onPress={onOpen}
          startIcon={<Icon as={MaterialIcons} name="edit" size="sm" />}
        >
          Edit Profile Picture
        </Button>

        <Actionsheet isOpen={isOpen} onClose={onClose}>
          <Actionsheet.Content>
            <Actionsheet.Item
              startIcon={<Icon as={MaterialIcons} name="photo-camera" size="sm" />}
              onPress={pickAndUpload}
              isDisabled={busy}
            >
              Change Photo
            </Actionsheet.Item>
            <Actionsheet.Item
              startIcon={<Icon as={MaterialIcons} name="delete-outline" size="sm" color="red.500" />}
              _text={{ color: 'red.500' }}
              onPress={removePhoto}
              isDisabled={busy || !uri}
            >
              Remove Photo
            </Actionsheet.Item>
          </Actionsheet.Content>
        </Actionsheet>
      </VStack>
    </Center>
  );
}
