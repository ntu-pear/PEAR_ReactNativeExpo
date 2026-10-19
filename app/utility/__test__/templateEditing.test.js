import {
  templatePayload,
  newTemplate,
  writeTemplate,
} from 'app/utility/templateEditing';
const user = { id: 'sup', roleName: 'SUPERVISOR' };
const payload = {
  ...templatePayload({ ...newTemplate(), name: 'QA', title: 'Template' }, user),
  id: 42,
  is_deleted: false,
  expectedModified: null,
};
const api = () => ({
  get: jest.fn(async () => ({
    ok: true,
    status: 200,
    data: { ...payload, modified_date: null },
  })),
  update: jest.fn(async () => ({ ok: true, data: { id: 42 } })),
  create: jest.fn(),
  remove: jest.fn(async () => ({ ok: true, data: { id: 42 } })),
});
test('payload keeps incomplete defaults separate from applying activities', () => {
  expect(
    templatePayload(
      { ...newTemplate(), name: ' QA ', title: 'Template' },
      user,
    ),
  ).toMatchObject({ name: 'QA', created_by_id: 'sup' });
  expect(() => templatePayload(newTemplate(), user)).toThrow();
  expect(() =>
    templatePayload(
      { ...newTemplate(), name: 'QA', title: 'a' },
      { ...user, roleName: 'CAREGIVER' },
    ),
  ).toThrow();
});
test('changed or mismatched preflight blocks stale edits including null timestamp', async () => {
  for (const changed of [{ id: 43 }, { modified_date: 'today' }]) {
    const a = api();
    a.get.mockResolvedValue({ ok: true, data: { ...payload, ...changed } });
    expect((await writeTemplate({ api: a, payload })).outcome).toBe('rejected');
    expect(a.update).not.toHaveBeenCalled();
  }
});
test('accepted update verifies exact identity and fields', async () => {
  const a = api();
  expect((await writeTemplate({ api: a, payload })).outcome).toBe('verified');
  expect(a.update.mock.calls[0][0]).not.toHaveProperty('expectedModified');
});
test('accepted update with failed read or wrong returned identity remains uncertain', async () => {
  const a = api();
  a.get
    .mockResolvedValueOnce({ ok: true, data: payload })
    .mockResolvedValueOnce({ ok: false, status: 503 });
  expect((await writeTemplate({ api: a, payload })).outcome).toBe('uncertain');
  expect(a.update).toHaveBeenCalledTimes(1);
  const b = api();
  b.update.mockResolvedValue({ ok: true, data: { id: 43 } });
  expect((await writeTemplate({ api: b, payload })).outcome).toBe('uncertain');
});
test('known validation rejection does not become success', async () => {
  const a = api();
  a.update.mockResolvedValue({
    ok: false,
    status: 409,
    data: { detail: 'Name exists' },
  });
  expect(await writeTemplate({ api: a, payload })).toMatchObject({
    outcome: 'rejected',
    message: 'Name exists',
  });
});
test('stale actor prevents submission', async () => {
  const a = api();
  expect(
    (await writeTemplate({ api: a, payload, isCurrent: () => false })).outcome,
  ).toBe('stale');
  expect(a.get).not.toHaveBeenCalled();
});
