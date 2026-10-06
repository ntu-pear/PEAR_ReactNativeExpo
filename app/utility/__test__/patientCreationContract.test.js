/** @jest-environment node */
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => {}),
  removeItem: jest.fn(async () => {}),
}));
import {
  createPatientWithPrimary,
  withAtomicPrimaryGuardian,
  validateCreationGuardians,
} from 'app/utility/patientCreation';
const guardian = () => ({
  FirstName: 'synthetic',
  LastName: 'guardian',
  NRIC: 'SYNTHETIC_NR',
  ContactNo: '00000000',
  Address: 'test address',
  RelationshipName: 'Child',
  DOB: '1990-01-01',
  Gender: 'F',
});
const patient = { name: 'synthetic patient', nric: 'SYNTHETIC_PAT' };
test('patient and uppercase inline primary are one atomic POST; no second primary create', async () => {
  const api = {
    addPatient: jest.fn().mockResolvedValue({
      ok: true,
      data: { data: { id: 7, nric: patient.nric } },
    }),
    addGuardian: jest.fn(),
  };
  const r = await createPatientWithPrimary({
    api,
    patient,
    guardians: [guardian()],
  });
  expect(r).toMatchObject({ created: true, secondary: 'not_requested' });
  expect(api.addPatient).toHaveBeenCalledWith(
    expect.objectContaining({
      newGuardian: expect.objectContaining({
        firstName: 'SYNTHETIC',
        address: 'TEST ADDRESS',
      }),
      guardianRelationshipName: 'Child',
    }),
  );
  expect(api.addGuardian).not.toHaveBeenCalled();
});
test('atomic rejection never creates a guardian or announces created patient', async () => {
  const api = {
    addPatient: jest.fn().mockResolvedValue({ ok: false, status: 400 }),
    addGuardian: jest.fn(),
  };
  expect(
    (await createPatientWithPrimary({ api, patient, guardians: [guardian()] }))
      .created,
  ).toBe(false);
  expect(api.addGuardian).not.toHaveBeenCalled();
});
test.each(['failed', 'unknown'])(
  'secondary failure is explicit partial outcome: %s',
  async (kind) => {
    const api = {
      addPatient: jest.fn().mockResolvedValue({
        ok: true,
        data: { data: { id: '9007199254740993', nric: patient.nric } },
      }),
      addGuardian:
        kind === 'failed'
          ? jest.fn().mockResolvedValue({ ok: false, status: 409 })
          : jest.fn().mockRejectedValue(new Error('Synthetic timeout')),
    };
    expect(
      await createPatientWithPrimary({
        api,
        patient,
        guardians: [guardian(), { ...guardian(), NRIC: 'SYNTHETIC_2' }],
      }),
    ).toMatchObject({
      created: true,
      patientId: '9007199254740993',
      secondary: kind,
    });
    expect(api.addPatient).toHaveBeenCalledTimes(1);
  },
);
test('partly filled optional guardian blocks the patient POST', async () => {
  const api = { addPatient: jest.fn() };
  await expect(
    createPatientWithPrimary({
      api,
      patient,
      guardians: [guardian(), { FirstName: 'partial' }],
    }),
  ).rejects.toThrow(/guardian 2/);
  expect(api.addPatient).not.toHaveBeenCalled();
});
test('empty secondary is optional but primary/contact/login-required fields remain required', () => {
  expect(() => validateCreationGuardians([guardian(), {}])).not.toThrow();
  expect(() =>
    withAtomicPrimaryGuardian(patient, [{ ...guardian(), ContactNo: '' }]),
  ).toThrow();
  expect(() =>
    withAtomicPrimaryGuardian(patient, [
      { ...guardian(), IsChecked: true, Email: '' },
    ]),
  ).toThrow();
});

test('uncertain primary outcome persists a marker and is never replayed after a second attempt', async () => {
  const values = new Map();
  const storage = {
    getItem: async (k) => values.get(k) || null,
    setItem: async (k, v) => values.set(k, v),
    removeItem: async (k) => values.delete(k),
  };
  const api = {
    addPatient: jest.fn().mockResolvedValue({ ok: false, status: 500 }),
    addGuardian: jest.fn(),
  };
  const args = { api, patient, guardians: [guardian()], storage };
  expect(await createPatientWithPrimary(args)).toMatchObject({
    created: false,
    unknown: true,
  });
  expect(await createPatientWithPrimary(args)).toMatchObject({
    created: false,
    unknown: true,
  });
  expect(api.addPatient).toHaveBeenCalledTimes(1);
  expect(values.size).toBe(1);
});

test('unusable success identity keeps unknown marker and sends no follow-up guardian', async () => {
  const values = new Map();
  const storage = {
    getItem: async (k) => values.get(k) || null,
    setItem: async (k, v) => values.set(k, v),
    removeItem: async (k) => values.delete(k),
  };
  const api = {
    addPatient: jest.fn().mockResolvedValue({
      ok: true,
      data: { data: { id: 9007199254740992, nric: patient.nric } },
    }),
    addGuardian: jest.fn(),
  };
  expect(
    await createPatientWithPrimary({
      api,
      patient,
      guardians: [guardian(), guardian()],
      storage,
    }),
  ).toMatchObject({ created: false, unknown: true });
  expect(api.addGuardian).not.toHaveBeenCalled();
  expect(values.size).toBe(1);
});

