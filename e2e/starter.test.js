/* eslint-disable no-undef */
const { reloadApp } = require('detox-expo-helpers');

describe('Example', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await reloadApp;
  });

  it('User Login Test', async () => {
    await waitFor(element(by.text('PEAR'))).toBeVisible();
  });
});
