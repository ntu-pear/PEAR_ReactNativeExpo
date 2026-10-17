import { Alert } from 'react-native';
import scheduleApi from 'app/api/schedule';
import { confirmAndLogMedicationAdministration } from 'app/utility/confirmMedicationAdministration';
import { medicationWindow } from 'app/utility/medicationAdminister';
jest.mock('react-native', () => ({ Alert: { alert: jest.fn() } }));
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(),
  removeItem: jest.fn().mockResolvedValue(),
}));
jest.mock('app/api/schedule', () => ({
  getMedicationScheduleV1: jest.fn(),
  updateMedicationScheduleV1: jest.fn(),
}));
const now = new Date('2026-10-05T10:00:00+08:00');
const args = {
  user: { id: 'TEST-CG-1', roleName: 'SUPERVISOR' },
  patientID: 7,
  patientName: 'TEST PATIENT',
  medName: 'TEST MEDICATION',
  medDosage: 'TEST DOSE',
  medTime: '1000',
};
const slot = {
  PatientID: 7,
  PrescriptionName: 'TEST MEDICATION',
  AdministerDate: '2026-10-05',
  AdministerTime: '1000',
  AssignedTo: 'TEST-CG-1',
  Status: '0',
};
beforeEach(() => {
  jest.useFakeTimers().setSystemTime(now);
  jest.clearAllMocks();
  scheduleApi.getMedicationScheduleV1.mockResolvedValue({
    ok: true,
    data: [slot],
  });
  scheduleApi.updateMedicationScheduleV1.mockResolvedValue({
    ok: true,
    status: 200,
  });
});
afterEach(() => jest.useRealTimers());
const lastAlert = () =>
  Alert.alert.mock.calls[Alert.alert.mock.calls.length - 1];
test('30-minute boundaries are inclusive; invalid time and other dates are rejected', () => {
  expect(medicationWindow('0930', now, now)).toEqual({
    allowed: true,
    outsideWindow: false,
  });
  expect(medicationWindow('1030', now, now)).toEqual({
    allowed: true,
    outsideWindow: false,
  });
  expect(medicationWindow('0929', now, now).outsideWindow).toBe(true);
  expect(medicationWindow('1031', now, now).outsideWindow).toBe(true);
  expect(medicationWindow('2560', now, now).allowed).toBe(false);
  expect(medicationWindow('1000', new Date(2026, 9, 6), now).allowed).toBe(
    false,
  );
});
test('outside-time and alternate-caregiver confirmations both precede the final confirmation and real update', async () => {
  scheduleApi.getMedicationScheduleV1.mockResolvedValue({
    ok: true,
    data: [{ ...slot, AdministerTime: '0900', AssignedTo: 'TEST-CG-2' }],
  });
  await confirmAndLogMedicationAdministration({ ...args, medTime: '0900' });
  expect(lastAlert()[0]).toBe('Outside scheduled medication time');
  expect(scheduleApi.updateMedicationScheduleV1).not.toHaveBeenCalled();
  lastAlert()[2]
    .find((b) => b.text === 'Continue')
    .onPress();
  expect(lastAlert()[0]).toBe('Not the assigned caregiver');
  lastAlert()[2]
    .find((b) => b.text === 'Continue')
    .onPress();
  expect(lastAlert()[0]).toBe('Confirm medication administration');
  await lastAlert()[2]
    .find((b) => b.text === 'OK')
    .onPress();
  expect(scheduleApi.updateMedicationScheduleV1).toHaveBeenCalledWith(
    expect.objectContaining({
      AdministerDate: '2026-10-05',
    }),
  );
});
test('already administered dose shows its actual administrator and cannot update', async () => {
  scheduleApi.getMedicationScheduleV1.mockResolvedValue({
    ok: true,
    data: [{ ...slot, Status: '1', AdministeredBy: 'TEST-CG-2' }],
  });
  await confirmAndLogMedicationAdministration(args);
  expect(lastAlert()[0]).toBe('Medication already administered');
  expect(lastAlert()[1]).toContain('TEST-CG-2');
  expect(scheduleApi.updateMedicationScheduleV1).not.toHaveBeenCalled();
});
test('wrong-day slot and denied schedule never produce an administration confirmation', async () => {
  scheduleApi.getMedicationScheduleV1.mockResolvedValueOnce({
    ok: true,
    data: [{ ...slot, AdministerDate: '2026-10-04' }],
  });
  await confirmAndLogMedicationAdministration(args);
  expect(lastAlert()[0]).toBe('Administration not recorded');
  scheduleApi.getMedicationScheduleV1.mockResolvedValueOnce({
    ok: false,
    status: 403,
  });
  await confirmAndLogMedicationAdministration(args);
  expect(lastAlert()[0]).toBe('Administration not recorded');
  expect(scheduleApi.updateMedicationScheduleV1).not.toHaveBeenCalled();
});

test('repeated final confirmation makes one update and refreshes the view once', async () => {
  const onRecorded = jest.fn();
  await confirmAndLogMedicationAdministration({ ...args, onRecorded });
  const confirm = lastAlert()[2].find((b) => b.text === 'OK').onPress;
  await Promise.all([confirm(), confirm()]);
  await confirm();
  expect(scheduleApi.updateMedicationScheduleV1).toHaveBeenCalledTimes(1);
  expect(onRecorded).toHaveBeenCalledTimes(1);
});

test('a slot administered after opening confirmation is rechecked before any update', async () => {
  await confirmAndLogMedicationAdministration(args);
  const confirm = lastAlert()[2].find((b) => b.text === 'OK').onPress;
  scheduleApi.getMedicationScheduleV1.mockResolvedValue({
    ok: true,
    data: [{ ...slot, Status: '1' }],
  });
  await confirm();
  expect(scheduleApi.updateMedicationScheduleV1).not.toHaveBeenCalled();
  expect(lastAlert()[0]).toBe('Medication administered');
});