test('simultaneous screen instances send at most one primary request', async () => {
  let release;
  const wait = new Promise((resolve) => {
    release = resolve;
  });
  const values = new Map();
  const storage = {
    getItem: async (k) => values.get(k) || null,
    setItem: async (k, v) => values.set(k, v),
    removeItem: async (k) => values.delete(k),
  };
  const api = { addPatient: jest.fn(() => wait), addGuardian: jest.fn() };
  const args = { api, patient, guardians: [guardian()], storage };
  const first = createPatientWithPrimary(args);
  const second = await createPatientWithPrimary(args);
  expect(second).toMatchObject({ created: false, unknown: true });
  release({ ok: true, data: { data: { id: 7, nric: patient.nric } } });
  expect(await first).toMatchObject({ created: true });
  expect(api.addPatient).toHaveBeenCalledTimes(1);
});
test('secondary HTTP500 is an unknown partial outcome without another primary POST', async () => {
  const api = {
    addPatient: jest.fn().mockResolvedValue({
      ok: true,
      data: { data: { id: 7, nric: patient.nric } },
    }),
    addGuardian: jest.fn().mockResolvedValue({ ok: false, status: 500 }),
  };
  expect(
    await createPatientWithPrimary({
      api,
      patient,
      guardians: [guardian(), guardian()],
    }),
  ).toMatchObject({ created: true, secondary: 'unknown' });
  expect(api.addPatient).toHaveBeenCalledTimes(1);
});

const durableStore = () => {
  const values = new Map();
  return {
    values,
    getItem: jest.fn(async (k) => values.get(k) || null),
    setItem: jest.fn(async (k, v) => values.set(k, v)),
    removeItem: jest.fn(async (k) => values.delete(k)),
  };
};
test.each(['SYNTHETIC_DIFFERENT', '', null, undefined, 7, '*****PAT'])(
  'valid returned ID with unverified NRIC %p retains unknown marker and sends no secondary or replay',
  async (nric) => {
    const storage = durableStore();
    const api = {
      addPatient: jest
        .fn()
        .mockResolvedValue({ ok: true, data: { data: { id: 999, nric } } }),
      addGuardian: jest.fn(),
    };
    const args = { api, patient, guardians: [guardian(), guardian()], storage };
    const result = await createPatientWithPrimary(args);
    expect(result).toMatchObject({
      created: false,
      unknown: true,
      invalidIdentity: true,
      secondary: 'not_sent',
    });
    expect(result.patientId).toBeUndefined();
    expect(storage.values.size).toBe(1);
    expect(storage.removeItem).not.toHaveBeenCalled();
    expect(api.addGuardian).not.toHaveBeenCalled();
    expect(await createPatientWithPrimary(args)).toMatchObject({
      created: false,
      unknown: true,
    });
    expect(api.addPatient).toHaveBeenCalledTimes(1);
  },
);
test.each([null, [], { patientId: 7, nric: 'SYNTHETIC_PAT' }])(
  'missing canonical Patient identity shape %p blocks all follow-ups',
  async (row) => {
    const storage = durableStore();
    const api = {
      addPatient: jest
        .fn()
        .mockResolvedValue({ ok: true, data: { data: row } }),
      addGuardian: jest.fn(),
    };
    expect(
      await createPatientWithPrimary({
        api,
        patient,
        guardians: [guardian(), guardian()],
        storage,
      }),
    ).toMatchObject({ created: false, unknown: true, invalidIdentity: true });
    expect(storage.values.size).toBe(1);
    expect(api.addGuardian).not.toHaveBeenCalled();
  },
);
test('unwrapped successful response is not assumed to be canonical creation identity', async () => {
  const storage = durableStore();
  const api = {
    addPatient: jest
      .fn()
      .mockResolvedValue({ ok: true, data: { id: 7, nric: patient.nric } }),
    addGuardian: jest.fn(),
  };
  expect(
    await createPatientWithPrimary({
      api,
      patient,
      guardians: [guardian(), guardian()],
      storage,
    }),
  ).toMatchObject({ unknown: true, invalidIdentity: true });
  expect(api.addGuardian).not.toHaveBeenCalled();
  expect(storage.removeItem).not.toHaveBeenCalled();
});
test('matching canonical NRIC case and outer whitespace normalization permits only the verified exact patient follow-up', async () => {
  const storage = durableStore();
  const api = {
    addPatient: jest.fn().mockResolvedValue({
      ok: true,
      data: { data: { id: '9007199254740993', nric: ' SyNtHeTiC_pAt ' } },
    }),
    addGuardian: jest.fn().mockResolvedValue({ ok: true }),
  };
  const result = await createPatientWithPrimary({
    api,
    patient: { ...patient, nric: ' synthetic_pat ' },
    guardians: [guardian(), guardian()],
    storage,
  });
  expect(result).toMatchObject({
    created: true,
    patientId: '9007199254740993',
    secondary: 'added',
  });
  expect(api.addPatient).toHaveBeenCalledWith(
    expect.objectContaining({ nric: 'SYNTHETIC_PAT' }),
  );
  expect(api.addGuardian).toHaveBeenCalledWith(
    expect.objectContaining({ patientId: '9007199254740993' }),
  );
  expect(storage.values.size).toBe(0);
  expect(storage.removeItem).toHaveBeenCalledTimes(1);
});
