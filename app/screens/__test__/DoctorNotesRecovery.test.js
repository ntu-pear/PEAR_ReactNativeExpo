import React from 'react';
import { act, create } from 'react-test-renderer';
import DoctorNoteScreen from 'app/screens/DoctorNoteScreen';
import doctor from 'app/api/doctorNote';
import patient from 'app/api/patient';
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
  useFocusEffect: (cb) => require('react').useEffect(cb, [cb]),
}));
jest.mock('native-base', () => ({ View: 'MockView', FlatList: 'MockList' }));
jest.mock('app/api/doctorNote', () => ({ getDoctorNote: jest.fn() }));
jest.mock('app/api/patient', () => ({
  __esModule: true,
  default: { getPatient: jest.fn() },
  normalizePatientV1: (r) => ({
    ...r,
    patientID: r.id,
    preferredName: r.preferredName,
  }),
}));
jest.mock('app/components/ProfileNameButton', () => 'MockProfile');
jest.mock('app/components/ActivityIndicator', () => 'MockLoading');
jest.mock(
  'app/components/filter-components/SearchFilterBar',
  () => 'MockFilters',
);
jest.mock('app/components/LoadingWheel', () => 'MockWheel');
jest.mock('app/components/DynamicTable', () => 'MockTable');
jest.mock('app/components/DoctorNoteItem', () => 'MockNote');
jest.mock('app/components/swipeable-components/Swipeable', () => 'MockSwipe');
let tree;
beforeEach(() => {
  jest.clearAllMocks();
  patient.getPatient.mockResolvedValue({
    ok: true,
    data: { data: { id: '7', preferredName: 'SYNTHETIC' } },
  });
  doctor.getDoctorNote.mockResolvedValue({
    ok: true,
    status: 200,
    data: { data: [] },
  });
});
afterEach(() => {
  if (tree) {
    act(() => tree.unmount());
  }
  tree = null;
});
test('actual Doctor Notes screen keeps failed content visible after successful header, then retry clears it', async () => {
  doctor.getDoctorNote.mockResolvedValueOnce({ ok: false, status: 500 });
  await act(async () => {
    tree = create(<DoctorNoteScreen route={{ params: { patientID: '7' } }} />);
  });
  expect(
    tree.root.findAllByProps({ testID: 'doctor_notes_read_error' }).length,
  ).toBeGreaterThan(0);
  expect(tree.root.findByType('MockProfile').props.profileLineOne).toBe(
    'SYNTHETIC',
  );
  const control = tree.root
    .findAllByProps({ testID: 'doctor_notes_retry' })
    .find((n) => typeof n.props.onPress === 'function');
  await act(async () => control.props.onPress());
  expect(doctor.getDoctorNote).toHaveBeenCalledTimes(2);
  expect(
    tree.root.findAllByProps({ testID: 'doctor_notes_read_error' }),
  ).toHaveLength(0);
});
