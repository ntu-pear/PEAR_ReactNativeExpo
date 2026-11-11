// Icon fonts load through expo-asset, which needs a real file system. In Jest
// the native file system is a stub, so treat fonts as already loaded.
jest.mock('expo-font', () => {
  const actual = jest.requireActual('expo-font');
  return {
    ...actual,
    isLoaded: jest.fn(() => true),
    loadAsync: jest.fn(() => Promise.resolve()),
  };
});
