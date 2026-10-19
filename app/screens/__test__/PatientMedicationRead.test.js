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
    getPrescriptionListV1: jest.fn(),
    getAllocationMap: jest.fn(),
    addPatientMedicationV1: jest.fn(),
    updatePatientMedicationV1: jest.fn(),
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
jest.mock('app/components/AddPatientMedicationModal', () => 'MockCourseModal');
jest.mock('app/components/MedicationItem', () => () => null);
// The real filter consumes its initialization flag in an effect. Preserve that
// lifecycle here: editor readiness must survive filter initialization.
jest.mock('app/components/filter-components/SearchFilterBar', () => {
  const React = require('react');
  return function ConsumingFilter({ initializeData, onInitialize }) {
    React.useEffect(() => {
      if (initializeData) onInitialize();
    }, [initializeData, onInitialize]);
    return null;
  };
});
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
  patient.getPrescriptionListV1.mockResolvedValue({
    ok: true,
    data: { data: [] },
  });
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

const mountCourseIntent = async (
  role,
  intent,
  headerId = 7,
  rowPatient = 7,
) => {
  patient.readPatientV1.mockResolvedValue({
    ok: true,
    status: 200,
    data: { data: { id: headerId, preferredName: 'Synthetic patient' } },
  });
  patient.listPatientMedicationsV1.mockResolvedValue({
    ok: true,
    status: 200,
    data: {
      data: [
        {
          medicationID: 9,
          patientID: rowPatient,
          prescriptionListID: 1,
          dosage: '1 tablet',
          administerTime: '0900',
          startDateTime: '2026-10-16',
          endDateTime: '2026-10-17',
        },
      ],
      totalPages: 1,
    },
  });
  let tree;
  await act(async () => {
    tree = create(
      <AuthContext.Provider value={{ user: { roleName: role } }}>
        <PatientMedicationScreen
          route={{ params: { patientId: 7, courseEditor: intent } }}
        />
      </AuthContext.Provider>,
    );
  });
  return tree;
};

test.each(['add', 'edit'])(
  'centre %s intent opens the existing modal without submitting a write',
  async (mode) => {
    const tree = await mountCourseIntent('SUPERVISOR', {
      mode,
      medicationId: 9,
      requestId: mode,
    });
    const modal = tree.root.findByType('MockCourseModal');
    expect(modal.props.showModal).toBe(true);
    expect(modal.props.modalMode).toBe(mode);
    if (mode === 'edit') {
      expect(modal.props.formData.medicationID).toBe(9);
      expect(modal.props.formData.dosage).toBe('1 tablet');
    }
    expect(patient.addPatientMedicationV1).not.toHaveBeenCalled();
    expect(patient.updatePatientMedicationV1).not.toHaveBeenCalled();
    expect(schedule.getMedicationScheduleV1).not.toHaveBeenCalled();
    act(() => tree.unmount());
  },
);

test.each([
  ['CAREGIVER', 7, 7],
  ['SUPERVISOR', 8, 7],
  ['SUPERVISOR', 7, 8],
])(
  'course edit intent rejects wrong role/header/course identity (%s,%s,%s)',
  async (role, header, coursePatient) => {
    const tree = await mountCourseIntent(
      role,
      { mode: 'edit', medicationId: 9, requestId: 'rejected' },
      header,
      coursePatient,
    );
    expect(tree.root.findByType('MockCourseModal').props.showModal).toBe(false);
    expect(patient.addPatientMedicationV1).not.toHaveBeenCalled();
    expect(patient.updatePatientMedicationV1).not.toHaveBeenCalled();
    act(() => tree.unmount());
  },
);
