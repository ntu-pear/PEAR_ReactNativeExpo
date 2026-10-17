import React from 'react';
import { act, create } from 'react-test-renderer';
import AuthContext from 'app/auth/context';
import MedicationScheduleScreen from 'app/screens/MedicationScheduleScreen';
import scheduleApi from 'app/api/schedule';
import { confirmAndLogMedicationAdministration } from 'app/utility/confirmMedicationAdministration';
import { medicationDoseRows } from 'app/utility/medicationDoseRead';

jest.mock('@react-navigation/native', () => ({
  useIsFocused: () => true,
  useFocusEffect: (cb) => require('react').useEffect(cb, [cb]),
}));
jest.mock('app/api/schedule', () => ({ getMedicationScheduleV1: jest.fn() }));
jest.mock('app/utility/confirmMedicationAdministration', () => ({
  confirmAndLogMedicationAdministration: jest.fn(),
}));
const row = {
  PatientID: 7,
  PrescriptionName: 'SYNTHETIC MEDICATION',
  AdministerDate: '2026-10-18',
  AdministerTime: '0930',
  AssignedTo: 'Caregiver-A',
  Status: '0',
};
let screen;
const view = (role = 'SUPERVISOR', id = 'Actor-A') => (
  <AuthContext.Provider value={{ user: { id, roleName: role } }}>
    <MedicationScheduleScreen />
  </AuthContext.Provider>
);
const mount = async (role, id) => {
  await act(async () => {
    screen = create(view(role, id));
  });
};
const press = async (id) => {
  await act(async () =>
    screen.root.findAllByProps({ testID: id })[0].props.onPress(),
  );
};
const rendered = () => {
  const text = (node) => {
    if (node == null) return '';
    if (typeof node !== 'object') return String(node);
    if (Array.isArray(node)) return node.map(text).join('');
    return text(node.children);
  };
  return text(screen.toJSON());
};
beforeEach(() => {
  jest.useFakeTimers().setSystemTime(new Date('2026-10-18T09:30:00+08:00'));
  jest.clearAllMocks();
  scheduleApi.getMedicationScheduleV1.mockResolvedValue({
    ok: true,
    status: 200,
    data: [row],
  });
});
afterEach(() => {
  if (screen) act(() => screen.unmount());
  screen = null;
  jest.useRealTimers();
});

