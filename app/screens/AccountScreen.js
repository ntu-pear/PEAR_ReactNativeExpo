// Libs
import React, { useContext, useState, useCallback } from 'react';
import { Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
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

function AccountScreen(props) {
  const [isReloadPage, setIsReloadPage] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { user, setUser } = useContext(AuthContext);
  const { navigation } = props;
  const SCREEN_WIDTH = Dimensions.get('window').width;

  const onPressLogOut = () => {
    console.log('Logging out!');
    setUser(null);
  };

  useFocusEffect(
    useCallback(() => {
      if (isReloadPage) {
        setIsLoading(true);
        const promiseFunction = async () => {
          const response = await getCurrentUser();
          setUser(response.data);
        };
        setIsReloadPage(false);
        promiseFunction();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReloadPage]),
  );

  const getCurrentUser = async () => {
    // get current user from authStorage
    const currentUser = await authStorage.getUser();
    console.log(currentUser);
    // fetch full user profile information by calling api using user ID
    const response = await userApi.getUser(currentUser.userID);
    if (!response.ok) {
      // Proceed to log out if account screen does not load due to api failure
      // Note: should use useCheckExpiredThenLogOut hook but it isnt working and had no time to fix

      // reset the navigation stack when logging out
      // resetNavigation.dispatch(resetAction);
      onPressLogOut();
      return;
    }
    setIsLoading(false);
    return response.data;
  };

  const handleOnPress = () => {
    navigation.push(routes.ACCOUNT_VIEW, { ...user });
  };

  return (
    <>
      {isLoading ? (
        <ActivityIndicator visible />
      ) : (
        <VStack w="100%" h="100%" alignItems="center">
          <ProfileNameButton
            profilePicture={user.profilePicture}
            profileLineOne={user.preferredName}
            profileLineTwo={user.role}
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
              vectorIconComponent={
                <MaterialCommunityIcons name="information" />
              }
              text="About"
              navigation={navigation}
              routes={routes.ABOUT}
            />
          </VStack>
          <Box w="90%" mx="auto" mt="5">
            <AppButton title="Logout" color="red" onPress={onPressLogOut} />
          </Box>
        </VStack>
      )}
    </>
  );
}

export default AccountScreen;
