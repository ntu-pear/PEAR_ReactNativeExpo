import requestDeadline from 'app/utility/requestDeadline';
import { responseRows } from 'app/utility/medicationHistory';
import { medicationCourseId } from 'app/utility/medicationCourse';
export const loadPrescriptionCatalogue = async (readPage) => {
  const rows = [];
  const seen = new Set();
  for (let pageNo = 0; pageNo < 100; pageNo += 1) {
    const res = await requestDeadline(readPage({ pageNo, pageSize: 100 }));
    if (!res?.ok) {
      throw new Error(
        'Prescription choices could not be loaded. Please retry.',
      );
    }
    const page = responseRows(res);
    for (const row of page) {
      const id = medicationCourseId(row.Id);
      if (seen.has(String(id))) {
        throw new Error(
          'Prescription paging returned duplicate records. Please retry.',
        );
      }
      seen.add(String(id));
      if (![true, 1, '1', 'true'].includes(row.IsDeleted)) {
        if (!row.Value || typeof row.Value !== 'string') {
          throw new Error('Prescription choices are incomplete.');
        }
        rows.push({ value: id, label: row.Value });
      }
    }
    const totalPages = res.data?.totalPages;
    if (Number.isInteger(totalPages) && totalPages >= 0) {
      if (!page.length && (pageNo > 0 || totalPages > 1)) {
        throw new Error('Prescription paging ended before the reported total.');
      }
      if (pageNo + 1 >= totalPages) {
        return rows;
      }
      if (!page.length) {
        throw new Error('Prescription paging ended before the reported total.');
      }
    } else if (page.length < 100) {
      return rows;
    }
  }
  throw new Error('Prescription choices exceed the supported page limit.');
};
