/** @jest-environment node */
const mockClient = { get: jest.fn() };
jest.mock('app/api/client', () => ({
  __esModule: true,
  default: mockClient,
  PATIENT_V1_BASE: 'http://synthetic.invalid/api/v1',
}));
const patient = require('app/api/patient').default;
beforeEach(() => jest.clearAllMocks());
test('existing photo/catalogue reads expose current IDs and labels without another request', async () => {
  mockClient.get.mockImplementation(async (path) =>
    path.includes('PhotoListAlbum')
      ? {
          ok: true,
          status: 200,
          data: [
            { AlbumCategoryListID: 1, Value: 'Default Album' },
            { AlbumCategoryListID: 3, Value: 'Family Photos' },
          ],
        }
      : {
          ok: true,
          status: 200,
          data: [
            {
              PatientID: 7,
              PatientPhotoID: 6,
              AlbumCategoryListID: 1,
              PhotoDetails: 'Synthetic dog',
            },
          ],
        },
  );
  const res = await patient.getPatientPhoto(7);
  expect(mockClient.get).toHaveBeenCalledTimes(2);
  expect(res.data.albumCatalogueAvailable).toBe(true);
  expect(res.data.albums).toEqual([
    expect.objectContaining({
      albumCategoryListID: 1,
      albumCategoryName: 'Default Album',
    }),
    expect.objectContaining({
      albumCategoryListID: 3,
      albumCategoryName: 'Family Photos',
    }),
  ]);
  expect(res.data.data[0].albumCategoryName).toBe('Default Album');
});
test('catalogue failure is explicit while successful photo data remains available', async () => {
  mockClient.get.mockImplementation(async (path) =>
    path.includes('PhotoListAlbum')
      ? { ok: false, status: 503, data: { detail: 'Unavailable' } }
      : {
          ok: true,
          status: 200,
          data: [{ PatientID: 7, PatientPhotoID: 6, AlbumCategoryListID: 1 }],
        },
  );
  const res = await patient.getPatientPhoto(7);
  expect(res.ok).toBe(true);
  expect(res.data.albumCatalogueAvailable).toBe(false);
  expect(res.data.albums).toEqual([]);
  expect(res.data.data).toHaveLength(1);
});
