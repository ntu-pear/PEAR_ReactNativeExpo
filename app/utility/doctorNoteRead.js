import requestDeadline from 'app/utility/requestDeadline';
import { patientFromApiResponse } from 'app/utility/patientHeader';
export const readDoctorNotePage = async ({
  patientId,
  readNotes,
  readPatient,
}) => {
  if (!patientId) {
    return {
      notes: [],
      patient: {},
      noteError: true,
      headerError: true,
      status: 400,
    };
  }
  const result = await Promise.allSettled([
    requestDeadline(Promise.resolve().then(() => readNotes(patientId))),
    requestDeadline(Promise.resolve().then(() => readPatient(patientId))),
  ]);
  const [notes, header] = result.map((r) =>
    r.status === 'fulfilled' ? r.value : null,
  );
  const rows = notes?.data?.data;
  const patient = header?.ok ? patientFromApiResponse(header) : {};
  const noteError = !notes?.ok || !Array.isArray(rows);
  const headerError =
    !header?.ok ||
    String(patient.patientID ?? patient.id) !== String(patientId);
  return {
    notes: noteError ? [] : rows,
    patient: headerError ? {} : patient,
    noteError,
    headerError,
    status: noteError
      ? notes?.status
      : headerError
      ? header?.status
      : notes.status,
  };
};
