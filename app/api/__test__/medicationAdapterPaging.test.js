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
const { loadMedicationPage } = require('app/utility/medicationPage');
const course = (overrides = {}) => ({
  Id: 1,
  PatientId: '7',
  PrescriptionListId: 3,
  IsDeleted: '0',
  ...overrides,
});
const load = (patientId = '7', allCourses = true) =>
  loadMedicationPage({
    readCourses: api.listPatientMedicationsV1,
    readCatalogue: api.getPrescriptionListV1,
    patientId,
    allCourses,
    params: { pageNo: 0, pageSize: 100 },
  });
const respond = (body) => {
  mockClient.get.mockImplementation(async (path) => ({
    ok: true,
    status: 200,
    data:
      path === '/Medication/PatientMedication'
        ? body
        : { data: [{ Id: 3, Value: 'SYNTHETIC DRUG' }] },
  }));
};
beforeEach(() => jest.clearAllMocks());
test.each([
  null,
  {},
  { message: 'unexpected' },
  { data: {} },
  { data: null },
  { results: 'bad' },
])(
  'real adapter rejects malformed successful list %p before all-course display',
  async (body) => {
    respond(body);
    expect(await api.listPatientMedicationsV1('7')).toMatchObject({
      ok: false,
      problem: 'INVALID_RESPONSE',
    });
    await expect(load()).rejects.toThrow(/complete list/);
    const onePage = await load('7', false);
    expect(onePage.ok).toBe(false);
  },
);
test.each([[], { data: [] }, { results: [] }])(
  'valid explicit empty %p alone can display empty',
  async (body) => {
    respond(body);
    const result = await load();
    expect(result.ok).toBe(true);
    expect(result.data.data).toEqual([]);
  },
);
test.each([undefined, null, '', 0, 8, '8', 9007199254740992])(
  'explicit missing/wrong/unsafe returned patient ID %p is rejected through the real adapter',
  async (id) => {
    respond({ data: [course({ PatientId: id })] });
    expect(await api.listPatientMedicationsV1('7')).toMatchObject({
      ok: false,
      problem: 'INVALID_RESPONSE',
    });
    await expect(load()).rejects.toThrow();
  },
);
test('rounded numeric returned patient ID cannot match the adjacent exact string request', async () => {
  respond({ data: [course({ PatientId: 9007199254740993 })] });
  await expect(load('9007199254740992')).rejects.toThrow();
});
test('lossless long returned string and selected patient string remain exact', async () => {
  respond({
    data: [course({ Id: '9007199254740995', PatientId: '9007199254740993' })],
  });
  const result = await load('9007199254740993');
  expect(result.data.data[0]).toMatchObject({
    medicationID: '9007199254740995',
    patientID: '9007199254740993',
    prescriptionName: 'SYNTHETIC DRUG',
  });
});
test.each(['patientID', 'PatientId', 'patient_id'])(
  'documented returned identity alias %s is preserved',
  async (key) => {
    const item = course();
    delete item.PatientId;
    item[key] = '7';
    respond({ data: [item] });
    expect((await load()).data.data[0].patientID).toBe('7');
  },
);
test('unsafe numeric requested patient ID fails before a transport request', async () => {
  expect(await api.listPatientMedicationsV1(9007199254740992)).toMatchObject({
    ok: false,
    problem: 'INVALID_REQUEST',
  });
  expect(mockClient.get).not.toHaveBeenCalled();
});
test('conflicting explicit patient aliases do not silently choose a matching one', async () => {
  respond({ data: [course({ patientID: '7', PatientId: '8' })] });
  await expect(load()).rejects.toThrow();
});
test.each([null, undefined, {}, { Id: 9007199254740992, PatientId: '7' }])(
  'invalid course identity/row %p fails the whole page',
  async (row) => {
    respond({ data: [row] });
    await expect(load()).rejects.toThrow();
  },
);
test('a malformed late page cannot certify the valid first page', async () => {
  mockClient.get.mockImplementation(async (path, params) => ({
    ok: true,
    status: 200,
    data:
      path === '/PrescriptionList'
        ? { data: [{ Id: 3, Value: 'SYNTHETIC DRUG' }] }
        : params.pageNo === 0
        ? {
            data: Array.from({ length: 100 }, (_, i) => course({ Id: i + 1 })),
            totalPages: 2,
            totalRecords: 101,
          }
        : { error: 'bad page' },
  }));
  await expect(load()).rejects.toThrow(/complete list/);
});
