import React, { useState, useContext, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import {
  // BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import {
  VStack,
  HStack,
  IconButton,
  Icon,
  Text,
  Box,
  StatusBar,
  Image,
  Pressable,
  Divider,
  Menu,
  Popover,
} from 'native-base';
import { useFocusEffect } from '@react-navigation/native';

import { MaterialIcons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import AuthContext from 'app/auth/context';
import authStorage from 'app/auth/authStorage';

import NotificationNavigator from 'app/navigation/NotificationNavigator';
import AccountScreen from 'app/screens/AccountScreen';
import AccountViewScreen from 'app/screens/AccountViewScreen';
import AccountEditScreen from 'app/screens/AccountEditScreen';
import ChangePasswordScreen from 'app/screens/ChangePasswordScreen';
import PatientAddScreen from 'app/screens/PatientAddScreen';
import PatientActivityPreferenceScreen from 'app/screens/PatientActivityPreferenceScreen';
import PatientAllergyScreen from 'app/screens/PatientAllergyScreen';
import PatientHolidayScreen from 'app/screens/PatientHolidayScreen';
import PatientPhotoAlbumScreen from 'app/screens/PatientPhotoAlbumScreen';
import PatientPreferenceScreen from 'app/screens/PatientPreferenceScreen';
import PatientPrescriptionScreen from 'app/screens/PatientPrescriptionScreen';
import PatientProblemLog from 'app/screens/PatientProblemLog';
import PatientVitalScreen from 'app/screens/PatientVitalScreen';
import PatientRoutineScreen from 'app/screens/PatientRoutineScreen';

import PatientsScreenWeb from 'app/screens/web/PatientsScreenWeb';
import PatientInformationScreenWeb from 'app/screens/web/PatientInformationScreenWeb';
import DashboardScreenWeb from 'app/screens/web/DashboardScreenWeb';

import AccountDetailCard from 'app/components/AccountDetailCard';
import AccountCard from 'app/components/AccountCard';
import AppButton from 'app/components/AppButton';

import routes from 'app/navigation/routes';
import userApi from 'app/api/user';
import AboutScreen from 'app/screens/AboutScreen';

import colors from 'app/config/colors';

function Example() {
  return (
    <div style={{ padding: 20 }}>
      <h2>Example View</h2>
      <p>Lorem ipsum dolor sit amet, consectetur adip.</p>
    </div>
  );
}

const linkStyle = {
  textDecoration: 'none',
  padding: 5,
};

function WebAppNavigator() {
  const [sidebar, setSidebar] = useState(false);
  const { user, setUser } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);

  // side navbar
  const showSidebar = () => setSidebar(!sidebar);

  // logout
  const onPressLogOut = async () => {
    setUser(null);
    await authStorage.removeToken();
  };

  // get current user
  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      const promiseFunction = async () => {
        const response = await getCurrentUser();
        // console.log(response);

        setUser(response?.data);
      };
      promiseFunction();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const getCurrentUser = async () => {
    const currentUser = await authStorage.getUser();
    const response = await userApi.getUser(currentUser?.userID);
    // console.log('getCurrentUser', response);
    if (!response.ok) {
      // Proceed to log out if account screen does not load due to api failure
      // Note: should use useCheckExpiredThenLogOut hook but it isnt working and had no time to fix
      setUser(null);
      await authStorage.removeToken();
      return;
    }
    setIsLoading(false);
    return response.data;
  };

  // set title for each web page
  const location = useLocation();
  useEffect(() => {
    var currentPathName = location.pathname || 'Welcome';

    document.title = `PEAR | ${decodeURIComponent(
      currentPathName.replace(/\//g, ''),
    )}`;
  }, [location]);

  // useNavigate() hook cannot work on mobile
  const navigate = Platform.OS === 'web' ? useNavigate() : null;

  return (
    <>
      <Box style={{ borderBottomWidth: 3 }}>
        <StatusBar />
        <HStack
          bg="white"
          justifyContent="space-between"
          alignItems="center"
          w="100%"
        >
          <HStack alignItems="center">
            <IconButton
              px="5"
              icon={
                <Icon
                  size="2xl"
                  as={MaterialIcons}
                  name={sidebar ? 'close' : 'menu'}
                  color="black"
                />
              }
              onPress={showSidebar}
            />
            <Image
              source={require('../assets/pear.png')}
              alt="PEAR"
              resizeMode="contain"
              size="lg"
            />
          </HStack>
          <HStack>
            <Popover
              trigger={(triggerProps) => {
                return (
                  <IconButton
                    {...triggerProps}
                    icon={
                      <Icon
                        as={MaterialIcons}
                        name="notifications"
                        size="4xl"
                        color="black"
                        m="3"
                      />
                    }
                  />
                );
              }}
            >
              <Popover.Content
                accessibilityLabel="Notifications"
                w="500"
                h="400"
              >
                <Popover.Header>Notifications</Popover.Header>
                <Popover.Body>
                  {/* <NavigationContainer>
                    <NotificationNavigator />
                  </NavigationContainer> */}
                </Popover.Body>
                {/* <Popover.Footer justifyContent="flex-end">
                  <Button.Group space={2}>
                    <Button colorScheme="coolGray" variant="ghost">
                      Cancel
                    </Button>
                    <Button colorScheme="danger">Delete</Button>
                  </Button.Group>
                </Popover.Footer> */}
              </Popover.Content>
            </Popover>

            <Menu
              pr="3"
              trigger={(triggerProps) => {
                return (
                  <Pressable>
                    <IconButton
                      icon={
                        <Icon
                          as={MaterialIcons}
                          name="person"
                          size="4xl"
                          color="black"
                          m="3"
                        />
                      }
                      accessibilityLabel="Profile menu"
                      {...triggerProps}
                    />
                  </Pressable>
                );
              }}
            >
              <Menu.Item>
                <AccountDetailCard userProfile={user} navigation={navigate} />
              </Menu.Item>
              <Menu.Group title="Settings">
                <Menu.Item>
                  <Box
                    rounded="lg"
                    borderWidth={Platform.OS === 'web' ? '1' : ''}
                    borderColor={colors.primary_gray}
                    style={{ flex: 1 }}
                  >
                    <AccountCard
                      vectorIconComponent={
                        <MaterialCommunityIcons name="cog" />
                      }
                      text="Change Password"
                      navigation={navigate}
                      routes={routes.CHANGE_PASSWORD}
                    />
                  </Box>
                </Menu.Item>
              </Menu.Group>
              <Menu.Group title="About">
                <Menu.Item>
                  <Box
                    rounded="lg"
                    borderWidth={Platform.OS === 'web' ? '1' : ''}
                    borderColor={colors.primary_gray}
                    style={{ flex: 1 }}
                  >
                    <AccountCard
                      vectorIconComponent={
                        <MaterialCommunityIcons name="information" />
                      }
                      text="About"
                      navigation={navigate}
                      routes={routes.ABOUT}
                    />
                  </Box>
                </Menu.Item>
              </Menu.Group>
              <Menu.Item>
                <AppButton title="Logout" color="red" onPress={onPressLogOut} />
              </Menu.Item>
            </Menu>
          </HStack>
        </HStack>
      </Box>

      {/* TODO: (yapsiang) implements routes for the different pages  */}
      {/* <Router> */}
      <HStack alignContent="center">
        {sidebar ? (
          // <Pressable onPress={showSidebar}>
          <Pressable>
            <VStack
              space="xs"
              pt="2"
              px="3"
              borderRightWidth="1"
              borderBottomWidth="1"
              h="100vh"
              w="15vw"
            >
              <Text bold fontSize="18px">
                PATIENTS
              </Text>
              <Link to={routes.PATIENTS} style={linkStyle}>
                <Icon as={MaterialIcons} name="apartment" size="md" m="2" />
                View Patient
              </Link>
              <Link to={routes.PATIENT_ADD_PATIENT} style={linkStyle}>
                <Icon
                  as={MaterialIcons}
                  name="switch-account"
                  size="md"
                  m="2"
                />
                Add Patient
              </Link>
              <Link to="/" style={linkStyle}>
                <Icon
                  as={MaterialIcons}
                  name="switch-account"
                  size="md"
                  m="2"
                />
                Manage Preference
              </Link>
              <Link to="/" style={linkStyle}>
                <Icon
                  as={MaterialIcons}
                  name="medical-services"
                  size="md"
                  m="2"
                />
                View Medication Schedule
              </Link>
              <Divider />

              <Text bold fontSize="18px">
                ACTIVITIES
              </Text>
              <Link to="/" style={linkStyle}>
                <Icon as={MaterialIcons} name="list-alt" size="md" m="2" />
                Manage Activities
              </Link>
              <Divider />

              <Text bold fontSize="18px">
                ATTENDANCE
              </Text>
              <Link to="/" style={linkStyle}>
                <Icon
                  as={MaterialIcons}
                  name="assignment-ind"
                  size="md"
                  m="2"
                />
                Manage Attendance
              </Link>
              <Divider />

              <Text bold fontSize="18px">
                ADHOC
              </Text>
              <Link to="/" style={linkStyle}>
                <Icon as={MaterialIcons} name="note" size="md" m="2" />
                Manage Adhoc
              </Link>
              <Divider />

              <Text bold fontSize="18px">
                SCHEDULE
              </Text>
              <Link to="/" style={linkStyle}>
                <Icon as={MaterialIcons} name="loop" size="md" m="2" />
                Generate Schedule
              </Link>
              <Link to="/" style={linkStyle}>
                <Icon as={MaterialIcons} name="file-download" size="md" m="2" />
                Export Schedule
              </Link>
              <Divider />

              <Text bold fontSize="18px">
                OTHERS
              </Text>
              <Link to={routes.NOTIFICATION} style={linkStyle}>
                <Icon as={MaterialIcons} name="notifications" size="md" m="2" />
                Notifications
              </Link>
              <Link to={routes.DASHBOARD_SCREEN} style={linkStyle}>
                <Icon as={MaterialIcons} name="person-search" size="md" m="2" />
                Dashboard
              </Link>
              <Link to="/" style={linkStyle}>
                <Icon
                  as={MaterialIcons}
                  name="library-add-check"
                  size="md"
                  m="2"
                />
                Manage Approval Request
              </Link>
              <Link to="/" style={linkStyle}>
                <Icon as={MaterialIcons} name="search" size="md" m="2" />
                View Activity Logs
              </Link>
              <Link to="/" style={linkStyle}>
                <Icon as={MaterialIcons} name="security" size="md" m="2" />
                View Privacy Settings
              </Link>
              <Link to="/" style={linkStyle}>
                <Icon as={MaterialIcons} name="view-list" size="md" m="2" />
                Manage List Items
              </Link>
              <Divider />
            </VStack>
          </Pressable>
        ) : null}
        <Routes>
          <Route path="/" element={<Example />} />
          <Route path="/example" element={<Example />} />
          <Route path={routes.ACCOUNT} element={<AccountScreen />} />
          <Route
            path={routes.NOTIFICATION}
            element={<NotificationNavigator />}
          />
          <Route
            path={routes.PATIENTS}
            element={<PatientsScreenWeb sidebar={sidebar} />}
          />
          <Route
            path={routes.PATIENT_INFORMATION}
            element={<PatientInformationScreenWeb sidebar={sidebar} />}
          />
          <Route
            path={routes.PATIENT_ALLERGY}
            element={<PatientAllergyScreen />}
          />
          <Route path={routes.PATIENT_VITAL} element={<PatientVitalScreen />} />
          <Route
            path={routes.PATIENT_PRESCRIPTION}
            element={<PatientPrescriptionScreen />}
          />
          <Route
            path={routes.PATIENT_PROBLEM_LOG}
            element={<PatientProblemLog />}
          />
          <Route
            path={routes.PATIENT_ACTIVITY_PREFERENCE}
            element={<PatientActivityPreferenceScreen />}
          />
          <Route
            path={routes.PATIENT_ROUTINE}
            element={<PatientRoutineScreen />}
          />
          <Route
            path={routes.PATIENT_PREFERENCE}
            element={<PatientPreferenceScreen />}
          />
          <Route
            path={routes.PATIENT_PHOTO_ALBUM}
            element={<PatientPhotoAlbumScreen />}
          />
          <Route
            path={routes.PATIENT_HOLIDAY}
            element={<PatientHolidayScreen />}
          />
          <Route
            path={routes.PATIENT_ADD_PATIENT}
            element={<PatientAddScreen />}
          />
          <Route
            path={routes.DASHBOARD_SCREEN}
            element={<DashboardScreenWeb sidebar={sidebar} />}
          />
          <Route path={routes.ACCOUNT_VIEW} element={<AccountViewScreen />} />
          <Route path={routes.ACCOUNT_EDIT} element={<AccountEditScreen />} />
          <Route
            path={routes.CHANGE_PASSWORD}
            element={<ChangePasswordScreen sidebar={sidebar} />}
          />
          <Route
            path={routes.ABOUT}
            element={<AboutScreen sidebar={sidebar} />}
          />
        </Routes>
      </HStack>
      {/* </Router> */}
    </>
  );
}

export default WebAppNavigator;
