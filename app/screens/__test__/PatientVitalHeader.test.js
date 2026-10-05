import React from 'react';
import { act, create } from 'react-test-renderer';
import PatientVitalScreen from 'app/screens/PatientVitalScreen';
import patientApi from 'app/api/patient';
import ProfileNameButton from 'app/components/ProfileNameButton';

jest.mock('native-base', () => ({
  View: require('react-native').View,
  FlatList: () => null,
}));
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
  useFocusEffect: (callback) =>
    require('react').useEffect(callback, [callback]),
}));
jest.mock('app/api/client', () => ({
  __esModule: true,
  default: {},
  PATIENT_V1_BASE: 'http://synthetic-staging.invalid/api/v1',
}));
jest.mock('app/api/patient', () => ({
  __esModule: true,
  ...jest.requireActual('app/api/patient'),
  default: { listPatientVitalsV1: jest.fn(), readPatientV1: jest.fn() },
}));
jest.mock('app/components/ProfileNameButton', () => jest.fn(() => null));
jest.mock('app/components/ActivityIndicator', () => () => null);
jest.mock('app/components/AddButton', () => () => null);
jest.mock('app/components/filter-components/SearchFilterBar', () => () => null);
jest.mock('app/components/LoadingWheel', () => () => null);
jest.mock('app/components/swipeable-components/Swipeable', () => () => null);
jest.mock(
  'app/components/swipeable-components/EditDeleteUnderlay',
  () => () => null,
);
jest.mock('app/components/DynamicTable', () => () => null);
jest.mock('app/components/PatientVitalItem', () => () => null);
jest.mock('app/components/AddPatientVitalModalNEW', () => () => null);
beforeEach(() => {
  jest.clearAllMocks();
  patientApi.listPatientVitalsV1.mockResolvedValue([]);
});
test.each([
  {
    id: 7,
    preferredName: 'Synthetic Camel',
    firstName: 'Synthetic',
    lastName: 'Camel',
    profilePicture: 'https://synthetic.invalid/camel.png',
  },
  {
    id: 7,
    preferred_name: 'Synthetic Snake',
    first_name: 'Synthetic',
    last_name: 'Snake',
    profile_picture: 'https://synthetic.invalid/snake.png',
  },
])(
  'Vitals header preserves the selected patient for both supported v1 name shapes: %p',
  async (record) => {
    patientApi.readPatientV1.mockResolvedValue({
      ok: true,
      status: 200,
      data: { data: record },
    });
    let tree;
    await act(async () => {
      tree = create(
        <PatientVitalScreen route={{ params: { patientID: 7 } }} />,
      );
    });
    const props = ProfileNameButton.mock.calls.at(-1)[0];
    expect(props.profileLineOne).toBe(
      record.preferredName ?? record.preferred_name,
    );
    expect(props.profileLineTwo).toBe(
      'Synthetic ' + (record.lastName ?? record.last_name),
    );
    expect(props.profilePicture).toBe(
      record.profilePicture ?? record.profile_picture,
    );
    expect(patientApi.readPatientV1).toHaveBeenCalledWith(7, {
      require_auth: true,
      mask: true,
    });
    act(() => tree.unmount());
  },
);
