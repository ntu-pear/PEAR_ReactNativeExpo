import React from 'react';
import { act, create } from 'react-test-renderer';
import Screen from 'app/screens/PatientPhotoAlbumScreen';
import patient from 'app/api/patient';
import { noDataMessage } from 'app/utility/miscFunctions';
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
  useFocusEffect: (callback) =>
    require('react').useEffect(callback, [callback]),
}));
jest.mock('native-base', () => ({
  View: require('react-native').View,
  FlatList: ({ data, renderItem, ListEmptyComponent }) =>
    data.length ? (
      data.map((item, index) =>
        require('react').createElement(
          require('react').Fragment,
          { key: index },
          renderItem({ item }),
        ),
      )
    ) : (
      <ListEmptyComponent />
    ),
}));
jest.mock('app/api/patient', () => ({
  getPatientPhoto: jest.fn(),
  getPatient: jest.fn(),
}));
jest.mock('app/utility/miscFunctions', () => ({
  isEmptyObject: (value) => !value || Object.keys(value).length === 0,
  sortFilterInitialState: {},
  noDataMessage: jest.fn(() => null),
}));
jest.mock('app/components/ActivityIndicator', () => () => null);
jest.mock('app/components/ProfileNameButton', () => () => null);
jest.mock('app/components/filter-components/SearchFilterBar', () => () => null);
jest.mock('app/components/LoadingWheel', () => () => null);
jest.mock(
  'app/components/swipeable-components/Swipeable',
  () =>
    ({ item }) =>
      item,
);
jest.mock(
  'app/components/swipeable-components/EditDeleteUnderlay',
  () => () => null,
);
jest.mock(
  'app/components/AlbumItem',
  () => (props) => require('react').createElement('MockAlbum', props),
);
let tree;
beforeEach(() => {
  jest.clearAllMocks();
  patient.getPatient.mockResolvedValue({
    ok: true,
    status: 200,
    data: { data: { id: 7, preferredName: 'Synthetic' } },
  });
});
afterEach(() => {
  if (tree) {
    act(() => tree.unmount());
  }
  tree = null;
});
test('real screen renders authoritative catalogue categories, including custom empty ones', async () => {
  patient.getPatientPhoto.mockResolvedValue({
    ok: true,
    status: 200,
    data: {
      data: [
        {
          albumCategoryListID: 1,
          patientPhotoID: 6,
          albumCategoryName: 'Default Album',
        },
      ],
      albums: [
        { albumCategoryListID: 1, albumCategoryName: 'Default Album' },
        { albumCategoryListID: 3, albumCategoryName: 'Family Photos' },
      ],
      albumCatalogueAvailable: true,
    },
  });
  await act(async () => {
    tree = create(<Screen route={{ params: { patientID: 7 } }} />);
  });
  const rows = tree.root.findAllByType('MockAlbum').map((node) => node.props);
  expect(
    rows.map((row) => [
      row.albumCategoryListID,
      row.albumCategoryName,
      row.photoCount,
    ]),
  ).toEqual([
    ['1', 'Default Album', 1],
    ['3', 'Family Photos', 0],
  ]);
  expect(patient.getPatientPhoto).toHaveBeenCalledTimes(1);
});
test('successful patient header cannot mask a failed photo read as an empty success', async () => {
  patient.getPatientPhoto.mockResolvedValue({
    ok: false,
    status: 503,
    data: {},
  });
  await act(async () => {
    tree = create(<Screen route={{ params: { patientID: 7 } }} />);
  });
  expect(noDataMessage).toHaveBeenLastCalledWith(
    503,
    false,
    true,
    'No albums found',
    true,
  );
});

test('exact no-photo404 retains current empty catalogue without masking other errors', async () => {
  patient.getPatientPhoto.mockResolvedValue({
    ok: false,
    status: 404,
    data: {
      detail: 'Photo not found or deleted',
      data: [],
      albums: [{ albumCategoryListID: 1, albumCategoryName: 'Default Album' }],
      albumCatalogueAvailable: true,
    },
  });
  await act(async () => {
    tree = create(<Screen route={{ params: { patientID: 7 } }} />);
  });
  expect(tree.root.findByType('MockAlbum').props.photoCount).toBe(0);
  expect(tree.root.findByType('MockAlbum').props.albumCategoryName).toBe(
    'Default Album',
  );
});

test('unexpected rejected read is an explicit error, not retained old album data', async () => {
  const errorLog = jest.spyOn(console, 'error').mockImplementation(() => {});
  patient.getPatientPhoto.mockRejectedValue(
    new Error('Synthetic transport failure'),
  );
  await act(async () => {
    tree = create(<Screen route={{ params: { patientID: 7 } }} />);
  });
  expect(noDataMessage).toHaveBeenLastCalledWith(
    0,
    false,
    true,
    'No albums found',
    true,
  );
  errorLog.mockRestore();
});
