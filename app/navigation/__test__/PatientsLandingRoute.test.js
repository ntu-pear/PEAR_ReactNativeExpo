import React from 'react';
import { create, act } from 'react-test-renderer';
import AuthContext from 'app/auth/context';
import routes from 'app/navigation/routes';

// Apply the navigator's normal configured/default landing behavior. Leaf screens
// are isolated so this verifies tab entry, not unrelated legacy screen imports.
jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Screen: () => null,
    Navigator: ({ children, initialRouteName }) => {
      const React = require('react');
      const { View } = require('react-native');
      const screens = React.Children.toArray(children);
      const initial =
        screens.find((screen) => screen.props.name === initialRouteName) ||
        screens[0];
      return (
        <View
          testID="patient-tab-landing"
          accessibilityLabel={initial.props.name}
        />
      );
    },
  }),
}));
const leafScreens = [
  'PatientsScreen',
  'ManageMedicationScreen',
  'PatientProfileScreen',
  'PatientMedicalHistoryScreen',
  'PatientAllergyScreen',
  'PatientHolidayScreen',
  'PatientHolidayGridScreen',
  'PatientPhotoAlbumScreen',
  'PatientPhotoGridScreen',
  'PatientViewPhotoScreen',
  'ActivityPreferenceScreen',
  'PatientActivityOverviewScreen',
  'PatientPrescriptionScreen',
  'PatientProblemLogScreen',
  'PatientVitalScreen',
  'PatientRoutineScreen',
  'PatientAddScreen',
  'EditPatientInfoScreen',
  'EditPatientPreferencesScreen',
  'EditPatientGuardianScreen',
  'EditPatientSocialHistScreen',
  'PatientMedicationScreen',
  'PatientScheduleScreen',
  'PatientMobilityAidsScreen',
  'DoctorNoteScreen',
];
leafScreens.forEach((name) =>
  jest.doMock(`app/screens/${name}`, () => () => null),
);
jest.doMock('app/components/PatientInformationAccordion', () => () => null);
const PatientsNavigator = require('app/navigation/PatientsNavigator').default;
test.each(['SUPERVISOR', 'CAREGIVER', 'DOCTOR'])(
  'entering Patients as %s lands on the patient list rather than supervisor medication management',
  (role) => {
    let screen;
    act(() => {
      screen = create(
        <AuthContext.Provider value={{ user: { roleName: role } }}>
          <PatientsNavigator />
        </AuthContext.Provider>,
      );
    });
    expect(
      screen.root.findByProps({ testID: 'patient-tab-landing' }).props
        .accessibilityLabel,
    ).toBe(routes.PATIENTS_SCREEN);
    act(() => screen.unmount());
  },
);
