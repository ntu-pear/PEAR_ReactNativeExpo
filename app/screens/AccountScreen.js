// Libs
import React, { useContext, useRef, useState, useEffect } from 'react';
import { Dimensions, Text } from 'react-native';
import requestDeadline from 'app/utility/requestDeadline';
import { currentUserId } from 'app/utility/medicationAdminister';
import { useIsFocused } from '@react-navigation/native';
import { VStack, Box } from 'native-base';
import AuthContext from 'app/auth/context';
import routes from 'app/navigation/routes';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Components
import AppButton from 'app/components/AppButton';
import authStorage from 'app/auth/authStorage';
import AccountCard from 'app/components/AccountCard';
import ProfileNameButton from 'app/components/ProfileNameButton';
import ActivityIndicator from 'app/components/ActivityIndicator';

// API
import userApi from 'app/api/user';

// Utilities
import patientDraft from 'app/utility/patientDraft';

// Configurations
import colors from 'app/config/colors';

function AccountScreen(props) {
  const [readError, setReadError] = useState('');
  const [reload, setReload] = useState(0);
  const generation = useRef(0);
  const [isLoading, setIsLoading] = useState(false);
  const { user, setUser } = useContext(AuthContext);
  const { navigation } = props;
  const account = user || {};
  const actorId = currentUserId(account);
  const SCREEN_WIDTH = Dimensions.get('window').width;

  const onPressLogOut = async () => {
    console.log('Logging out!');
    userApi
      .logoutUser()
      .then(() => authStorage.removeToken())
      .then(() => patientDraft.clearDraft())
      .then(() => setUser(null))
      .catch((error) => console.error('Logout failed:', error));
    // console.log('Logging out!');
    // setUser(null);
    // await authStorage.removeToken();
  };

  const focused = useIsFocused();
  useEffect(() => {
    if (!focused) {
      return;
    }
    const current = ++generation.current;
    let active = true;
    setIsLoading(true);
    setReadError('');
    const read = async () => {
      try {
        const res = await requestDeadline(
          Promise.resolve().then(() => userApi.getUser()),
        );
        if (!active || current !== generation.current) {
          return;
        }
        if (!res?.ok) {
          throw new Error(
            res?.status === 401
              ? 'Your session could not be verified. Sign in again.'
              : 'Account could not be refreshed. Check the VPN connection and retry.',
          );
        }
        const next = res.data?.data ?? res.data;
        if (
          !next ||
          Array.isArray(next) ||
          typeof next !== 'object' ||
          !currentUserId(next) ||
          String(currentUserId(next)) !== String(actorId)
        ) {
          throw new Error(
            'The account response did not match the signed-in user.',
          );
        }
        setUser(next);
      } catch (error) {
        if (active && current === generation.current) {
          setReadError(
            error.message || 'Account could not be refreshed. Please retry.',
          );
        }
      } finally {
        if (active && current === generation.current) {
          setIsLoading(false);
        }
      }
    };
    read();
    return () => {
      active = false;
      generation.current += 1;
    };
  }, [actorId, setUser, focused, reload]);

  const handleOnPress = () => {
    navigation.push(routes.ACCOUNT_VIEW, { ...user });
  };

  return (
    <VStack w="100%" h="100%" alignItems="center">
      <ActivityIndicator visible={isLoading} />
      {readError ? (
        <>
          <Text accessibilityRole="alert" testID="account_read_error">
            {readError}
          </Text>
          <AppButton
            title="Retry account"
            onPress={() => setReload((n) => n + 1)}
          />
        </>
      ) : null}
      <ProfileNameButton
        profilePicture={
          typeof account.profilePicture === 'string'
            ? account.profilePicture
            : ''
        }
        profileLineOne={
          (account.preferredName ||
            account.firstName ||
            account.email ||
            'User') + ''
        }
        profileLineTwo={(account.roleName || account.role || '') + ''}
        size={SCREEN_WIDTH / 5.5}
        isPatient={false}
        // isVertical={false}
        handleOnPress={handleOnPress}
      />

      <VStack w="90%" flexWrap="wrap" mb="1">
        <AccountCard
          vectorIconComponent={<MaterialCommunityIcons name="cog" />}
          text="Settings"
          navigation={navigation}
          routes={routes.SETTINGS}
        />
        <AccountCard
          vectorIconComponent={<MaterialCommunityIcons name="information" />}
          text="About"
          navigation={navigation}
          routes={routes.ABOUT}
        />
      </VStack>
      <Box w="90%" mx="auto" mt="5">
        <AppButton title="Logout" color="red" onPress={onPressLogOut} />
      </Box>
    </VStack>
  );
}

export default AccountScreen;
