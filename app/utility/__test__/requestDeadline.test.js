import requestDeadline from 'app/utility/requestDeadline';

afterEach(() => jest.useRealTimers());
test('clears its timer on success and rejection', async () => {
  jest.useFakeTimers();
  await expect(requestDeadline(Promise.resolve('ready'))).resolves.toBe(
    'ready',
  );
  await expect(
    requestDeadline(Promise.reject(new Error('offline'))),
  ).rejects.toThrow('offline');
  expect(jest.getTimerCount()).toBe(0);
});
test('unsettled auth/storage work is bounded as well as HTTP requests', async () => {
  jest.useFakeTimers();
  const pending = requestDeadline(new Promise(() => {}), 100);
  const result = expect(pending).rejects.toMatchObject({
    problem: 'TIMEOUT_ERROR',
  });
  jest.advanceTimersByTime(100);
  await result;
});
