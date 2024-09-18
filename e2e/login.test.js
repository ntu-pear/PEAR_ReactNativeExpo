describe('Login tests', () => {
  beforeAll(async () => {
    await device.launchApp();
  });  

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  // Ensure all expected elements in the loginScreen are present.
  const checkLoginElements = async () => {
    await expect(element(by.id('loginContentContainer'))).toBeVisible();
    await expect(element(by.id('username_input'))).toBeVisible();
    await expect(element(by.id('password_input'))).toBeVisible();
    await expect(element(by.id('role_input'))).toBeVisible();
    await expect(element(by.id('login'))).toBeVisible();
    await expect(element(by.text('Forgot Password?'))).toBeVisible();
  };

  // Test user input
  const enterCredentials = async (username, role, password) => {
    await element(by.id('username_input')).tap();
    await element(by.id('username_input')).typeText(username);
    await element(by.id('role_input')).tap();
    await element(by.text(role)).tap();
    await element(by.id('password_input')).tap();
    await element(by.id('password_input')).typeText(password);
    await element(by.id('loginContentContainer')).tap();
  };

  const verifyErrorMessage = async (errorId, expectedMessage) => {
    await waitFor(element(by.id(errorId))).toHaveText(expectedMessage);
  };

  it('Login: login button disabled by default', async () => {
    await checkLoginElements();
    await expect(element(by.traits(['button', 'disabled']).and(by.id('login')))).toExist();
  });

  it('Login: invalid credentials (username)', async () => {
    await checkLoginElements();
    await enterCredentials('wrong@gmail.com', 'Supervisor', 'Supervisor!23');
    await element(by.id('login')).longPress();
    await verifyErrorMessage('loginError', 'Invalid email and/or password');
  });

  it('Login: invalid credentials (user role)', async () => {
    await checkLoginElements();
    await enterCredentials('jess@gmail.com', 'Caregiver', 'Supervisor!23');
    await element(by.id('login')).longPress();
    await verifyErrorMessage('loginError', 'Invalid email and/or password');
  });

  it('Login: invalid credentials (password)', async () => {
    await checkLoginElements();
    await enterCredentials('jess@gmail.com', 'Supervisor', 'wrong');
    await element(by.id('login')).longPress();
    await verifyErrorMessage('loginError', 'Invalid email and/or password');
  });

  it('Login: incomplete credentials (no username)', async () => {
    await checkLoginElements();
    await element(by.id('username_input')).tap();
    await element(by.id('loginContentContainer')).tap(); 
    await verifyErrorMessage('username_error', 'is required');
    await expect(element(by.traits(['button', 'disabled']).and(by.id('login')))).toExist();
  });

  it('Login: incomplete credentials (no password)', async () => {
    await checkLoginElements();
    await element(by.id('password_input')).tap(); 
    await element(by.id('loginContentContainer')).tap();
    await verifyErrorMessage('password_error', 'is required');
    await expect(element(by.traits(['button', 'disabled']).and(by.id('login')))).toExist();
  });

  it('Login: valid credentials', async () => {
    await checkLoginElements();
    await enterCredentials('jess@gmail.com', 'Supervisor', 'Supervisor!23');
    await element(by.id('login')).longPress();
    await expect(element(by.text('Patients Daily Highlights'))).toBeVisible();
  });
})