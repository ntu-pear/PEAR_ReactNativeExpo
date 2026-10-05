/** @jest-environment node */
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));
import {
  buildMedicationCourse,
  createCourseWriter,
} from 'app/utility/medicationCourse';
import { loadPrescriptionCatalogue } from 'app/utility/prescriptionCatalogue';
const form = () => ({
  prescriptionListID: '9007199254740993',
  administerTime: '0900,13:30,0900',
  dosage: '1 tablet',
  instruction: 'With food',
  startDateTime: '2026-10-05T00:00:00+08:00',
  endDateTime: null,
  prescriptionRemarks: 'Synthetic fixture',
});
const args = () => ({
  patientId: '9007199254740995',
  actorId: 'CaseSensitiveActor',
  form: form(),
  now: new Date('2026-10-05T00:00:00Z'),
});
const storage = () => {
  const map = new Map();
  return {
    getItem: jest.fn(async (k) => map.get(k)),
    setItem: jest.fn(async (k, v) => map.set(k, v)),
    removeItem: jest.fn(async (k) => map.delete(k)),
  };
};
test('canonical create preserves opaque IDs and actor case, null end date and unique HHmm times', () => {
  const payload = buildMedicationCourse({ ...args(), create: true });
  expect(payload).toEqual({
    IsDeleted: '0',
    PatientId: '9007199254740995',
    PrescriptionListId: '9007199254740993',
    AdministerTime: '0900,1330',
    Dosage: '1 tablet',
    Instruction: 'With food',
    StartDate: '2026-10-04T16:00:00.000Z',
    EndDate: null,
    PrescriptionRemarks: 'Synthetic fixture',
    UpdatedDateTime: '2026-10-05T00:00:00.000Z',
    ModifiedById: 'CaseSensitiveActor',
    CreatedDateTime: '2026-10-05T00:00:00.000Z',
    CreatedById: 'CaseSensitiveActor',
  });
});
test('update omits create audit fields', () => {
  const p = buildMedicationCourse(args());
  expect(p.CreatedById).toBeUndefined();
  expect(p.CreatedDateTime).toBeUndefined();
});
test.each(['2400', '1260', 'bad', ''])(
  'rejects invalid administration time %s',
  (time) =>
    expect(() =>
      buildMedicationCourse({
        ...args(),
        form: { ...form(), administerTime: time },
      }),
    ).toThrow(),
);
test.each([
  'prescriptionListID',
  'dosage',
  'instruction',
  'prescriptionRemarks',
])('rejects missing required %s', (key) =>
  expect(() =>
    buildMedicationCourse({ ...args(), form: { ...form(), [key]: '' } }),
  ).toThrow(),
);
test('rejects rounded numeric identifiers, missing actor and reversed dates', () => {
  expect(() =>
    buildMedicationCourse({
      ...args(),
      patientId: Number.MAX_SAFE_INTEGER + 1,
    }),
  ).toThrow();
  expect(() => buildMedicationCourse({ ...args(), actorId: '' })).toThrow();
  expect(() =>
    buildMedicationCourse({
      ...args(),
      form: { ...form(), endDateTime: '2026-10-03' },
    }),
  ).toThrow();
});
test('pending concurrent write cannot send twice', async () => {
  const store = storage();
  const writer = createCourseWriter({ storage: store });
  let resolve;
  const send = jest.fn(
    () =>
      new Promise((r) => {
        resolve = r;
      }),
  );
  const prepare = jest.fn(async () => send);
  const first = writer(7, prepare);
  await new Promise((r) => setTimeout(r, 0));
  expect((await writer(7, prepare)).problem).toBe('UNCERTAIN_WRITE');
  expect(send).toHaveBeenCalledTimes(1);
  resolve({ ok: true, status: 200 });
  expect((await first).ok).toBe(true);
  expect(store.removeItem).toHaveBeenCalledTimes(1);
});
test('timeout survives a new writer instance and late success without replay', async () => {
  const store = storage();
  let resolve;
  const send = jest.fn(
    () =>
      new Promise((r) => {
        resolve = r;
      }),
  );
  const writer = createCourseWriter({ storage: store, timeoutMs: 15 });
  expect((await writer(7, async () => send)).problem).toBe('UNCERTAIN_WRITE');
  resolve({ ok: true, status: 200 });
  await Promise.resolve();
  const next = createCourseWriter({ storage: store, timeoutMs: 15 });
  expect((await next(7, async () => send)).problem).toBe('UNCERTAIN_WRITE');
  expect(send).toHaveBeenCalledTimes(1);
});
test.each([400, 401, 403, 404, 409, 422])(
  'definitive rejection %s releases pending marker',
  async (status) => {
    const store = storage();
    const writer = createCourseWriter({ storage: store });
    expect(
      (await writer(7, async () => async () => ({ ok: false, status }))).status,
    ).toBe(status);
    expect(store.removeItem).toHaveBeenCalledTimes(1);
  },
);
test('failed storage preparation sends nothing', async () => {
  const store = storage();
  store.setItem.mockRejectedValue(new Error('unavailable'));
  const send = jest.fn();
  expect(
    (await createCourseWriter({ storage: store })(7, async () => send)).status,
  ).toBe(400);
  expect(send).not.toHaveBeenCalled();
});
test('catalogue reads every reported page and excludes deleted choices', async () => {
  const read = jest
    .fn()
    .mockResolvedValueOnce({
      ok: true,
      data: {
        data: [{ Id: '9007199254740993', Value: 'Synthetic A' }],
        totalPages: 2,
      },
    })
    .mockResolvedValueOnce({
      ok: true,
      data: {
        data: [
          { Id: 2, Value: 'Deleted', IsDeleted: true },
          { Id: 3, Value: 'Synthetic B' },
        ],
        totalPages: 2,
      },
    });
  expect(await loadPrescriptionCatalogue(read)).toEqual([
    { value: '9007199254740993', label: 'Synthetic A' },
    { value: 3, label: 'Synthetic B' },
  ]);
  expect(read.mock.calls.map((c) => c[0].pageNo)).toEqual([0, 1]);
});
test.each([
  { ok: false, status: 403 },
  { ok: true, data: { data: [{ Id: 7, Value: 'A' }], totalPages: 2 } },
  {
    ok: true,
    data: {
      data: [
        { Id: 7, Value: 'A' },
        { Id: 7, Value: 'B' },
      ],
      totalPages: 1,
    },
  },
])('catalogue rejects failed or incomplete paging', async (res) => {
  const read = jest
    .fn()
    .mockResolvedValueOnce(res)
    .mockResolvedValue({ ok: true, data: { data: [], totalPages: 2 } });
  await expect(loadPrescriptionCatalogue(read)).rejects.toThrow();
});