test.each(['DOCTOR', 'GUARDIAN', 'ADMIN', ''])(
  'role %s cannot request or submit medication administration',
  async (roleName) => {
    await confirmAndLogMedicationAdministration({
      ...args,
      user: { id: 'TEST-USER', roleName },
    });
    expect(lastAlert()[0]).toBe('Administration unavailable');
    expect(scheduleApi.getMedicationScheduleV1).not.toHaveBeenCalled();
    expect(scheduleApi.updateMedicationScheduleV1).not.toHaveBeenCalled();
  },
);

test('a timed-out administration stays unknown and Check status reads without another write', async () => {
  scheduleApi.getMedicationScheduleV1.mockResolvedValue({
    ok: true,
    data: [{ ...slot, PatientID: 8 }],
  });
  scheduleApi.updateMedicationScheduleV1.mockImplementationOnce(
    () => new Promise(() => {}),
  );
  await confirmAndLogMedicationAdministration({ ...args, patientID: 8 });
  const confirm = lastAlert()[2].find((button) => button.text === 'OK').onPress;
  const pending = confirm();
  await jest.advanceTimersByTimeAsync(30001);
  await pending;
  expect(lastAlert()[0]).toBe('Administration outcome unknown');
  expect(lastAlert()[1]).toContain('may still complete');
  await confirm();
  expect(scheduleApi.updateMedicationScheduleV1).toHaveBeenCalledTimes(1);
  const check = lastAlert()[2].find(
    (button) => button.text === 'Check status',
  ).onPress;
  await check();
  expect(lastAlert()[0]).toBe('Administration outcome unknown');
  expect(scheduleApi.updateMedicationScheduleV1).toHaveBeenCalledTimes(1);
  scheduleApi.getMedicationScheduleV1.mockResolvedValue({
    ok: true,
    data: [{ ...slot, PatientID: 8, Status: '1', AdministeredBy: 'TEST-CG-2' }],
  });
  await lastAlert()[2]
    .find((button) => button.text === 'Check status')
    .onPress();
  expect(lastAlert()[0]).toBe('Administration verified');
  expect(lastAlert()[1]).toContain('TEST-CG-2');
  expect(scheduleApi.updateMedicationScheduleV1).toHaveBeenCalledTimes(1);
});

test.each(['TEST-CG-1', 'TEST-TEMP-CG'])(
  'caregiver %s confirms a returned allocated dose and server receives no actor override',
  async (id) => {
    await confirmAndLogMedicationAdministration({
      ...args,
      user: { id, roleName: 'CAREGIVER' },
      caregiverId: 'TEST-CG-1',
      tempCaregiverId: 'TEST-TEMP-CG',
    });
    expect(lastAlert()[0]).toBe('Confirm medication administration');
    await lastAlert()[2]
      .find((b) => b.text === 'OK')
      .onPress();
    expect(scheduleApi.updateMedicationScheduleV1).toHaveBeenCalledWith({
      PatientID: 7,
      PrescriptionName: slot.PrescriptionName,
      AdministerDate: slot.AdministerDate,
      AdministerTime: slot.AdministerTime,
      Status: '1',
    });
  },
);
test('caregiver missing a dose in the server-scoped list cannot submit', async () => {
  scheduleApi.getMedicationScheduleV1.mockResolvedValue({ ok: true, data: [] });
  await confirmAndLogMedicationAdministration({
    ...args,
    user: { id: 'TEST-CG-1', roleName: 'CAREGIVER' },
  });
  expect(lastAlert()[0]).toBe('Administration not recorded');
  expect(scheduleApi.updateMedicationScheduleV1).not.toHaveBeenCalled();
});
test('allocation revoked after confirmation is rejected by Scheduler; no success is claimed', async () => {
  await confirmAndLogMedicationAdministration({
    ...args,
    patientID: 17,
    user: { id: 'TEST-CG-1', roleName: 'CAREGIVER' },
  });
  // First establish a valid synthetic slot for this separate patient.
  scheduleApi.getMedicationScheduleV1.mockResolvedValue({
    ok: true,
    data: [{ ...slot, PatientID: 17 }],
  });
  await confirmAndLogMedicationAdministration({
    ...args,
    patientID: 17,
    user: { id: 'TEST-CG-1', roleName: 'CAREGIVER' },
  });
  scheduleApi.updateMedicationScheduleV1.mockResolvedValueOnce({
    ok: false,
    status: 403,
  });
  await lastAlert()[2]
    .find((b) => b.text === 'OK')
    .onPress();
  expect(lastAlert()[0]).toBe('Administration outcome unknown');
});

test('a preflight response after leaving the active account/page cannot open confirmation or write', async () => {
  let finish;
  let active = true;
  scheduleApi.getMedicationScheduleV1.mockReturnValue(
    new Promise((resolve) => {
      finish = resolve;
    }),
  );
  const pending = confirmAndLogMedicationAdministration({
    ...args,
    isCurrent: () => active,
  });
  active = false;
  finish({ ok: true, data: [slot] });
  await pending;
  expect(Alert.alert).not.toHaveBeenCalled();
  expect(scheduleApi.updateMedicationScheduleV1).not.toHaveBeenCalled();
});
test('a previously opened final confirmation cannot write after active context changes', async () => {
  let active = true;
  await confirmAndLogMedicationAdministration({
    ...args,
    isCurrent: () => active,
  });
  expect(lastAlert()[0]).toBe('Confirm medication administration');
  active = false;
  await lastAlert()[2]
    .find((button) => button.text === 'OK')
    .onPress();
  expect(scheduleApi.updateMedicationScheduleV1).not.toHaveBeenCalled();
});
