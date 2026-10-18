import { patientPhotoAlbums } from 'app/utility/patientPhotoAlbums';
const catalogue = [
  { albumCategoryListID: 1, albumCategoryName: 'Default Album' },
  { albumCategoryListID: 3, albumCategoryName: 'Family Photos' },
  { albumCategoryListID: 14, albumCategoryName: 'Custom empty' },
];
test('catalogue labels/IDs and custom empty albums are preserved, with latest photo and exact counts', () => {
  const rows = patientPhotoAlbums(
    [
      {
        albumCategoryListID: 1,
        albumCategoryName: 'Old Family seed',
        patientPhotoID: 2,
        photoPath: 'older',
      },
      { albumCategoryListID: '1', patientPhotoID: 12, photoPath: 'latest' },
      { albumCategoryListID: 3, patientPhotoID: 4, photoPath: 'family' },
    ],
    catalogue,
    7,
  );
  expect(rows).toEqual([
    expect.objectContaining({
      albumCategoryListID: '1',
      albumCategoryName: 'Default Album',
      photoCount: 2,
      photoPath: 'latest',
      patientID: 7,
    }),
    expect.objectContaining({
      albumCategoryListID: '3',
      albumCategoryName: 'Family Photos',
      photoCount: 1,
      photoPath: 'family',
    }),
    expect.objectContaining({
      albumCategoryListID: '14',
      albumCategoryName: 'Custom empty',
      photoCount: 0,
      photoPath: null,
    }),
  ]);
});
test('unavailable catalogue cannot invent Family, hide photos or merge distinct IDs sharing a label', () => {
  const rows = patientPhotoAlbums(
    [
      {
        albumCategoryListID: 90,
        patientPhotoID: 1,
        albumCategoryName: 'Same name',
      },
      {
        albumCategoryListID: 91,
        patientPhotoID: 2,
        albumCategoryName: 'Same name',
      },
      { albumCategoryListID: 92, patientPhotoID: 3 },
    ],
    [],
    7,
  );
  expect(
    rows.map((row) => [
      row.albumCategoryListID,
      row.albumCategoryName,
      row.photoCount,
    ]),
  ).toEqual([
    ['90', 'Same name', 1],
    ['91', 'Same name', 1],
    ['92', 'Album 92', 1],
  ]);
});
test('empty photo/catalogue result remains empty without seeds', () => {
  expect(patientPhotoAlbums([], [], 7)).toEqual([]);
});
