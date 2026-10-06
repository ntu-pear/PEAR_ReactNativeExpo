/** @jest-environment node */
import { readAllPages } from 'app/utility/pagedRead';
import { loadDashboardPatients } from 'app/utility/dashboardPatients';
import { loadMedicationPage } from 'app/utility/medicationPage';
const ok = (rows, extra = {}) => ({ ok: true, data: { data: rows, ...extra } });
const rows = (n, start = 1) =>
  Array.from({ length: n }, (_, i) => ({ id: start + i }));
test('Dashboard My requests only the signed-in role route and loads patient 81', async () => {
  const api = {
    listMyPatientsV1: jest
      .fn()
      .mockResolvedValueOnce(ok(rows(80), { totalPages: 2, totalRecords: 81 }))
      .mockResolvedValueOnce(
        ok(rows(1, 81), { totalPages: 2, totalRecords: 81 }),
      ),
    listPatientsV1: jest.fn(),
    normalizePatientV1: (r) => ({ ...r, patientID: r.id }),
  };
  const result = await loadDashboardPatients({
    api,
    mode: 'myPatients',
    user: { id: 'CaregiverCase', roleName: 'CAREGIVER' },
  });
  expect(result).toHaveLength(81);
  expect(result[80].patientID).toBe(81);
  expect(api.listMyPatientsV1).toHaveBeenNthCalledWith(
    2,
    'CaregiverCase',
    'CAREGIVER',
    expect.objectContaining({ pageNo: 1, isActive: '1' }),
  );
  expect(api.listPatientsV1).not.toHaveBeenCalled();
});
test('Dashboard All uses a distinct authenticated paged route', async () => {
  const api = {
    listMyPatientsV1: jest.fn(),
    listPatientsV1: jest.fn().mockResolvedValue(ok([{ id: 2 }])),
    normalizePatientV1: (r) => r,
  };
  await loadDashboardPatients({
    api,
    mode: 'allPatients',
    user: { id: 'actor', roleName: 'SUPERVISOR' },
  });
  expect(api.listMyPatientsV1).not.toHaveBeenCalled();
  expect(api.listPatientsV1).toHaveBeenCalledWith(
    expect.objectContaining({ require_auth: true, mask: true, pageNo: 0 }),
  );
});
test('failed assigned scope never falls back to All', async () => {
  const api = {
    listMyPatientsV1: jest.fn().mockResolvedValue({ ok: false, status: 403 }),
    listPatientsV1: jest.fn(),
  };
  await expect(
    loadDashboardPatients({
      api,
      mode: 'myPatients',
      user: { id: 'actor', roleName: 'DOCTOR' },
    }),
  ).rejects.toMatchObject({ status: 403 });
  expect(api.listPatientsV1).not.toHaveBeenCalled();
});
test.each([{}, { id: 'actor', roleName: 'UNKNOWN' }])(
  'missing/unsupported actor never reads a global list: %p',
  async (user) => {
    const api = { listMyPatientsV1: jest.fn(), listPatientsV1: jest.fn() };
    await expect(
      loadDashboardPatients({ api, mode: 'myPatients', user }),
    ).rejects.toThrow();
    expect(api.listPatientsV1).not.toHaveBeenCalled();
  },
);
test('repeating pages are rejected rather than looped/truncated', async () => {
  const read = jest.fn().mockResolvedValue(ok([{ id: 1 }], { totalPages: 2 }));
  await expect(readAllPages(read)).rejects.toThrow(/repeating/);
  expect(read).toHaveBeenCalledTimes(2);
});
test('later page failure does not return a successful first page', async () => {
  const read = jest
    .fn()
    .mockResolvedValueOnce(ok(rows(100), { totalPages: 2 }))
    .mockResolvedValueOnce({ ok: false, status: 500 });
  await expect(readAllPages(read)).rejects.toThrow();
});
test('missing records relative to reported count are rejected', async () => {
  await expect(
    readAllPages(async () =>
      ok([{ id: 1 }], { totalPages: 1, totalRecords: 2 }),
    ),
  ).rejects.toThrow(/incomplete/);
});
test('canonical course label resolves from catalogue page 2 and matches the actual dose', async () => {
  const catalogue = jest
    .fn()
    .mockResolvedValueOnce(
      ok(
        Array.from({ length: 100 }, (_, i) => ({
          Id: i + 1,
          Value: 'OTHER ' + i,
        })),
        { totalPages: 2, totalRecords: 101 },
      ),
    )
    .mockResolvedValueOnce(
      ok([{ Id: 101, Value: 'SYNTHETIC DRUG' }], {
        totalPages: 2,
        totalRecords: 101,
      }),
    );
  const courses = jest.fn().mockResolvedValue(
    ok([
      {
        medicationID: 1,
        patientID: '7',
        prescriptionListID: 101,
        prescriptionName: '',
      },
    ]),
  );
  const page = await loadMedicationPage({
    readCourses: courses,
    readCatalogue: catalogue,
    patientId: '7',
  });
  expect(page.data.data[0]).toMatchObject({
    prescriptionName: 'SYNTHETIC DRUG',
    prescriptionNameResolved: true,
  });
  const {
    matchMedicationScheduleRow,
  } = require('app/utility/medicationAdminister');
  const dose = {
    PatientID: 7,
    PrescriptionName: 'SYNTHETIC DRUG',
    AdministerTime: '0900',
  };
  expect(
    matchMedicationScheduleRow([dose], {
      patientID: 7,
      prescriptionName: page.data.data[0].prescriptionName,
      administerTime: '0900',
    }),
  ).toBe(dose);
});
test('all-course patient view includes course 101 with exact selected context', async () => {
  const med = (i) => ({
    medicationID: i,
    patientID: '7',
    prescriptionListID: 1,
  });
  const courses = jest
    .fn()
    .mockResolvedValueOnce(
      ok(
        Array.from({ length: 100 }, (_, i) => med(i + 1)),
        { totalPages: 2, totalRecords: 101 },
      ),
    )
    .mockResolvedValueOnce(
      ok([med(101)], { totalPages: 2, totalRecords: 101 }),
    );
  const result = await loadMedicationPage({
    readCourses: courses,
    readCatalogue: async () => ok([{ Id: 1, Value: 'SYNTHETIC' }]),
    patientId: '7',
    allCourses: true,
  });
  expect(result.data.data).toHaveLength(101);
});
test('wrong patient course is rejected; unresolved name is never a Prescription ID label', async () => {
  const catalogue = async () => ok([]);
  await expect(
    loadMedicationPage({
      readCourses: async () => ok([{ medicationID: 1, patientID: 8 }]),
      readCatalogue: catalogue,
      patientId: 7,
    }),
  ).rejects.toThrow(/selected patient/);
  const result = await loadMedicationPage({
    readCourses: async () =>
      ok([{ medicationID: 1, patientID: 7, prescriptionListID: 2 }]),
    readCatalogue: catalogue,
    patientId: 7,
  });
  expect(result.data.data[0].prescriptionNameResolved).toBe(false);
  expect(result.data.data[0].prescriptionName).toBe('');
});
