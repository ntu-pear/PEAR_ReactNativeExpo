/**
 * @jest-environment node
 */
import { cleanup, render, waitFor } from '@testing-library/react-native';
import { NativeBaseProvider } from 'native-base';
import '@testing-library/jest-native/extend-expect';
import PatientProfileScreen from 'app/screens/patient-profile/PatientProfileScreen';
// import HighlightsCard from 'app/components/HighlightsCard';
import { getPatient } from 'app/api/patient';

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

jest.mock('../../api/patient', () => ({
  getPatient: jest.fn(),
}));

const inset = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

describe('Test PatientProfileScreen', () => {
  test('Test Navigation from PatientDailyHighlights to PatientProfileScreen', async () => {
    getPatient.mockReturnValueOnce({
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

    const patientProfileScreen = render(
      <NativeBaseProvider initialWindowMetrics={inset}>
        <PatientProfileScreen {...props} />
      </NativeBaseProvider>,
    );

    await waitFor(() => {
      expect(getPatient).toBeCalledTimes(1);

      const patientInformationCard = patientProfileScreen.getByTestId(
        'patientInformationCard',
      );
      expect(patientInformationCard).toBeVisible();

      expect(
        patientProfileScreen.getAllByTestId('patientProfileCard').length,
      ).toBe(9);
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

    const patientProfileScreen = render(
      <NativeBaseProvider initialWindowMetrics={inset}>
        <PatientProfileScreen {...props} />
      </NativeBaseProvider>,
    );

    await waitFor(() => {
      expect(getPatient).toBeCalledTimes(0);

      const patientInformationCard = patientProfileScreen.getByTestId(
        'patientInformationCard',
      );
      expect(patientInformationCard).toBeVisible();

      expect(
        patientProfileScreen.getAllByTestId('patientProfileCard').length,
      ).toBe(9);
    });
  });
});
