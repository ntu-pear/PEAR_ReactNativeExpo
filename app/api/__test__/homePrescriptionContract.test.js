/** @jest-environment node */
const mockClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
};
jest.mock('app/api/client', () => ({
  __esModule: true,
  default: mockClient,
  PATIENT_V1_BASE: 'http://synthetic.invalid/api/v1',
}));
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => {}),
  removeItem: jest.fn(async () => {}),
}));
const api = require('app/api/patient').default;
const {
  buildHomePrescription,
  normalizeHomePrescription,
} = require('app/utility/homePrescription');
const form = () => ({
  prescriptionListID: '9007199254740993',
  dosage: '1 tablet',
  frequencyPerDay: '2',
  instruction: 'Synthetic',
  startDate: '2026-10-06',
  endDate: null,
  afterMeal: null,
  isChronic: true,
  prescriptionRemarks: 'Synthetic',
});
beforeEach(() => {
  jest.clearAllMocks();
  mockClient.post.mockResolvedValue({ ok: true, status: 200 });
  mockClient.put.mockResolvedValue({ ok: true, status: 200 });
  mockClient.delete.mockResolvedValue({ ok: true, status: 200 });
});
test('canonical list route and PascalCase fields/ongoing and meal2 are normalized', async () => {
  mockClient.get.mockResolvedValue({
    ok: true,
    data: {
      data: [
        {
          Id: 10,
          PatientId: 7,
          PrescriptionListId: 101,
          Dosage: '1',
          FrequencyPerDay: 2,
          StartDate: '2026-10-06',
          EndDate: null,
          IsAfterMeal: '2',
          Status: '1',
          CreatedDateTime: '2026-10-06',
        },
      ],
      totalPages: 1,
    },
  });
  const r = await api.listPatientPrescriptionsV1('7', { pageNo: 2 });
  expect(mockClient.get).toHaveBeenCalledWith(
    '/Prescription/PatientPrescription',
    expect.objectContaining({ patient_id: '7', pageNo: 2, require_auth: true }),
    expect.any(Object),
  );
  expect(r.data.data[0]).toMatchObject({
    prescriptionID: 10,
    prescriptionListID: 101,
    frequencyPerDay: 2,
    afterMeal: null,
    isChronic: true,
    endDate: null,
  });
});
test('create sends required PascalCase fields, precise IDs and signed-in actor', async () => {
  expect(
    (await api.addPatientPrescriptionV1('7', form(), 'ActorCase')).ok,
  ).toBe(true);
  expect(mockClient.post).toHaveBeenCalledWith(
    '/Prescription/add',
    expect.objectContaining({
      PatientId: '7',
      PrescriptionListId: '9007199254740993',
      FrequencyPerDay: 2,
      Status: '1',
      IsAfterMeal: '2',
      CreatedById: 'ActorCase',
      EndDate: null,
    }),
    expect.any(Object),
  );
});
test('update preserves meal2 and uses same-patient fresh read then canonical PUT', async () => {
  mockClient.get.mockResolvedValue({
    ok: true,
    data: {
      data: {
        Id: '9007199254740993',
        PatientId: 7,
        IsDeleted: '0',
        IsAfterMeal: '2',
      },
    },
  });
  await api.updatePatientPrescriptionV1(
    '7',
    '9007199254740993',
    form(),
    'ActorCase',
  );
  expect(mockClient.put).toHaveBeenCalledWith(
    '/Prescription/update/9007199254740993',
    expect.objectContaining({
      ModifiedById: 'ActorCase',
      IsAfterMeal: '2',
      EndDate: null,
    }),
    expect.any(Object),
  );
});
test('wrong-patient read blocks update and delete', async () => {
  mockClient.get.mockResolvedValue({
    ok: true,
    data: { data: { Id: 9, PatientId: 8 } },
  });
  expect(
    (await api.updatePatientPrescriptionV1('7', 9, form(), 'actor')).ok,
  ).toBe(false);
  expect((await api.deletePatientPrescriptionV1('7', 9)).ok).toBe(false);
  expect(mockClient.put).not.toHaveBeenCalled();
  expect(mockClient.delete).not.toHaveBeenCalled();
});
test('canonical delete follows same-patient validation', async () => {
  mockClient.get.mockResolvedValue({
    ok: true,
    data: { data: { Id: 9, PatientId: 7, IsDeleted: '0' } },
  });
  await api.deletePatientPrescriptionV1('7', 9);
  expect(mockClient.delete).toHaveBeenCalledWith(
    '/Prescription/delete/9',
    { require_auth: true },
    expect.any(Object),
  );
});
test.each([0, 1.5, 'invalid'])(
  'invalid frequency %p blocks create',
  async (frequency) => {
    await api.addPatientPrescriptionV1(
      '7',
      { ...form(), frequencyPerDay: frequency },
      'actor',
    );
    expect(mockClient.post).not.toHaveBeenCalled();
  },
);
test('missing actor or rounded input never creates; invalid/reversed calendar dates reject', async () => {
  await api.addPatientPrescriptionV1('7', form(), '');
  await api.addPatientPrescriptionV1(9007199254740992, form(), 'actor');
  expect(mockClient.post).not.toHaveBeenCalled();
  expect(() =>
    buildHomePrescription({
      patientId: 7,
      form: { ...form(), startDate: '2026-02-30' },
      actorId: 'actor',
    }),
  ).toThrow();
  expect(() =>
    buildHomePrescription({
      patientId: 7,
      form: { ...form(), endDate: '2026-10-05' },
      actorId: 'actor',
    }),
  ).toThrow();
});

test('unknown chronic status is retained during an unrelated edit rather than recoded nonchronic', () => {
  const normalized = normalizeHomePrescription({
    Status: 'unclassified',
    IsAfterMeal: '2',
    EndDate: null,
  });
  expect(normalized.isChronic).toBeNull();
  expect(normalized.afterMeal).toBeNull();
  expect(
    buildHomePrescription({
      patientId: 7,
      actorId: 'actor',
      form: { ...form(), isChronic: null },
      existing: { Status: 'unclassified', IsAfterMeal: '2' },
    }),
  ).toMatchObject({ Status: 'unclassified', IsAfterMeal: '2', EndDate: null });
});
