jest.mock('@react-native-async-storage/async-storage', () => ({}));
import {
  createPatientWithPrimary,
  withAtomicPrimaryGuardian,
} from 'app/utility/patientCreation';
const user = { id: 'TEST-ACTOR', roleName: 'SUPERVISOR' };
const patient = { name: 'SYNTHETIC PATIENT', nric: 'SYNTHETIC_PAT' };
const primary = () => ({
  Mode: 'existing',
  ExistingGuardianId: '9007199254740993',
  NRIC: 'S0000000J',
  SelectedNric: 'S0000000J',
  RelationshipName: 'Child',
});
const environment = () => {
  const values = new Map();
  const storage = {
    getItem: async (k) => values.get(k) || null,
    setItem: async (k, v) => values.set(k, v),
    removeItem: async (k) => values.delete(k),
  };
  const guardian = {
    id: primary().ExistingGuardianId,
    nric: primary().NRIC,
    active: 'Y',
    isDeleted: '0',
  };
  const guardianApi = {
    getGuardianByNRIC: jest.fn().mockResolvedValue({
      ok: true,
      data: { patient_guardian: guardian, patients: [] },
    }),
    getPatientGuardian: jest.fn().mockResolvedValue({
      ok: true,
      data: {
        patient: { id: 7 },
        patient_guardians: [
          { patient_guardian: guardian, relationshipName: 'Child' },
        ],
      },
    }),
    getPatientAllocation: jest.fn().mockResolvedValue({
      ok: true,
      data: {
        id: 3,
        patientId: 7,
        guardianId: guardian.id,
        guardian2Id: null,
        active: 'Y',
        isDeleted: false,
      },
    }),
  };
  const api = {
    addPatient: jest.fn().mockResolvedValue({
      ok: true,
      data: { data: { id: 7, nric: patient.nric } },
    }),
    addGuardian: jest.fn(),
  };
  return {
    values,
    api,
    guardianApi,
    args: {
      api,
      guardianApi,
      user,
      patient,
      guardians: [primary()],
      storage,
      timeoutMs: 15,
    },
  };
};
test('existing primary uses exact guardianId in one patient transaction and verifies membership/allocation', async () => {
  const e = environment();
  expect(await createPatientWithPrimary(e.args)).toMatchObject({
    created: true,
    patientId: 7,
    secondary: 'not_requested',
  });
  const payload = e.api.addPatient.mock.calls[0][0];
  expect(payload.guardianId).toBe('9007199254740993');
  expect(payload).not.toHaveProperty('newGuardian');
  expect(e.api.addGuardian).not.toHaveBeenCalled();
  expect(e.values.size).toBe(0);
});
test('stale query, forbidden role and unsafe selected IDs cannot build registration payloads', () => {
  expect(() =>
    withAtomicPrimaryGuardian(
      patient,
      [{ ...primary(), NRIC: 'S0000001I' }],
      user,
    ),
  ).toThrow();
  expect(() =>
    withAtomicPrimaryGuardian(patient, [primary()], {
      ...user,
      roleName: 'CAREGIVER',
    }),
  ).toThrow();
  expect(() =>
    withAtomicPrimaryGuardian(
      patient,
      [{ ...primary(), ExistingGuardianId: 9007199254740992 }],
      user,
    ),
  ).toThrow();
});
test('selected identity change during fresh lookup prevents the patient POST', async () => {
  const e = environment();
  const result = await e.guardianApi.getGuardianByNRIC();
  e.guardianApi.getGuardianByNRIC.mockImplementation(async () => {
    e.args.guardians[0].ExistingGuardianId = 8;
    return result;
  });
  await expect(createPatientWithPrimary(e.args)).rejects.toThrow();
  expect(e.api.addPatient).not.toHaveBeenCalled();
});
test('guardian capacity and lookup failures block submission without a not-found fallback', async () => {
  const e = environment();
  const found = await e.guardianApi.getGuardianByNRIC();
  found.data.patients = [{ patient: { id: 10 } }, { patient: { id: 11 } }];
  await expect(createPatientWithPrimary(e.args)).rejects.toThrow();
  e.guardianApi.getGuardianByNRIC.mockResolvedValue({
    ok: false,
    status: 404,
    data: { detail: 'Error' },
  });
  await expect(createPatientWithPrimary(e.args)).rejects.toThrow();
  expect(e.api.addPatient).not.toHaveBeenCalled();
});
test('allocation guardian2-only or relationship disagreement keeps successful create uncertain', async () => {
  const e = environment();
  e.guardianApi.getPatientAllocation.mockResolvedValue({
    ok: true,
    data: {
      id: 3,
      patientId: 7,
      guardianId: 2,
      guardian2Id: primary().ExistingGuardianId,
      active: 'Y',
      isDeleted: false,
    },
  });
  expect(await createPatientWithPrimary(e.args)).toMatchObject({
    created: false,
    unknown: true,
    primaryUnverified: true,
  });
  expect(e.values.size).toBe(1);
  expect(e.api.addGuardian).not.toHaveBeenCalled();
  expect(await createPatientWithPrimary(e.args)).toMatchObject({
    unknown: true,
  });
  expect(e.api.addPatient).toHaveBeenCalledTimes(1);
});
test('a post-commit error retains the uncertain-create guard across restart', async () => {
  const e = environment();
  e.api.addPatient.mockResolvedValue({ ok: false, status: 400 });
  expect(await createPatientWithPrimary(e.args)).toMatchObject({
    unknown: true,
    created: false,
  });
  expect(await createPatientWithPrimary({ ...e.args })).toMatchObject({
    unknown: true,
  });
  expect(e.api.addPatient).toHaveBeenCalledTimes(1);
  expect(e.api.addGuardian).not.toHaveBeenCalled();
});
test('timeout and late successful response never issue a second patient or guardian write', async () => {
  const e = environment();
  let release;
  e.api.addPatient.mockImplementation(
    () =>
      new Promise((resolve) => {
        release = resolve;
      }),
  );
  expect(await createPatientWithPrimary(e.args)).toMatchObject({
    unknown: true,
  });
  release({ ok: true, data: { data: { id: 7, nric: patient.nric } } });
  expect(await createPatientWithPrimary(e.args)).toMatchObject({
    unknown: true,
  });
  expect(e.values.size).toBe(1);
  expect(e.api.addPatient).toHaveBeenCalledTimes(1);
  expect(e.api.addGuardian).not.toHaveBeenCalled();
});
test('account selection race and a filled secondary cannot send another write', async () => {
  const e = environment();
  expect(
    await createPatientWithPrimary({
      ...e.args,
      isSelectionCurrent: () => false,
    }),
  ).toMatchObject({ created: false });
  await expect(
    createPatientWithPrimary({
      ...e.args,
      guardians: [primary(), { FirstName: 'SYNTHETIC' }],
    }),
  ).rejects.toThrow();
  expect(e.api.addPatient).not.toHaveBeenCalled();
});
