import { readAllPages } from 'app/utility/pagedRead';
import { responseRows } from 'app/utility/medicationHistory';
import requestDeadline from 'app/utility/requestDeadline';

export const loadMedicationPage = async ({
  readCourses,
  readCatalogue,
  patientId,
  params,
  allCourses = false,
}) => {
  const [courses, catalogue] = await Promise.all([
    allCourses
      ? readAllPages((page) => readCourses(patientId, page), {
          idOf: (r) => r.medicationID,
        })
      : requestDeadline(readCourses(patientId, params)),
    readAllPages(readCatalogue),
  ]);
  if (!allCourses && !courses?.ok) {
    return courses;
  }
  const rows = allCourses ? courses : responseRows(courses);
  if (rows.some((r) => String(r.patientID) !== String(patientId))) {
    throw new Error('Medication records do not match the selected patient.');
  }
  const names = new Map(
    catalogue.map((r) => [String(r.Id ?? r.id), r.Value ?? r.value]),
  );
  const joined = rows.map((row) => {
    const name =
      names.get(String(row.prescriptionListID)) || row.prescriptionName;
    return {
      ...row,
      prescriptionName: name || '',
      drugName: name || 'Drug name unavailable',
      prescriptionNameResolved: Boolean(name),
    };
  });
  return {
    ...(allCourses ? { ok: true, status: 200 } : courses),
    data: { ...(allCourses ? {} : courses.data), data: joined },
  };
};
