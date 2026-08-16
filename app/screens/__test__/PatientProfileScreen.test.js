/**
 * @jest-environment node
 */
import { cleanup, render, waitFor } from '@testing-library/react-native';
import { NativeBaseProvider } from 'native-base';
import '@testing-library/jest-native/extend-expect';
import PatientProfileScreen from 'app/screens/PatientProfileScreen';
// import HighlightsCard from 'app/components/HighlightsCard';
import patientApi from 'app/api/patient';
import AuthContext from 'app/auth/context';
import { NavigationContext } from '@react-navigation/native';

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  const MockIcon = ({ name }) => React.createElement(Text, null, name);
  return {
    MaterialCommunityIcons: MockIcon,
    MaterialIcons: MockIcon,
    FontAwesome5: MockIcon,
    Ionicons: MockIcon,
  };
});

const MockPatientProfile = {
  patientID: 1,
  preferredLanguage: 'Cantonese',
  firstName: 'Alice',
  lastName: 'Lee',
  nric: 'Sxxxx922I',
  address: '73 Kampong Bahru Road 169373, Singapore',
  tempAddress: null,
  homeNo: '65123456',
  handphoneNo: '61234564',
  gender: 'F',
  dob: '1937-09-12T00:00:00',
  preferredName: 'Alice',
  privacyLevel: 2,
  updateBit: true,
  autoGame: true,
  startDate: '2020-05-04T00:00:00',
  endDate: null,
  terminationReason: null,
  isActive: true,
  inactiveReason: null,
  inactiveDate: null,
  isRespiteCare: true,
  profilePicture:
    'https://res.cloudinary.com/dbpearfyp/image/upload/v1640487405/Patient/Alice_Lee_Sxxxx567D/ProfilePicture/zsw7dyprsvn0bjmatofg.jpg',
};

jest.mock('app/api/patient', () => ({
  __esModule: true,
  default: {
    getPatient: jest.fn(),
    readPatientV1: jest.fn(),
  },
}));

jest.mock('expo-asset', () => ({
  Asset: class Asset {
    static fromModule() {
      return {
        downloadAsync: jest.fn(() => Promise.resolve()),
        localUri: 'mock://asset',
        uri: 'mock://asset',
      };
    }
  },
}));

jest.mock('expo-font', () => ({
  loadAsync: jest.fn(() => Promise.resolve()),
  isLoaded: jest.fn(() => true),
  isLoading: jest.fn(() => false),
}));

jest.mock('app/api/guardian', () => ({
  __esModule: true,
  default: {
    getPatientGuardian: jest.fn(() =>
      Promise.resolve({ ok: true, data: { data: [] } }),
    ),
  },
}));

jest.mock('app/api/socialHistory', () => ({
  __esModule: true,
  default: {
    getSocialHistory: jest.fn(() =>
      Promise.resolve({ ok: true, data: { data: null } }),
    ),
  },
}));

jest.mock('app/components/PatientInformationAccordion', () => {
  const React = require('react');
  return () => React.createElement(React.Fragment, null);
});

const inset = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const navContext = {
  isFocused: () => true,
  addListener: jest.fn(() => jest.fn()),
};

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

describe('Test PatientProfileScreen', () => {
  beforeEach(() => {
    patientApi.readPatientV1.mockResolvedValue({
      ok: true,
      data: { data: MockPatientProfile },
    });
    patientApi.getPatient.mockResolvedValue({
      ok: true,
      data: { data: MockPatientProfile },
    });
  });

  const renderWithRole = (props, roleName = 'SUPERVISOR') =>
    render(
      <NativeBaseProvider initialWindowMetrics={inset}>
        <NavigationContext.Provider value={navContext}>
          <AuthContext.Provider value={{ user: { roleName } }}>
            <PatientProfileScreen {...props} />
          </AuthContext.Provider>
        </NavigationContext.Provider>
      </NativeBaseProvider>,
    );

  const renderAsSupervisor = (props) => renderWithRole(props, 'SUPERVISOR');

  test('Test Navigation from PatientDailyHighlights to PatientProfileScreen', async () => {
    patientApi.readPatientV1.mockReturnValueOnce({
      ok: true,
      data: { data: MockPatientProfile },
    });

    const props = {
      navigation: {
        push: jest.fn(),
      },
      route: {
        params: {
          id: 1,
          patientProfile: null,
        },
      },
    };

    const patientProfileScreen = renderAsSupervisor(props);

    await waitFor(() => {
      expect(patientApi.readPatientV1).toBeCalledTimes(1);

      const patientInformationCard = patientProfileScreen.getByTestId('profile');
      expect(patientInformationCard).toBeVisible();

      expect(patientProfileScreen.getByTestId('activityRoutine_1')).toBeVisible();
      expect(patientProfileScreen.getByTestId('activityOverview_1')).toBeVisible();
      expect(patientProfileScreen.getByTestId('activityPreference_1')).toBeVisible();
      expect(patientProfileScreen.getByTestId('doctorNote_1')).toBeVisible();
    });
  });

  test('Test Navigation from PatientsScreen to PatientProfileScreen', async () => {
    const props = {
      navigation: {
        push: jest.fn(),
      },
      route: {
        params: {
          patientProfile: MockPatientProfile,
        },
      },
    };

    const patientProfileScreen = renderAsSupervisor(props);

    await waitFor(() => {
      expect(patientApi.readPatientV1).toBeCalledTimes(1);

      const patientInformationCard = patientProfileScreen.getByTestId('profile');
      expect(patientInformationCard).toBeVisible();

      expect(patientProfileScreen.getByTestId('activityRoutine_1')).toBeVisible();
      expect(patientProfileScreen.getByTestId('activityOverview_1')).toBeVisible();
      expect(patientProfileScreen.getByTestId('activityPreference_1')).toBeVisible();
      expect(patientProfileScreen.getByTestId('doctorNote_1')).toBeVisible();
    });
  });

  test('Caregiver keeps routine access but does not see supervisor/doctor-only cards', async () => {
    const props = {
      navigation: {
        push: jest.fn(),
      },
      route: {
        params: {
          patientProfile: MockPatientProfile,
        },
      },
    };

    const patientProfileScreen = renderWithRole(props, 'CAREGIVER');

    await waitFor(() => {
      expect(patientProfileScreen.getByTestId('activityRoutine_1')).toBeVisible();
      expect(patientProfileScreen.getByTestId('activityOverview_1')).toBeVisible();
      expect(patientProfileScreen.queryByTestId('activityPreference_1')).toBeNull();
      expect(patientProfileScreen.queryByTestId('doctorNote_1')).toBeNull();
    });
  });
});
