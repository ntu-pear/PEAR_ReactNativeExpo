describe('Testing the login workflow', () => {
  beforeEach(() => {
    // Cypress starts out with a blank slate for each test
    // so we must tell it to visit our website with the `cy.visit()` command.
    // Since we want to visit the same URL at the start of all our tests,
    // we include it in our beforeEach function so that it runs before each test
    cy.visit('http://localhost:19006/');
  });

  it('displays login success with correct credentials', async () => {
    // Set the username and password input fields
    cy.get('input').eq(0).debug();
    cy.get('input').eq(0).type(Cypress.env('CYPRESS_LOGIN_USERNAME'));
    cy.get('input').eq(2).type(Cypress.env('CYPRESS_LOGIN_PASSWORD'));

    // Set the role selector field
    cy.get('select').select(Cypress.env('CYPRESS_LOGIN_ROLE'));

    // Submit the request by programatically clicking the login button
    // To avoid ambiguity, case-insensitive comparison is used
    cy.contains('div', '/Login/i').click();

    // Wait for login to complete before doing visual regression diff
    cy.get('h2').eq(0).should('contain', 'Example View');

    // Compare the screenshot of the landing page with our baseline version
    cy.compareSnapshot('landing-page', 0.0);
  });
});
