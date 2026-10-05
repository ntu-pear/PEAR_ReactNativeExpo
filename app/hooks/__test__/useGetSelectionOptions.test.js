import React from 'react';
import { act, create } from 'react-test-renderer';
import useGetSelectionOptions from 'app/hooks/useGetSelectionOptions';
import listApi from 'app/api/list';
import {
  getSelectionOptionCache,
  setSelectionOptionsCache,
} from 'app/datastore/selectionDataCache';

jest.mock('app/api/list', () => ({ getSelectionOptionList: jest.fn() }));
jest.mock('app/datastore/selectionDataCache', () => ({
  getSelectionOptionCache: jest.fn(),
  setSelectionOptionsCache: jest.fn(),
}));
jest.mock('app/utility/qaProfileTiming', () => ({
  beginQaTiming: jest.fn(),
  markQaTiming: jest.fn(),
}));
const success = (label = 'Synthetic vocabulary', id = 7) => ({
  ok: true,
  status: 200,
  data: { data: [{ list_ID: id, value: label }] },
});
let trees;
beforeEach(() => {
  jest.clearAllMocks();
  getSelectionOptionCache.mockReturnValue(null);
  trees = [];
});
afterEach(() => {
  trees.forEach((tree) => act(() => tree.unmount()));
  jest.useRealTimers();
});
async function mount(option = 'diet', enabled = true) {
  let state;
  function Harness(props) {
    state = useGetSelectionOptions(props.option, props.enabled);
    return null;
  }
  let tree;
  await act(async () => {
    tree = create(<Harness option={option} enabled={enabled} />);
  });
  trees.push(tree);
  return {
    state: () => state,
    update: async (nextOption, nextEnabled = true) =>
      act(async () =>
        tree.update(<Harness option={nextOption} enabled={nextEnabled} />),
      ),
    unmount: () => act(() => tree.unmount()),
  };
}
test('disabled lookup never requests vocabulary and cached vocabulary avoids a network request', async () => {
  const disabled = await mount('diet', false);
  expect(disabled.state()).toEqual({
    data: [],
    isError: false,
    isLoading: false,
  });
  expect(listApi.getSelectionOptionList).not.toHaveBeenCalled();
  getSelectionOptionCache.mockReturnValue([
    { label: 'Cached synthetic vocabulary', value: 9 },
  ]);
  await disabled.update('diet');
  expect(disabled.state().data).toEqual([
    { label: 'Cached synthetic vocabulary', value: 9 },
  ]);
  expect(listApi.getSelectionOptionList).not.toHaveBeenCalled();
});
test('success formats and caches vocabulary while an empty successful list also settles', async () => {
  listApi.getSelectionOptionList
    .mockResolvedValueOnce(success())
    .mockResolvedValueOnce({ ok: true, data: { data: [] } });
  const hook = await mount();
  expect(hook.state()).toEqual({
    data: [{ label: 'Synthetic vocabulary', value: 7 }],
    isError: false,
    isLoading: false,
  });
  expect(setSelectionOptionsCache).toHaveBeenCalledWith(
    'diet',
    hook.state().data,
  );
  await hook.update('education');
  expect(hook.state()).toEqual({ data: [], isError: false, isLoading: false });
});
test.each([401, 403, 404, 500])(
  'HTTP %s settles with no cache entry and allows a later successful retry',
  async (status) => {
    listApi.getSelectionOptionList
      .mockResolvedValueOnce({ ok: false, status, data: null })
      .mockResolvedValueOnce(success());
    const hook = await mount();
    expect(hook.state()).toEqual({ data: [], isError: true, isLoading: false });
    expect(setSelectionOptionsCache).not.toHaveBeenCalled();
    await hook.update('diet', false);
    await hook.update('diet', true);
    expect(hook.state().isError).toBe(false);
    expect(hook.state().data).toHaveLength(1);
  },
);
test.each([null, {}, { ok: true, data: { data: {} } }])(
  'malformed response %p settles safely',
  async (response) => {
    listApi.getSelectionOptionList.mockResolvedValue(response);
    const hook = await mount();
    expect(hook.state()).toEqual({ data: [], isError: true, isLoading: false });
  },
);
test('thrown transport failure and synchronous API failure settle loading', async () => {
  listApi.getSelectionOptionList
    .mockRejectedValueOnce(new Error('Synthetic offline failure'))
    .mockImplementationOnce(() => {
      throw new Error('Synthetic synchronous failure');
    });
  const hook = await mount();
  expect(hook.state().isLoading).toBe(false);
  expect(hook.state().isError).toBeInstanceOf(Error);
  await hook.update('pet');
  expect(hook.state().isLoading).toBe(false);
  expect(hook.state().isError).toBeInstanceOf(Error);
});
test('unsettled request times out after 30 seconds and a retry can succeed', async () => {
  jest.useFakeTimers();
  listApi.getSelectionOptionList
    .mockImplementationOnce(() => new Promise(() => {}))
    .mockResolvedValueOnce(success());
  const hook = await mount();
  expect(hook.state().isLoading).toBe(true);
  await act(async () => {
    jest.advanceTimersByTime(30000);
  });
  expect(hook.state().isLoading).toBe(false);
  expect(hook.state().isError).toMatchObject({ problem: 'TIMEOUT_ERROR' });
  await hook.update('diet', false);
  await hook.update('diet', true);
  expect(hook.state().data).toHaveLength(1);
  expect(hook.state().isError).toBe(false);
});
test('late previous-option responses cannot replace current vocabulary or populate the wrong cache', async () => {
  const pending = [];
  listApi.getSelectionOptionList.mockImplementation(
    () => new Promise((resolve) => pending.push(resolve)),
  );
  const hook = await mount('diet');
  await hook.update('education');
  await act(async () => pending[1](success('Current synthetic vocabulary', 2)));
  await act(async () => pending[0](success('Old synthetic vocabulary', 1)));
  expect(hook.state().data).toEqual([
    { label: 'Current synthetic vocabulary', value: 2 },
  ]);
  expect(setSelectionOptionsCache).toHaveBeenCalledTimes(1);
  expect(setSelectionOptionsCache).toHaveBeenCalledWith(
    'education',
    hook.state().data,
  );
});
test('disabled and unmounted pending lookups do not commit late results', async () => {
  const pending = [];
  listApi.getSelectionOptionList.mockImplementation(
    () => new Promise((resolve) => pending.push(resolve)),
  );
  const hook = await mount();
  await hook.update('diet', false);
  await act(async () => pending[0](success()));
  expect(hook.state().data).toEqual([]);
  expect(hook.state().isLoading).toBe(false);
  await hook.update('pet');
  hook.unmount();
  await act(async () => pending[1](success()));
  expect(setSelectionOptionsCache).not.toHaveBeenCalled();
});
