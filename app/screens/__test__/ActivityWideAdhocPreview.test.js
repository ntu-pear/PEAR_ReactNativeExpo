import React from 'react';
import { act, create } from 'react-test-renderer';
import { Text, TouchableOpacity } from 'react-native';
import ActivityWideAdhocPreviewScreen from 'app/screens/ActivityWideAdhocPreviewScreen';
import AuthContext from 'app/auth/context';
import scheduleApi from 'app/api/schedule';
jest.mock('@react-navigation/native', () => ({
  useIsFocused: () => true,
}));
jest.mock('app/api/schedule', () => ({
  getScheduleV1: jest.fn(),
  generateScheduleV1: jest.fn(),
  refreshScheduleV1: jest.fn(),
  adhocScheduleV1: jest.fn(),
}));
jest.mock('app/utility/miscFunctions', () => ({
  convertTimeMilitary: jest.fn(),
}));
jest.mock(
  'app/components/input-components/SelectionInputField',
  () => (props) => require('react').createElement('MockSelection', props),
);
let tree;
const text = () =>
  tree.root
    .findAllByType(Text)
    .map((n) => n.props.children)
    .flat()
    .join('')
    .replace(/\s+/g, ' ');
const row = () => ({
  PatientID: '9007199254740993',
  Name: 'Synthetic One',
  StartDate: '2026-10-05',
  EndDate: '2026-10-11',
  Monday: '{"09:00-10:00":"Art"}',
  Tuesday: '{"09:00-10:00":"Music"}',
});
const mount = async (role = 'SUPERVISOR') => {
  await act(async () => {
    tree = create(
      <AuthContext.Provider
        value={{ user: { id: 'CaseActor', roleName: role } }}
      >
        <ActivityWideAdhocPreviewScreen />
      </AuthContext.Provider>,
    );
  });
};
beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-10-05T03:00:00Z'));
  scheduleApi.getScheduleV1.mockResolvedValue({
    ok: true,
    data: { Status: '200', Data: [row()] },
  });
});
afterEach(() => {
  if (tree) {
    act(() => tree.unmount());
  }
  tree = null;
  jest.useRealTimers();
});
test.each(['CAREGIVER', 'DOCTOR', 'GUARDIAN'])(
  '%s cannot open Supervisor preview reads',
  async (role) => {
    await mount(role);
    expect(scheduleApi.getScheduleV1).not.toHaveBeenCalled();
    expect(text()).toContain('requires Supervisor');
  },
);
test('Supervisor previews exact names/count without generating or writing', async () => {
  await mount();
  const select = tree.root.findByType('MockSelection');
  expect(select.props.dataArray).toEqual([{ value: 'Art', label: 'Art' }]);
  await act(async () => select.props.onDataChange('Art'));
  expect(text()).toContain('1 affected patients');
  expect(text()).toContain('Synthetic One');
  expect(scheduleApi.getScheduleV1).toHaveBeenCalledTimes(1);
  expect(scheduleApi.generateScheduleV1).not.toHaveBeenCalled();
  expect(scheduleApi.refreshScheduleV1).not.toHaveBeenCalled();
  expect(scheduleApi.adhocScheduleV1).not.toHaveBeenCalled();
});
test('tomorrow changes day and clears stale selected activity without refetch or generation', async () => {
  await mount();
  await act(async () =>
    tree.root.findByType('MockSelection').props.onDataChange('Art'),
  );
  const tomorrow = tree.root
    .findAllByType(TouchableOpacity)
    .find((n) =>
      n.findAllByType(Text).some((t) => t.props.children.includes('Tomorrow')),
    );
  await act(async () => tomorrow.props.onPress());
  expect(tree.root.findByType('MockSelection').props.value).toBe('');
  expect(tree.root.findByType('MockSelection').props.dataArray).toEqual([
    { value: 'Music', label: 'Music' },
  ]);
  expect(scheduleApi.getScheduleV1).toHaveBeenCalledTimes(1);
});
test('failed schedule read shows error rather than a successful empty preview', async () => {
  scheduleApi.getScheduleV1.mockResolvedValue({ ok: false, status: 500 });
  await mount();
  expect(tree.root.findAllByType('MockSelection')).toHaveLength(0);
  expect(text()).toContain('could not be loaded');
});
