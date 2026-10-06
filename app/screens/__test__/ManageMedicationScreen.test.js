import React from 'react';
import { act, create } from 'react-test-renderer';
import ManageMedicationScreen from 'app/screens/ManageMedicationScreen';
import AuthContext from 'app/auth/context';
import patient from 'app/api/patient';
import { filterMedicationHistory } from 'app/utility/medicationHistory';
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (cb) => require('react').useEffect(cb, [cb]),
}));
jest.mock('app/api/patient', () => ({
  listMyPatientsV1: jest.fn(),
  listPatientsV1: jest.fn(),
  listPatientMedicationsV1: jest.fn(),
  getPrescriptionListV1: jest.fn(),
}));
const patients = {
  ok: true,
  data: {
    data: [
      { id: 'Patient-A', name: 'Synthetic A' },
      { id: 'Patient-B', name: 'Synthetic B' },
    ],
    totalPages: 1,
  },
};
const meds = (id = 'Patient-A', nameId = 'Drug-A') => ({
  ok: true,
  data: {
    data: [
      {
        medicationID: `Record-${id}`,
        patientID: id,
        prescriptionListID: nameId,
        dosage: '1 tablet',
        administerTime: '0900',
        instruction: 'With water',
        startDateTime: '2026-09-01',
        endDateTime: '2026-09-05',
      },
    ],
    totalPages: 1,
  },
});
let screen;
const mount = async (role = 'SUPERVISOR') => {
  await act(async () => {
    screen = create(
      <AuthContext.Provider value={{ user: { roleName: role, id: 'Actor-X' } }}>
        <ManageMedicationScreen />
      </AuthContext.Provider>,
    );
  });
  return screen;
};
const press = async (label) => {
  const node = screen.root.findAll(
    (n) =>
      n.props.accessibilityRole === 'button' &&
      n.props.accessibilityLabel === label,
  )[0];
  await act(async () => node.props.onPress());
};
const text = (value) =>
  screen.root.findAll(
    (n) =>
      (Array.isArray(n.props.children)
        ? n.props.children.filter((child) => typeof child === 'string').join('')
        : n.props.children) === value,
  ).length > 0;
