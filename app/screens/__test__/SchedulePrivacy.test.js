import React from 'react';
import { act, create } from 'react-test-renderer';
import Screen from 'app/screens/PatientScheduleScreen';
import storage from 'app/auth/authStorage';
import patient from 'app/api/patient';
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
  useFocusEffect: (cb) => require('react').useEffect(cb, [cb]),
}));
jest.mock('native-base', () => ({
  Box: 'MockBox',
  FlatList: 'MockList',
  HStack: 'MockStack',
  ScrollView: 'MockScroll',
  View: 'MockView',
  Text: 'MockText',
  Divider: 'MockDivider',
}));
jest.mock('app/auth/authStorage', () => ({
  getToken: jest.fn(async () => 'synthetic-private-token-sentinel'),
}));
jest.mock('app/api/patient', () => ({
  __esModule: true,
  default: { getPatient: jest.fn() },
  normalizePatientV1: (r) => ({ ...r, patientID: r.id }),
}));
jest.mock('app/api/schedule', () => ({
  getPatientWeeklySchedule: jest.fn(async () => ({
    ok: true,
    data: { Data: [] },
  })),
}));
jest.mock('app/components/ProfileNameButton', () => 'MockProfile');
jest.mock('app/components/ActivityIndicator', () => 'MockLoading');
jest.mock(
  'app/components/filter-components/SearchFilterBar',
  () => 'MockFilters',
);
jest.mock('app/components/LoadingWheel', () => 'MockWheel');
jest.mock('app/components/ActivityCard', () => 'MockCard');
test('mounting the real Schedule screen never requests or prints an authentication token', async () => {
  patient.getPatient.mockResolvedValue({
    ok: true,
    status: 200,
    data: { data: { id: 7, preferredName: 'SYNTHETIC' } },
  });
  const logger = jest.spyOn(console, 'log').mockImplementation(() => {});
  let tree;
  try {
    await act(async () => {
      tree = create(<Screen route={{ params: { patientID: 7 } }} />);
    });
    expect(patient.getPatient).toHaveBeenCalledWith(7);
    expect(storage.getToken).not.toHaveBeenCalled();
    expect(logger.mock.calls.flat().join(' ')).not.toMatch(
      /synthetic-private-token-sentinel|JWT Token/,
    );
  } finally {
    if (tree) {
      act(() => tree.unmount());
    }
    logger.mockRestore();
  }
});
