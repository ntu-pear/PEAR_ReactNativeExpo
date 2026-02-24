// Libs
import React, { useContext, useEffect, useState, useCallback } from 'react';
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

// Utilities
import patientDraft from 'app/utility/patientDraft';

// Configurations
import colors from 'app/config/colors';

function AccountScreen(props) {
  const [isReloadPage, setIsReloadPage] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { user, setUser } = useContext(AuthContext);
  const { navigation } = props;
  const SCREEN_WIDTH = Dimensions.get('window').width;

  const onPressLogOut = async () => {
    console.log('Logging out!');
    userApi.logoutUser()
    .then(() => authStorage.removeToken())
    .then(() => patientDraft.clearDraft())
    .then(() => setUser(null))
    .catch(error => console.error('Logout failed:', error));
    // console.log('Logging out!');
    // setUser(null);
    // await authStorage.removeToken();
  };

  const retrieveCurrentUser = async () => {
    // v1 self endpoint: /api/v1/user/get_user/
    const response = await userApi.getUser();
    if (!response.ok) {
      console.log('Request failed with status code: ', response.status);
      return;
    }
    setUser(response.data);
  };

  // used to confirm that data has returned from apis before loading the page - Russell
  useEffect(() => {
    if(user !== undefined && Object.keys(user).length>0){
      setIsLoading(false);
    }
  }, [user]);

  // This callback function will be executed when the screen comes into focus - Russell
  useEffect(() => {
    const navListener = navigation.addListener('focus', () => {
      setUser([]);
      setIsLoading(true);
      retrieveCurrentUser();
    });
    return navListener;
  }, [navigation]);

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
    // v1 self endpoint: /api/v1/user/get_user/
    const response = await userApi.getUser();
    if (!response.ok) {
      // only force logout if the token is invalid/expired
      if (response.status === 401) {
        onPressLogOut();
      } else {
        console.log('Account fetch failed:', response.status, response?.data);
      }
      return { data: null };
    }
      
    setIsLoading(false);
    // keep return shape so callers using `response.data` still work
    return { data: response.data };
    };

  const handleOnPress = () => {
    navigation.push(routes.ACCOUNT_VIEW, { ...user });
  };

  return isLoading ? (
    <ActivityIndicator visible />
  ) : (
    <VStack w="100%" h="100%" alignItems="center">
      <ProfileNameButton
        profilePicture={typeof user.profilePicture === 'string' ? user.profilePicture : ''}
        profileLineOne={(user.preferredName || user.firstName || user.email || 'User') + ''}
        profileLineTwo={(user.role || '') + ''}
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
  );
}

export default AccountScreen;
