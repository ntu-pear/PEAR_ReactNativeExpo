jest.mock('@react-native-async-storage/async-storage', () => ({}));
import {
  createGuardianLookup,
  guardianLookupResult,
} from 'app/utility/guardianLookup';
const response = (nric = 'S0000000J', id = '9007199254740993') => ({
  ok: true,
  data: {
    patient_guardian: {
      id,
      nric,
      active: 'Y',
      isDeleted: '0',
      firstName: 'SYNTHETIC',
      lastName: 'GUARDIAN',
    },
    patients: [],
  },
});
test('exact lookup preserves a large identifier and normalizes only the queried NRIC', async () => {
  const lookup = jest.fn().mockResolvedValue(response());
  const controller = createGuardianLookup({ lookup });
  controller.setQuery(' s0000000j ');
  expect(await controller.search()).toMatchObject({
    status: 'found',
    id: '9007199254740993',
  });
  expect(lookup).toHaveBeenCalledWith('S0000000J');
});
test('changing the query makes a late successful read stale', async () => {
  let release;
  const controller = createGuardianLookup({
    lookup: () =>
      new Promise((resolve) => {
        release = resolve;
      }),
  });
  controller.setQuery('S0000000J');
  const first = controller.search();
  controller.setQuery('S0000001I');
  release(response());
  expect(await first).toEqual({ status: 'stale' });
});
test('cancellation cannot select a late result', async () => {
  let release;
  const controller = createGuardianLookup({
    lookup: () =>
      new Promise((resolve) => {
        release = resolve;
      }),
  });
  controller.setQuery('S0000000J');
  const first = controller.search();
  controller.cancel();
  release(response());
  expect(await first).toEqual({ status: 'stale' });
});
test('only the specific not-found response is treated as absent', () => {
  expect(
    guardianLookupResult(
      { ok: false, status: 404, data: { detail: 'Guardian not found' } },
      'S0000000J',
    ).status,
  ).toBe('not_found');
  for (const status of [401, 403, 404, 500]) {
    expect(() =>
      guardianLookupResult(
        { ok: false, status, data: { detail: 'Error' } },
        'S0000000J',
      ),
    ).toThrow();
  }
});
test('mismatched NRIC and already-rounded numeric IDs cannot be selected', () => {
  expect(() =>
    guardianLookupResult(response('S0000001I'), 'S0000000J'),
  ).toThrow();
  expect(() =>
    guardianLookupResult(response('S0000000J', 9007199254740992), 'S0000000J'),
  ).toThrow();
});
