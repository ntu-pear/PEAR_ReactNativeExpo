import { useState, useEffect } from 'react';
import React, { useContext } from 'react';
import { VStack, View, Box } from 'native-base';
import AuthContext from 'app/auth/context';
import AppButton from 'app/components/AppButton';
import authStorage from 'app/auth/authStorage';
import AccountCard from 'app/components/AccountCard';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import routes from 'app/navigation/routes';
import AccountDetailCard from 'app/components/AccountDetailCard';
import userApi from 'app/api/user';
import useCheckExpiredThenLogOut from 'app/hooks/useCheckExpiredThenLogOut';

function AccountScreen(props) {
  const [isLoading, setIsLoading] = useState(false);
  const { user, setUser } = useContext(AuthContext);
  const checkExpiredLogOutHook = useCheckExpiredThenLogOut();
  const { navigation } = props;

  const onPressLogOut = async () => {
    setUser(null);
    await authStorage.removeToken();
  };

  useEffect(() => {
    setIsLoading(true);
    const promiseFunction = async () => {
      const response = await getCurrentUser();

      setUser(response.data.data);
    };
    promiseFunction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCurrentUser = async () => {
    const currentUser = await authStorage.getUser();
    const response = await userApi.getUser(currentUser.userID);
    if (!response.ok) {
      // Check if token has expired, if yes, proceed to log out
      checkExpiredLogOutHook.handleLogOut(response);
      return;
    }
    setIsLoading(false);
    return response;
  };

  return (
    <>
      {isLoading ? (
        <View />
      ) : (
        <VStack w="100%" h="100%" alignItems="center">
          <AccountDetailCard userProfile={user} navigation={navigation} />

          <VStack w="90%" flexWrap="wrap" mb="1" alignItems="left">
            <AccountCard
              iconTop="3"
              iconLeft="2"
              iconSize="50"
              vectorIconComponent={<MaterialCommunityIcons name="cog" />}
              textMarginTop="6"
              textMarginLeft="1"
              text="Settings"
              navigation={navigation}
              routes={routes.SETTINGS}
            />
            <AccountCard
              iconTop="3"
              iconLeft="2"
              iconSize="50"
              vectorIconComponent={
                <MaterialCommunityIcons name="information" />
              }
              textMarginTop="6"
              textMarginLeft="1"
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
