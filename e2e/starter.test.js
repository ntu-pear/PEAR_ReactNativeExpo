/* eslint-disable no-undef */
// const { reloadApp } = require('detox-expo-helpers');

describe('Example', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('Login: Failure Test', async () => {
    // Ensure all expected elements in the loginScreen are present.
    await expect(element(by.id('loginContentContainer'))).toBeVisible();
    await expect(element(by.text('PEAR'))).toBeVisible();
    await expect(element(by.id('username'))).toBeVisible();
    await expect(element(by.id('password'))).toBeVisible();
    await expect(element(by.id('Login'))).toBeVisible();
    await expect(element(by.text('Forgot Password?'))).toBeVisible();

    // Test user input
    await element(by.id('username')).longPress();
    await element(by.id('username')).typeText('wrong@gmail.com');
    await element(by.id('loginContentContainer')).longPress();
    await element(by.id('password')).longPress();
    await element(by.id('password')).typeText('Supervisor!11');
    await element(by.id('loginContentContainer')).longPress();
    await element(by.id('Login')).longPress();

    await waitFor(element(by.id('loginError'))).toHaveText(
      'Invalid email and/or password',
    );
  });

  it('Login: Success Test', async () => {
    // Ensure all expected elements in the loginScreen are present.
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
  });
});
