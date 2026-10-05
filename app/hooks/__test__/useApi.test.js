import React from 'react';
import { act, create } from 'react-test-renderer';
import useApi from 'app/hooks/useApi';

let api;
function Harness({ request }) {
  api = useApi(request);
  return null;
}
afterEach(() => jest.useRealTimers());

test('a thrown adapter error ends loading and exposes failure', async () => {
  let screen;
  act(() => {
    screen = create(
      <Harness
        request={() => {
          throw new Error('adapter failed');
        }}
      />,
    );
  });
  let response;
  await act(async () => {
    response = await api.request();
  });
  expect(response.ok).toBe(false);
  expect(api.loading).toBe(false);
  expect(api.error).toBe(true);
  act(() => screen.unmount());
});

test('older requests cannot overwrite the newest result or clear its loading state', async () => {
  let resolveFirst;
  let resolveSecond;
  const request = jest
    .fn()
    .mockReturnValueOnce(
      new Promise((resolve) => {
        resolveFirst = resolve;
      }),
    )
    .mockReturnValueOnce(
      new Promise((resolve) => {
        resolveSecond = resolve;
      }),
    );
  let screen;
  act(() => {
    screen = create(<Harness request={request} />);
  });
  let first;
  let second;
  act(() => {
    first = api.request();
    second = api.request();
  });
  await act(async () => {
    resolveFirst({ ok: true, data: 'old' });
    await first;
  });
  expect(api.loading).toBe(true);
  await act(async () => {
    resolveSecond({ ok: true, data: 'new' });
    await second;
  });
  expect(api.data).toBe('new');
  expect(api.loading).toBe(false);
  act(() => screen.unmount());
});

test('unsettled requests end with a timeout failure', async () => {
  jest.useFakeTimers();
  let screen;
  act(() => {
    screen = create(<Harness request={() => new Promise(() => {})} />);
  });
  let pending;
  act(() => {
    pending = api.request();
  });
  await act(async () => {
    jest.advanceTimersByTime(30000);
    await pending;
  });
  expect(api.loading).toBe(false);
  expect(api.error).toBe(true);
  act(() => screen.unmount());
});
