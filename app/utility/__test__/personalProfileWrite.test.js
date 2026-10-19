import { writePersonalProfile } from 'app/utility/personalProfileWrite';
const record = {
  id: 'actor1',
  preferredName: 'QA',
  contactNo: '87654321',
  twoFactorEnabled: true,
};
const api = () => ({
  getUser: jest.fn(async () => ({ ok: true, data: record })),
  updateUser: jest.fn(async () => ({ ok: true })),
});
test('only editable fields are submitted and verified, preserving security fields', async () => {
  const a = api();
  expect(
    (
      await writePersonalProfile({
        api: a,
        actor: 'actor1',
        name: 'QA',
        contact: '87654321',
      })
    ).outcome,
  ).toBe('verified');
  expect(a.updateUser).toHaveBeenCalledWith({
    preferredName: 'QA',
    contactNo: '87654321',
  });
});
test('invalid contact or mismatched account prevents submission', async () => {
  const a = api();
  expect(
    (
      await writePersonalProfile({
        api: a,
        actor: 'actor1',
        name: 'QA',
        contact: '1',
      })
    ).outcome,
  ).toBe('rejected');
  expect(
    (
      await writePersonalProfile({
        api: a,
        actor: 'actor2',
        name: 'QA',
        contact: '87654321',
      })
    ).outcome,
  ).toBe('rejected');
  expect(a.updateUser).not.toHaveBeenCalled();
});
test('accepted save plus failed read is uncertain and never automatically resubmitted', async () => {
  const a = api();
  a.getUser
    .mockResolvedValueOnce({ ok: true, data: record })
    .mockResolvedValueOnce({ ok: false, status: 500 });
  expect(
    (
      await writePersonalProfile({
        api: a,
        actor: 'actor1',
        name: 'QA',
        contact: '87654321',
      })
    ).outcome,
  ).toBe('uncertain');
  expect(a.updateUser).toHaveBeenCalledTimes(1);
});
test('stale ownership after preflight prevents a write', async () => {
  const a = api();
  let current = true;
  a.getUser.mockImplementation(async () => {
    current = false;
    return { ok: true, data: record };
  });
  expect(
    (
      await writePersonalProfile({
        api: a,
        actor: 'actor1',
        name: 'QA',
        contact: '87654321',
        isCurrent: () => current,
      })
    ).outcome,
  ).toBe('stale');
  expect(a.updateUser).not.toHaveBeenCalled();
});
