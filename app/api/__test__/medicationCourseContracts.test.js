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
const form = () => ({
  medicationID: '9007199254740993',
  prescriptionListID: 3,
  administerTime: '0900',
  dosage: '1',
  instruction: 'Synthetic',
  startDateTime: '2026-10-05',
  endDateTime: null,
  prescriptionRemarks: 'Synthetic',
});
beforeEach(() => {
  jest.clearAllMocks();
  mockClient.post.mockResolvedValue({ ok: true, status: 200 });
  mockClient.put.mockResolvedValue({ ok: true, status: 200 });
  mockClient.delete.mockResolvedValue({ ok: true, status: 200 });
  mockClient.get.mockResolvedValue({
    ok: true,
    data: { data: { Id: '9007199254740993', PatientId: '7', IsDeleted: '0' } },
  });
});
test('create uses canonical path with prescription ID and actual actor', async () => {
  expect((await api.addPatientMedicationV1('7', form(), 'ActorCase')).ok).toBe(
    true,
  );
  expect(mockClient.post).toHaveBeenCalledWith(
    '/Medication/add',
    expect.objectContaining({
      PatientId: '7',
      PrescriptionListId: 3,
      CreatedById: 'ActorCase',
      ModifiedById: 'ActorCase',
    }),
    expect.objectContaining({ baseURL: 'http://synthetic.invalid/api/v1' }),
  );
});
test('update verifies fresh patient boundary and preserves lossless record path', async () => {
  await api.updatePatientMedicationV1('7', form(), 'ActorCase');
  expect(mockClient.get).toHaveBeenCalledWith(
    '/Medication/9007199254740993',
    { require_auth: true },
    expect.any(Object),
  );
  expect(mockClient.put).toHaveBeenCalledWith(
    '/Medication/update/9007199254740993',
    expect.objectContaining({ ModifiedById: 'ActorCase', PatientId: '7' }),
    expect.any(Object),
  );
});
test.each([false, true])(
  'failed/cross-patient fresh read blocks update and delete: %s',
  async (cross) => {
    mockClient.get.mockResolvedValue(
      cross
        ? { ok: true, data: { data: { Id: '9007199254740993', PatientId: 8 } } }
        : { ok: false, status: 403 },
    );
    expect(
      (await api.updatePatientMedicationV1('7', form(), 'ActorCase')).ok,
    ).toBe(false);
    expect(
      (
        await api.deletePatientMedicationV1({
          patientID: '7',
          medicationID: '9007199254740993',
        })
      ).ok,
    ).toBe(false);
    expect(mockClient.put).not.toHaveBeenCalled();
    expect(mockClient.delete).not.toHaveBeenCalled();
  },
);
test('delete uses canonical soft-delete endpoint and fresh same-patient read', async () => {
  expect(
    (
      await api.deletePatientMedicationV1({
        patientID: '7',
        medicationID: '9007199254740993',
      })
    ).ok,
  ).toBe(true);
  expect(mockClient.delete).toHaveBeenCalledWith(
    '/Medication/delete/9007199254740993',
    { require_auth: true },
    expect.any(Object),
  );
});
test('no actor or no catalogue ID never issues create', async () => {
  await api.addPatientMedicationV1('7', form(), '');
  await api.addPatientMedicationV1(
    '7',
    { ...form(), prescriptionListID: null },
    'ActorCase',
  );
  expect(mockClient.post).not.toHaveBeenCalled();
});
