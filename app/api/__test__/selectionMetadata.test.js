const mockClient = { get: jest.fn() };
jest.mock('app/api/client', () => ({
  __esModule: true,
  default: mockClient,
  PATIENT_V1_BASE: 'http://synthetic-staging.invalid/api/v1',
}));
test('selection normalization preserves status and HTTP-client duration for read diagnostics', async () => {
  const list = require('app/api/list').default;
  mockClient.get.mockResolvedValue({
    ok: true,
    status: 200,
    duration: 12,
    data: { data: [{ Id: 4, Value: 'Synthetic vocabulary' }] },
  });
  const result = await list.getSelectionOptionList('diet');
  expect(result).toMatchObject({
    ok: true,
    status: 200,
    duration: 12,
    data: { data: [{ list_ID: 4, value: 'Synthetic vocabulary' }] },
  });
});
