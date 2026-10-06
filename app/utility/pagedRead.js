import requestDeadline from 'app/utility/requestDeadline';
import { responseRows } from 'app/utility/medicationHistory';
import { opaqueId } from 'app/utility/patientFieldPolicy';

// Reject incomplete or repeating pages rather than present a truncated list.
export const readAllPages = async (
  readPage,
  { pageSize = 100, idOf = (r) => r.Id ?? r.id, maxPages = 100 } = {},
) => {
  const rows = [],
    seen = new Set();
  for (let pageNo = 0; pageNo < maxPages; pageNo += 1) {
    const res = await requestDeadline(
      Promise.resolve().then(() => readPage({ pageNo, pageSize })),
    );
    if (!res?.ok) {
      const error = new Error(
        'The complete list could not be loaded. Please retry.',
      );
      error.status = res?.status;
      throw error;
    }
    const page = responseRows(res);
    for (const row of page) {
      const id = String(opaqueId(idOf(row)));
      if (seen.has(id)) {
        throw new Error('The server returned repeating pages. Please retry.');
      }
      seen.add(id);
      rows.push(row);
    }
    const pages = res.data?.totalPages;
    if (pages != null) {
      if (
        !Number.isInteger(pages) ||
        pages < 0 ||
        (pages === 0 && page.length)
      ) {
        throw new Error('The server returned invalid paging details.');
      }
      if (!page.length && pageNo + 1 < pages) {
        throw new Error('The list ended before the reported total.');
      }
      if (pageNo + 1 >= pages) {
        const count = res.data?.totalRecords;
        if (Number.isInteger(count) && rows.length !== count) {
          throw new Error('The list changed or is incomplete. Please retry.');
        }
        return rows;
      }
    } else if (page.length < pageSize) {
      return rows;
    }
  }
  throw new Error('The complete list exceeds the supported page limit.');
};
