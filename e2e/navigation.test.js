/* eslint-disable no-undef */

describe('Navigation tests', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    await expect(element(by.id('loginContentContainer'))).toBeVisible();
    await expect(element(by.text('PEAR'))).toBeVisible();
    await expect(element(by.id('username'))).toBeVisible();
    await expect(element(by.id('password'))).toBeVisible();
    await expect(element(by.id('Login'))).toBeVisible();
    await expect(element(by.text('Forgot Password?'))).toBeVisible();

    // Test user input
    await element(by.id('username')).longPress();
    await element(by.id('username')).typeText('jess@gmail.com');
    await element(by.id('loginContentContainer')).longPress();
    await element(by.id('password')).longPress();
    await element(by.id('password')).typeText('Supervisor!23');
    await element(by.id('loginContentContainer')).longPress();
    await element(by.id('Login')).longPress();

    // Successful login -> should see Patient Daily Highlights popup.
    await expect(element(by.text('Patients Daily Highlights'))).toBeVisible();
    await element(by.id('highlightsCloseButton')).longPress();
  });

  it('Tab bar navigation Test', async () => {
    //test navigation
  });
});