test.each(['GUARDIAN', 'DOCTOR', 'ADMIN'])(
  'role %s cannot invoke the mutating medication GET',
  async (role) => {
    await mount(role);
    expect(rendered()).toContain('caregivers and supervisors');
    expect(scheduleApi.getMedicationScheduleV1).not.toHaveBeenCalled();
  },
);
test.each(['SUPERVISOR', 'CAREGIVER'])(
  '%s displays the server scope with one data endpoint and no client allocation filter',
  async (role) => {
    scheduleApi.getMedicationScheduleV1.mockResolvedValue({
      ok: true,
      data: [row, { ...row, PatientID: 8, AssignedTo: 'Another-Caregiver' }],
    });
    await mount(role);
    expect(rendered()).toContain('Patient 7');
    expect(rendered()).toContain('Patient 8');
    expect(scheduleApi.getMedicationScheduleV1).toHaveBeenCalledTimes(1);
  },
);
test('administer uses returned slot identity and date; refresh follows accepted recording', async () => {
  await mount('CAREGIVER');
  await press('dose_administer_0');
  const args = confirmAndLogMedicationAdministration.mock.calls[0][0];
  expect(args).toMatchObject({
    patientID: 7,
    medName: row.PrescriptionName,
    medTime: '0930',
    administrationDate: '2026-10-18',
  });
  expect(scheduleApi.getMedicationScheduleV1).toHaveBeenCalledTimes(1);
  await act(async () => args.onRecorded());
  expect(scheduleApi.getMedicationScheduleV1).toHaveBeenCalledTimes(2);
});
test('given dose preserves actual actor/time and has no administer control', async () => {
  scheduleApi.getMedicationScheduleV1.mockResolvedValue({
    ok: true,
    data: [
      {
        ...row,
        Status: '1',
        AdministeredBy: 'Actual-Actor',
        ActualAdministerTime: '2026-10-18T01:31:00',
      },
    ],
  });
  await mount();
  expect(rendered()).toContain('Actual-Actor');
  expect(rendered()).toContain('01:31:00');
  expect(rendered()).not.toContain('(UTC)');
  expect(
    screen.root.findAllByProps({ testID: 'dose_administer_0' }),
  ).toHaveLength(0);
});
test('yesterday dose cannot be administered today', async () => {
  scheduleApi.getMedicationScheduleV1.mockResolvedValue({
    ok: true,
    data: [{ ...row, AdministerDate: '2026-10-17' }],
  });
  await mount();
  expect(
    screen.root.findAllByProps({ testID: 'dose_administer_0' })[0].props
      .disabled,
  ).toBe(true);
});
test('known empty object is an empty day; malformed payload is an error, not empty', async () => {
  scheduleApi.getMedicationScheduleV1.mockResolvedValue({
    ok: true,
    data: { message: 'No medication schedules to be returned' },
  });
  await mount();
  expect(rendered()).toContain('No medication doses');
  scheduleApi.getMedicationScheduleV1.mockResolvedValue({
    ok: true,
    data: { unexpected: [] },
  });
  await press('dose_refresh');
  expect(rendered()).toContain('could not be loaded');
  expect(rendered()).not.toContain('No medication doses');
});
test.each([
  [401, 'login has expired'],
  [403, 'do not have access'],
  [503, 'required service is unavailable'],
])('HTTP%s clears prior doses and shows recovery', async (status, message) => {
  await mount();
  expect(rendered()).toContain('Patient 7');
  scheduleApi.getMedicationScheduleV1.mockResolvedValue({ ok: false, status });
  await press('dose_refresh');
  expect(rendered()).not.toContain('Patient 7');
  expect(rendered()).toContain(message);
});
test('late response from previous login never exposes its doses', async () => {
  let resolve;
  scheduleApi.getMedicationScheduleV1.mockImplementationOnce(
    () =>
      new Promise((done) => {
        resolve = done;
      }),
  );
  await mount();
  scheduleApi.getMedicationScheduleV1.mockResolvedValue({ ok: true, data: [] });
  await act(async () => screen.update(view('CAREGIVER', 'Actor-B')));
  await act(async () => resolve({ ok: true, data: [row] }));
  expect(rendered()).not.toContain('Patient 7');
});
test('bounded deadline allows recovery without showing empty success', async () => {
  scheduleApi.getMedicationScheduleV1.mockReturnValue(new Promise(() => {}));
  await mount();
  await act(async () => jest.advanceTimersByTime(30001));
  expect(rendered()).toContain('could not be loaded');
});
test('ambiguous, invalid dates/status/patient/time fail closed', () => {
  expect(() => medicationDoseRows([row, row])).toThrow('ambiguous');
  for (const bad of [
    { Status: '2' },
    { PatientID: 0 },
    { AdministerDate: '2026-02-30' },
    { AdministerTime: '2500' },
    { AdministerTime: 1000 },
    { AssignedTo: {} },
    { AdministeredBy: {} },
    { ActualAdministerTime: {} },
    { PrescriptionName: '' },
  ]) {
    expect(() => medicationDoseRows([{ ...row, ...bad }])).toThrow();
  }
});

test('pending confirmation is invalidated by unmount or account change', async () => {
  await mount();
  await press('dose_administer_0');
  const args = confirmAndLogMedicationAdministration.mock.calls[0][0];
  expect(args.isCurrent()).toBe(true);
  await act(async () => screen.update(view('CAREGIVER', 'Actor-B')));
  expect(args.isCurrent()).toBe(false);
  await press('dose_administer_0');
  const next = confirmAndLogMedicationAdministration.mock.calls[1][0];
  expect(next.isCurrent()).toBe(true);
  act(() => screen.unmount());
  screen = null;
  expect(next.isCurrent()).toBe(false);
});
