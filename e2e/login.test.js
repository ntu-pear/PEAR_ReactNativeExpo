describe('Login tests', () => {
  beforeAll(async () => {
    await device.launchApp();
  });  

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('Login: login button disabled by default', async () => {
    // Ensure all expected elements in the loginScreen are present.
    await expect(element(by.id('loginContentContainer'))).toBeVisible();
    await expect(element(by.id('username_input'))).toBeVisible();
    await expect(element(by.id('password_input'))).toBeVisible();
    await expect(element(by.id('role_input'))).toBeVisible();
    await expect(element(by.id('login'))).toBeVisible();
    await expect(element(by.text('Forgot Password?'))).toBeVisible();

    await expect(
      element(
        by.traits(['button', 'disabled']).and(
        by.id('login'))
    )).toExist();
  });

  it('Login: invalid credentials (username)', async () => {
    // Ensure all expected elements in the loginScreen are present.
    await expect(element(by.id('loginContentContainer'))).toBeVisible();
    await expect(element(by.id('username_input'))).toBeVisible();
    await expect(element(by.id('password_input'))).toBeVisible();
    await expect(element(by.id('role_input'))).toBeVisible();
    await expect(element(by.id('login'))).toBeVisible();
    await expect(element(by.text('Forgot Password?'))).toBeVisible();

    // Test user input
    await element(by.id('username_input')).tap();
    await element(by.id('username_input')).typeText('wrong@gmail.com');
    await element(by.id('role_input')).tap();
    await element(by.text('Supervisor')).tap();
    await element(by.id('password_input')).tap();
    await element(by.id('password_input')).typeText('Supervisor!23');
    await element(by.id('loginContentContainer')).tap();
    await element(by.id('login')).longPress();

    await waitFor(element(by.id('loginError'))).toHaveText(
      'Invalid email and/or password',
    );
  });

  it('Login: invalid credentials (user role)', async () => {
    // Ensure all expected elements in the loginScreen are present.
    await expect(element(by.id('loginContentContainer'))).toBeVisible();
    await expect(element(by.id('username_input'))).toBeVisible();
    await expect(element(by.id('password_input'))).toBeVisible();
    await expect(element(by.id('role_input'))).toBeVisible();
    await expect(element(by.id('login'))).toBeVisible();
    await expect(element(by.text('Forgot Password?'))).toBeVisible();

    // Test user input
    await element(by.id('username_input')).tap();
    await element(by.id('username_input')).typeText('jess@gmail.com');
    await element(by.id('role_input')).tap();
    await element(by.text('Caregiver')).tap();
    await element(by.id('password_input')).tap();
    await element(by.id('password_input')).typeText('Supervisor!23');
    await element(by.id('loginContentContainer')).tap();
    await element(by.id('login')).longPress();

    await waitFor(element(by.id('loginError'))).toHaveText(
      'Invalid email and/or password',
    );
  });

  it('Login: invalid credentials (password)', async () => {
    // Ensure all expected elements in the loginScreen are present.
    await expect(element(by.id('loginContentContainer'))).toBeVisible();
    await expect(element(by.id('username_input'))).toBeVisible();
    await expect(element(by.id('password_input'))).toBeVisible();
    await expect(element(by.id('role_input'))).toBeVisible();
    await expect(element(by.id('login'))).toBeVisible();
    await expect(element(by.text('Forgot Password?'))).toBeVisible();

    // Test user input
    await element(by.id('username_input')).tap();
    await element(by.id('username_input')).typeText('jess@gmail.com');
    await element(by.id('role_input')).tap();
    await element(by.text('Supervisor')).tap();
    await element(by.id('password_input')).tap();
    await element(by.id('password_input')).typeText('wrong');
    await element(by.id('loginContentContainer')).tap();
    await element(by.id('login')).longPress();

    await waitFor(element(by.id('loginError'))).toHaveText(
      'Invalid email and/or password',
    );
  });

  it('Login: incomplete credentials (no username)', async () => {
    // Ensure all expected elements in the loginScreen are present.
    await expect(element(by.id('loginContentContainer'))).toBeVisible();
    await expect(element(by.id('username_input'))).toBeVisible();
    await expect(element(by.id('password_input'))).toBeVisible();
    await expect(element(by.id('login'))).toBeVisible();
    await expect(element(by.text('Forgot Password?'))).toBeVisible();

    // Test user input
    await element(by.id('username_input')).tap();
    await element(by.id('loginContentContainer')).tap();

    await waitFor(element(by.id('username_error'))).toHaveText(
          'is required',
        );
    await expect(
      element(
        by.traits(['button', 'disabled']).and(
        by.id('login'))
    )).toExist();
  });

  it('Login: incomplete credentials (no password)', async () => {
    // Ensure all expected elements in the loginScreen are present.
    await expect(element(by.id('loginContentContainer'))).toBeVisible();
    await expect(element(by.id('username_input'))).toBeVisible();
    await expect(element(by.id('password_input'))).toBeVisible();
    await expect(element(by.id('login'))).toBeVisible();
    await expect(element(by.text('Forgot Password?'))).toBeVisible();

    // Test user input
    await element(by.id('password_input')).tap();
    await element(by.id('loginContentContainer')).tap();

    await waitFor(element(by.id('password_error'))).toHaveText(
          'is required',
        );
    await expect(
      element(
        by.traits(['button', 'disabled']).and(
        by.id('login'))
    )).toExist();
  });

  it('Login: valid credentials', async () => {
    // Ensure all expected elements in the loginScreen are present.
    await expect(element(by.id('loginContentContainer'))).toBeVisible();
    await expect(element(by.id('username_input'))).toBeVisible();
    await expect(element(by.id('password_input'))).toBeVisible();
    await expect(element(by.id('role_input'))).toBeVisible();
    await expect(element(by.id('login'))).toBeVisible();
    await expect(element(by.text('Forgot Password?'))).toBeVisible();

    // Test user input
    await element(by.id('username_input')).tap();
    await element(by.id('username_input')).typeText('jess@gmail.com');
    await element(by.id('role_input')).tap();
    await element(by.text('Supervisor')).tap();
    await element(by.id('password_input')).tap();
    await element(by.id('password_input')).typeText('Supervisor!23');
    await element(by.id('loginContentContainer')).tap();
    await element(by.id('login')).longPress();

    // Successful login -> should see Patient Daily Highlights popup.
    await expect(element(by.text('Patients Daily Highlights'))).toBeVisible();
  });
})