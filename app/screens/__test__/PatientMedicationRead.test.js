import React from 'react';
import { act, create } from 'react-test-renderer';
import PatientMedicationScreen from 'app/screens/PatientMedicationScreen';
import patient from 'app/api/patient';
import schedule from 'app/api/schedule';
import AuthContext from 'app/auth/context';
import { noDataMessage } from 'app/utility/miscFunctions';
jest.mock('native-base', () => ({
  View: require('react-native').View,
  FlatList: ({ data, ListEmptyComponent }) =>
    data.length ? null : <ListEmptyComponent />,
}));
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
  useFocusEffect: (callback) =>
    require('react').useEffect(callback, [callback]),
}));
jest.mock('app/api/client', () => ({
  __esModule: true,
  default: {},
  PATIENT_V1_BASE: 'http://synthetic.invalid',
}));
jest.mock('app/api/patient', () => ({
  __esModule: true,
  ...jest.requireActual('app/api/patient'),
  default: {
    listPatientMedicationsV1: jest.fn(),
    readPatientV1: jest.fn(),
    getAllocationMap: jest.fn(),
  },
}));
jest.mock('app/api/schedule', () => ({ getMedicationScheduleV1: jest.fn() }));
jest.mock('app/utility/miscFunctions', () => ({
  ...jest.requireActual('app/utility/miscFunctions'),
  noDataMessage: jest.fn(() => null),
}));
jest.mock('app/components/ProfileNameButton', () => () => null);
jest.mock('app/components/ActivityIndicator', () => () => null);
jest.mock('app/components/AddButton', () => () => null);
jest.mock('app/components/AddPatientMedicationModal', () => () => null);
jest.mock('app/components/MedicationItem', () => () => null);
jest.mock('app/components/filter-components/SearchFilterBar', () => () => null);
jest.mock('app/components/LoadingWheel', () => () => null);
jest.mock('app/components/swipeable-components/Swipeable', () => () => null);
jest.mock(
  'app/components/swipeable-components/EditDeleteUnderlay',
  () => () => null,
);
jest.mock('app/components/DynamicTable', () => () => null);
jest.mock('app/components/AppText', () => require('react-native').Text);
beforeEach(() => {
  jest.clearAllMocks();
  patient.readPatientV1.mockResolvedValue({
    ok: true,
    status: 200,
    data: { data: { id: 7, preferredName: 'Synthetic patient' } },
  });
});
test.each([true, false])(
  'empty medication record success=%s never reads Scheduler and header success cannot mask its failure',
  async (ok) => {
    patient.listPatientMedicationsV1.mockResolvedValue({
      ok,
      status: ok ? 200 : 500,
      data: { data: [] },
    });
    let tree;
    await act(async () => {
      tree = create(
        <AuthContext.Provider value={{ user: { roleName: 'CAREGIVER' } }}>
          <PatientMedicationScreen route={{ params: { patientID: 7 } }} />
        </AuthContext.Provider>,
      );
    });
    expect(patient.listPatientMedicationsV1).toHaveBeenCalledTimes(1);
    expect(patient.readPatientV1).toHaveBeenCalledTimes(1);
    expect(schedule.getMedicationScheduleV1).not.toHaveBeenCalled();
    expect(patient.getAllocationMap).not.toHaveBeenCalled();
    expect(noDataMessage.mock.calls.at(-1)[2]).toBe(!ok);
    act(() => tree.unmount());
  },
);