beforeEach(() => {
  jest.clearAllMocks();
  patient.listMyPatientsV1.mockResolvedValue(patients);
  patient.listPatientsV1.mockResolvedValue(patients);
  patient.listPatientMedicationsV1.mockResolvedValue(meds());
  patient.getPrescriptionListV1.mockResolvedValue({
    ok: true,
    data: {
      data: [
        { Id: 'Drug-A', Value: 'Synthetic drug A' },
        { Id: 'Drug-B', Value: 'Synthetic drug B' },
      ],
    },
  });
});
afterEach(() => {
  if (screen) {
    act(() => screen.unmount());
  }
  screen = null;
});
test('direct navigation by caregiver makes no patient or medication request', async () => {
  await mount('CAREGIVER');
  expect(text('Medication management is available to supervisors.')).toBe(true);
  expect(patient.listMyPatientsV1).not.toHaveBeenCalled();
  expect(patient.listPatientMedicationsV1).not.toHaveBeenCalled();
});
test('one scoped patient page does not fan out medication requests; expanded records join vocabulary and keep ended courses', async () => {
  await mount();
  expect(patient.listMyPatientsV1).toHaveBeenCalledWith(
    'Actor-X',
    'SUPERVISOR',
    expect.objectContaining({ pageNo: 0, pageSize: 10 }),
  );
  expect(patient.listPatientMedicationsV1).not.toHaveBeenCalled();
  await press('Synthetic A');
  expect(patient.listPatientMedicationsV1).toHaveBeenCalledTimes(1);
  expect(text('Synthetic drug A')).toBe(true);
  expect(text('Dosage: 1 tablet')).toBe(true);
  expect(
    screen.root.findAllByProps({ testID: 'medication_records_loading' }),
  ).toHaveLength(0);
});
test('All Patients uses the global page explicitly; failed My Patients cannot broaden access', async () => {
  patient.listMyPatientsV1.mockResolvedValue({ ok: false, status: 403 });
  await mount();
  expect(patient.listPatientsV1).not.toHaveBeenCalled();
  expect(
    screen.root.findAllByProps({ testID: 'medication_patients_loading' }),
  ).toHaveLength(0);
  await press('All Patients');
  expect(patient.listPatientsV1).toHaveBeenCalledTimes(1);
});
test('a late record response for a previous patient cannot replace the new selection', async () => {
  let finish;
  patient.listPatientMedicationsV1
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    )
    .mockResolvedValueOnce(meds('Patient-B', 'Drug-B'));
  await mount();
  await press('Synthetic A');
  await press('Synthetic B');
  expect(text('Synthetic drug B')).toBe(true);
  await act(async () => finish(meds()));
  expect(text('Synthetic drug B')).toBe(true);
  expect(text('Synthetic drug A')).toBe(false);
});
test('failed medication reads show an error and retry, never an empty success', async () => {
  patient.listPatientMedicationsV1.mockResolvedValueOnce({
    ok: false,
    status: 500,
  });
  await mount();
  await press('Synthetic A');
  expect(
    text(
      'Medication records could not be loaded. Check the connection and retry.',
    ),
  ).toBe(true);
  expect(text('No medication records in this date range.')).toBe(false);
  await press('Retry records');
  expect(text('Synthetic drug A')).toBe(true);
});
test('date filtering keeps overlapping and ongoing courses, excludes deleted courses and validates dates', () => {
  const rows = [
    { id: 1, startDateTime: '2026-09-01', endDateTime: '2026-09-05' },
    { id: 2, startDateTime: '2026-10-01', endDateTime: null },
    { id: 3, startDateTime: '2026-10-01', isDeleted: true },
  ];
  expect(
    filterMedicationHistory(rows, '2026-10-05', '2026-10-05').map((r) => r.id),
  ).toEqual([2]);
  expect(filterMedicationHistory(rows, '', '').map((r) => r.id)).toEqual([
    1, 2,
  ]);
  expect(() => filterMedicationHistory(rows, '2026-02-31', '')).toThrow(
    /valid date/,
  );
  expect(() =>
    filterMedicationHistory(rows, '2026-10-06', '2026-10-05'),
  ).toThrow(/end date/);
});

test('page-local empty filter never claims a global absence and another page can supply the match', async () => {
  patient.listPatientMedicationsV1.mockImplementation(
    async (id, { pageNo }) => ({
      ok: true,
      data: {
        totalPages: 2,
        data: [
          {
            medicationID: 'Record-' + pageNo,
            patientID: id,
            prescriptionListID: 'Drug-A',
            startDateTime: pageNo === 0 ? '2026-09-01' : '2026-10-01',
            endDateTime: pageNo === 0 ? '2026-09-05' : null,
          },
        ],
      },
    }),
  );
  await mount();
  await press('Synthetic A');
  await act(async () =>
    screen.root
      .findByProps({ testID: 'medication_from' })
      .props.onChangeText('2026-10-05'),
  );
  expect(text('Synthetic drug A')).toBe(false);
  expect(text('No medication records in this date range.')).toBe(false);
  expect(
    text(
      'No courses on this page match these dates. Check other pages for further matches.',
    ),
  ).toBe(true);
  expect(
    screen.root.findAllByProps({ testID: 'medication_history_scope' }).length,
  ).toBeGreaterThan(0);
  await press('Next records');
  expect(text('Synthetic drug A')).toBe(true);
  expect(patient.listPatientMedicationsV1).toHaveBeenLastCalledWith(
    'Patient-A',
    expect.objectContaining({ pageNo: 1, pageSize: 100 }),
  );
});
