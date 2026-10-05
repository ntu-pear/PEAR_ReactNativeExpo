import React from 'react';
import { act, create } from 'react-test-renderer';
import usePatientActivityData from 'app/hooks/usePatientActivityData';
import patient from 'app/api/patient';
import activity from 'app/api/activity';
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback) =>
    require('react').useEffect(callback, [callback]),
}));
jest.mock('app/api/patient', () => ({ readPatientV1: jest.fn() }));
jest.mock('app/api/activity', () => ({
  getPatientActivityAggregate: jest.fn(),
}));
jest.mock('app/utility/patientHeader', () => ({
  patientFromApiResponse: (res) => res.data.data,
}));
const success = (id = 7) => ({
  ok: true,
  data: { data: { id, preferredName: 'Synthetic' } },
});
const activitySuccess = () => ({
  ok: true,
  data: {
    preferences: [{ centreActivityID: 3 }],
    recommendations: [],
    exclusions: [],
  },
});
let trees;
beforeEach(() => {
  jest.clearAllMocks();
  trees = [];
  patient.readPatientV1.mockResolvedValue(success());
  activity.getPatientActivityAggregate.mockResolvedValue(activitySuccess());
});
afterEach(() => {
  trees.forEach((tree) => act(() => tree.unmount()));
  jest.useRealTimers();
});
async function mount() {
  let state;
  function Harness({ id }) {
    state = usePatientActivityData(id);
    return null;
  }
  let tree;
  await act(async () => {
    tree = create(<Harness id={7} />);
  });
  trees.push(tree);
  return {
    state: () => state,
    update: (id) => act(async () => tree.update(<Harness id={id} />)),
    unmount: () => act(() => tree.unmount()),
  };
}
test('focus dispatches exactly two page requests and refresh repeats each once', async () => {
  const hook = await mount();
  expect(hook.state().errors).toEqual([]);
  expect(hook.state().patientData.id).toBe(7);
  expect(patient.readPatientV1).toHaveBeenCalledTimes(1);
  expect(activity.getPatientActivityAggregate).toHaveBeenCalledTimes(1);
  await act(async () => {
    await hook.state().refresh();
  });
  expect(patient.readPatientV1).toHaveBeenCalledTimes(2);
  expect(activity.getPatientActivityAggregate).toHaveBeenCalledTimes(2);
});
test('a successful header cannot clear the aggregate failure', async () => {
  activity.getPatientActivityAggregate.mockResolvedValue({
    ok: false,
    status: 403,
  });
  const hook = await mount();
  expect(hook.state().isLoading).toBe(false);
  expect(hook.state().errors).toEqual([
    'preferences',
    'recommendations',
    'exclusions',
  ]);
  expect(hook.state().preferences).toEqual([]);
});
test('wrong patient header is discarded while valid activity data remains', async () => {
  patient.readPatientV1.mockResolvedValue(success(99));
  const hook = await mount();
  expect(hook.state().patientData).toEqual({});
  expect(hook.state().errors).toEqual(['patient']);
  expect(hook.state().preferences).toHaveLength(1);
});
test('a rejected transport settles and does not leave a loading state', async () => {
  activity.getPatientActivityAggregate.mockRejectedValue(
    new Error('Synthetic failure'),
  );
  const hook = await mount();
  expect(hook.state().isLoading).toBe(false);
  expect(hook.state().errors).toContain('preferences');
});
test('late responses from the previous patient cannot replace the current patient', async () => {
  let resolveOld;
  patient.readPatientV1.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        resolveOld = resolve;
      }),
  );
  const hook = await mount();
  patient.readPatientV1.mockResolvedValue(success(8));
  await hook.update(8);
  expect(hook.state().patientData.id).toBe(8);
  await act(async () => {
    resolveOld(success());
  });
  expect(hook.state().patientData.id).toBe(8);
});
test('unmount invalidates the in-flight generation', async () => {
  let resolveOld;
  activity.getPatientActivityAggregate.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        resolveOld = resolve;
      }),
  );
  const hook = await mount();
  hook.unmount();
  await act(async () => {
    resolveOld(activitySuccess());
  });
  expect(hook.state().isLoading).toBe(true);
});
test('whole request deadline settles hanging auth/storage as well as HTTP', async () => {
  jest.useFakeTimers();
  activity.getPatientActivityAggregate.mockReturnValue(new Promise(() => {}));
  const hook = await mount();
  expect(hook.state().isLoading).toBe(true);
  await act(async () => {
    jest.advanceTimersByTime(30000);
  });
  expect(hook.state().isLoading).toBe(false);
  expect(hook.state().errors).toContain('preferences');
});
