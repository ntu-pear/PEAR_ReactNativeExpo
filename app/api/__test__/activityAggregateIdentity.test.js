/** @jest-environment node */
const mockClient = { get: jest.fn() };
jest.mock('app/api/client', () => ({
  __esModule: true,
  default: mockClient,
  ACTIVITY_V1_BASE: 'http://synthetic.invalid/api/v1',
}));
const api = require('app/api/activity').default;
const payload = () => ({
  patients: [{ id: '7' }],
  activities: [],
  centre_activities: [],
  preferences: [],
  recommendations: [],
  exclusions: [],
});
beforeEach(() => jest.clearAllMocks());
test('explicit exact patient identity and unnamed restrictions survive adapter normalization', async () => {
  const data = payload();
  data.exclusions = [
    {
      id: 1,
      patient_id: 7,
      centre_activity_id: 22,
      is_deleted: false,
      start_date: '2026-10-07',
    },
  ];
  mockClient.get.mockResolvedValue({ ok: true, data });
  const result = await api.getPatientActivityAggregate('7');
  expect(result.ok).toBe(true);
  expect(result.data.patientID).toBe('7');
  expect(result.data.patients).toBeUndefined();
  expect(result.data.exclusions).toEqual([]);
  expect(result.data.eligibility.exclusions).toHaveLength(1);
});
test.each([
  'missing',
  'unsafe',
  'duplicate',
  'conflicting-row',
  'missing-row-id',
  'unsafe-centre-id',
])('invalid aggregate identity %s fails whole read', async (kind) => {
  const data = payload();
  if (kind === 'missing') {
    data.patients = [{}];
  }
  if (kind === 'unsafe') {
    data.patients = [{ id: 9007199254740993 }];
  }
  if (kind === 'duplicate') {
    data.patients.push({ id: 7 });
  }
  if (kind.includes('row') || kind === 'unsafe-centre-id') {
    data.preferences = [
      { id: 1, patient_id: 7, centre_activity_id: 22, is_like: -1 },
    ];
  }
  if (kind === 'conflicting-row') {
    data.preferences[0].PatientID = 8;
  }
  if (kind === 'missing-row-id') {
    delete data.preferences[0].patient_id;
  }
  if (kind === 'unsafe-centre-id') {
    data.preferences[0].centre_activity_id = 9007199254740993;
  }
  mockClient.get.mockResolvedValue({ ok: true, data });
  expect((await api.getPatientActivityAggregate('7')).ok).toBe(false);
});
test('unsafe requested numeric identity fails before transport', async () => {
  expect((await api.getPatientActivityAggregate(9007199254740993)).ok).toBe(
    false,
  );
  expect(mockClient.get).not.toHaveBeenCalled();
});
test('large exact string patient identity survives without rounding', async () => {
  const data = payload();
  data.patients = [{ id: '9007199254740993' }];
  mockClient.get.mockResolvedValue({ ok: true, data });
  expect(
    (await api.getPatientActivityAggregate('9007199254740993')).data.patientID,
  ).toBe('9007199254740993');
});
