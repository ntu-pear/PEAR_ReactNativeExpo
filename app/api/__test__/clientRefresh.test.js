let mockInterceptor;
const mockRetry = jest.fn();
const mockStorage = { getToken: jest.fn(), storeToken: jest.fn() };
jest.mock('app/auth/authStorage', () => ({
  __esModule: true,
  default: mockStorage,
}));
jest.mock('axios', () => ({ __esModule: true, default: { post: jest.fn() } }));
jest.mock('apisauce', () => ({
  create: () => {
    mockRetry.interceptors = {
      response: {
        use: (_, handler) => {
          mockInterceptor = handler;
        },
      },
    };
    mockRetry.defaults = { headers: { common: {} } };
    return { axiosInstance: mockRetry, addAsyncRequestTransform: jest.fn() };
  },
}));

beforeEach(() => jest.resetModules());

test('a queued 401 receives only one retry even if the refreshed token is rejected', async () => {
  const axios = require('axios').default;
  const storage = require('app/auth/authStorage').default;
  require('app/api/client');
  storage.getToken.mockResolvedValue('test-refresh-token');
  storage.storeToken.mockResolvedValue(undefined);
  let resolveRefresh;
  axios.post.mockReturnValue(
    new Promise((resolve) => {
      resolveRefresh = resolve;
    }),
  );
  mockRetry.mockImplementation((config) =>
    mockInterceptor({ config, response: { status: 401 } }),
  );
  const firstConfig = { url: '/patients/1', headers: {} };
  const secondConfig = { url: '/Guardian', headers: {} };
  const first = mockInterceptor({
    config: firstConfig,
    response: { status: 401 },
  });
  const second = mockInterceptor({
    config: secondConfig,
    response: { status: 401 },
  });
  const completed = Promise.allSettled([first, second]);
  await Promise.resolve();
  resolveRefresh({ data: { access_token: 'test-access-token' } });
  const results = await completed;
  expect(results.map((r) => r.status)).toEqual(['rejected', 'rejected']);
  expect(firstConfig._retry).toBe(true);
  expect(secondConfig._retry).toBe(true);
  expect(axios.post).toHaveBeenCalledTimes(1);
});

test('invalid login does not refresh a prior session', async () => {
  const axios = require('axios').default;
  axios.post.mockClear();
  require('app/api/client');
  await expect(
    mockInterceptor({ config: { url: '/login/' }, response: { status: 401 } }),
  ).rejects.toBeTruthy();
  expect(axios.post).not.toHaveBeenCalled();
});
