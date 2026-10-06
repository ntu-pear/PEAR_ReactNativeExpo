/** @jest-environment node */
import { buildMedicationScheduleUpdate } from 'app/utility/medicationAdminister';
jest.mock('app/api/patient', () => ({
  normalizePatientV1: (r) => ({ ...r, patientID: r.id }),
}));
import { readDoctorNotePage } from 'app/utility/doctorNoteRead';
test('dose JSON preserves long numeric strings exactly', () => {
  const payload = buildMedicationScheduleUpdate({
    row: { PatientID: '9007199254740993' },
    userId: 'actor',
  });
  expect(JSON.parse(JSON.stringify(payload)).PatientID).toBe(
    '9007199254740993',
  );
});
test.each([9007199254740992, 'UUID-CASE', '', 0])(
  'unsafe/non-numeric dose ID %p is rejected rather than rounded',
  (id) => {
    expect(() =>
      buildMedicationScheduleUpdate({
        row: { PatientID: id },
        userId: 'actor',
      }),
    ).toThrow();
  },
);
const patient = async () => ({ ok: true, data: { data: { id: '7' } } });
test('notes500 plus header200 retains content failure and status', async () => {
  expect(
    await readDoctorNotePage({
      patientId: '7',
      readNotes: async () => ({ ok: false, status: 500 }),
      readPatient: patient,
    }),
  ).toMatchObject({
    noteError: true,
    headerError: false,
    status: 500,
    notes: [],
  });
});
test('header failure cannot erase successful notes or appear as complete success', async () => {
  expect(
    await readDoctorNotePage({
      patientId: '7',
      readNotes: async () => ({
        ok: true,
        status: 200,
        data: { data: [{ id: 1 }] },
      }),
      readPatient: async () => ({ ok: false, status: 403 }),
    }),
  ).toMatchObject({
    noteError: false,
    headerError: true,
    status: 403,
    notes: [{ id: 1 }],
  });
});
test('wrong header and thrown notes never become successful empty state', async () => {
  expect(
    await readDoctorNotePage({
      patientId: '7',
      readNotes: async () => {
        throw new Error('Synthetic');
      },
      readPatient: async () => ({ ok: true, data: { data: { id: '8' } } }),
    }),
  ).toMatchObject({
    noteError: true,
    headerError: true,
    notes: [],
    patient: {},
  });
});
test('missing route performs no requests', async () => {
  const read = jest.fn();
  expect(
    await readDoctorNotePage({
      patientId: null,
      readNotes: read,
      readPatient: read,
    }),
  ).toMatchObject({ status: 400 });
  expect(read).not.toHaveBeenCalled();
});
