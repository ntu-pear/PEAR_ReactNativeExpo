/** @jest-environment node */
const mockClient = { get: jest.fn() };
jest.mock('app/api/client', () => ({
  __esModule: true,
  default: mockClient,
  PATIENT_V1_BASE: 'http://synthetic-patient.invalid/api/v1',
  ACTIVITY_V1_BASE: 'http://synthetic-activity.invalid/api/v1',
}));
const activity = require('app/api/activity').default;
const patient = require('app/api/patient').default;
beforeEach(() => jest.clearAllMocks());
const aggregate = () => ({
  patients: [{ id: '7' }],
  activities: [{ id: 2, title: 'Synthetic activity', is_deleted: false }],
  centre_activities: [{ id: 3, activity_id: 2, is_deleted: false }],
  preferences: [
    {
      id: 4,
      patient_id: 7,
      centre_activity_id: 3,
      is_like: 1,
      is_deleted: '0',
    },
    { id: 5, patient_id: 99, centre_activity_id: 3, is_like: -1 },
    {
      id: 6,
      patient_id: 7,
      centre_activity_id: 3,
      is_like: -1,
      is_deleted: true,
    },
  ],
  recommendations: [
    { id: 8, patient_id: 7, centre_activity_id: 3, doctor_recommendation: 1 },
  ],
  exclusions: [
    { id: 9, patient_id: 7, centre_activity_id: 3, start_date: '2026-10-05' },
  ],
});
test('one scoped aggregate joins titles, preserves preference IDs and excludes other patients/deleted rows', async () => {
  mockClient.get.mockResolvedValue({
    ok: true,
    status: 200,
    duration: 42,
    data: aggregate(),
  });
  const res = await activity.getPatientActivityAggregate(7);
  expect(mockClient.get).toHaveBeenCalledTimes(1);
  expect(mockClient.get).toHaveBeenCalledWith(
    '/aggregated/activity-preference-table/patient/7',
    { include_deleted: false },
    expect.objectContaining({
      baseURL: 'http://synthetic-activity.invalid/api/v1',
    }),
  );
  expect(res.duration).toBe(42);
  expect(res.data.preferences).toEqual([
    expect.objectContaining({
      activityTitle: 'Synthetic activity',
      isLike: 1,
      centreActivityPreferenceID: 4,
    }),
  ]);
  expect(res.data.recommendations[0].doctorRecommendationLabel).toBe(
    'Recommended',
  );
  expect(res.data.exclusions[0].id).toBe(9);
});
test.each(['missing-array', 'wrong-patient'])(
  'invalid aggregate %s is not presented as an empty success',
  async (kind) => {
    const data = aggregate();
    if (kind === 'missing-array') delete data.recommendations;
    else data.patients = [{ id: 99 }];
    mockClient.get.mockResolvedValue({ ok: true, status: 200, data });
    expect((await activity.getPatientActivityAggregate(7)).ok).toBe(false);
    expect(mockClient.get).toHaveBeenCalledTimes(1);
  },
);
test.each([401, 403, 404, 500, undefined])(
  'aggregate failure %s never fans out or widens patient scope',
  async (status) => {
    const res = { ok: false, status, problem: 'SYNTHETIC_FAILURE' };
    mockClient.get.mockResolvedValue(res);
    expect(await activity.getPatientActivityAggregate(7)).toBe(res);
    expect(mockClient.get).toHaveBeenCalledTimes(1);
  },
);
test.each([401, 404, 500, undefined])(
  'medication record failure %s preserves status and does not guess alternate URLs',
  async (status) => {
    const res = { ok: false, status, problem: 'SYNTHETIC_FAILURE' };
    mockClient.get.mockResolvedValue(res);
    expect(await patient.listPatientMedicationsV1(7, { patient_id: 99 })).toBe(
      res,
    );
    expect(mockClient.get).toHaveBeenCalledTimes(1);
    expect(mockClient.get.mock.calls[0][1].patient_id).toBe(7);
  },
);
test('canonical medication records retain record identity, fields and pagination metadata', async () => {
  mockClient.get.mockResolvedValue({
    ok: true,
    status: 200,
    data: {
      totalRecords: 1,
      data: [
        {
          Id: 4,
          PatientId: 7,
          PrescriptionListId: 2,
          Dosage: 'Synthetic dose',
          AdministerTime: '0900',
          StartDate: '2026-10-05',
          EndDate: null,
          Instruction: 'Synthetic',
          PrescriptionRemarks: 'Synthetic remarks',
        },
      ],
    },
  });
  const res = await patient.listPatientMedicationsV1(7);
  expect(res.data.totalRecords).toBe(1);
  expect(res.data.data[0]).toMatchObject({
    medicationID: 4,
    patientID: 7,
    prescriptionName: 'Prescription 2',
    dosage: 'Synthetic dose',
    instruction: 'Synthetic',
    prescriptionRemarks: 'Synthetic remarks',
  });
});

test.each([
  ['SUPERVISOR', 'supervisor'],
  ['DOCTOR', 'doctor'],
  ['CAREGIVER', 'caregiver'],
  ['GUARDIAN', 'guardian'],
])('My Patients uses one existing %s scoped endpoint', async (role, path) => {
  const response = { ok: true, data: { data: [] } };
  mockClient.get.mockResolvedValue(response);
  expect(
    await patient.listMyPatientsV1('synthetic-user', role, {
      pageNo: 0,
      pageSize: 10,
    }),
  ).toBe(response);
  expect(mockClient.get).toHaveBeenCalledTimes(1);
  expect(mockClient.get).toHaveBeenCalledWith(
    `/patients/by-${path}/synthetic-user`,
    expect.objectContaining({ require_auth: true, mask: true }),
    expect.any(Object),
  );
});
test('unknown role or missing user fails closed without a global patient request', async () => {
  expect((await patient.listMyPatientsV1('synthetic-user', 'UNKNOWN')).ok).toBe(
    false,
  );
  expect((await patient.listMyPatientsV1(null, 'CAREGIVER')).ok).toBe(false);
  expect(mockClient.get).not.toHaveBeenCalled();
});
test('failed scoped patient list never falls back to all patients', async () => {
  const response = { ok: false, status: 403 };
  mockClient.get.mockResolvedValue(response);
  expect(await patient.listMyPatientsV1('synthetic-user', 'CAREGIVER')).toBe(
    response,
  );
  expect(mockClient.get).toHaveBeenCalledTimes(1);
});
