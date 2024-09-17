describe('Patients tests', () => {
    beforeAll(async () => {
      await device.launchApp();
    });  
  
    it('Patients: click patients tab from bottom navigation to see patients list', async () => {
      // Login
      await expect(element(by.id('loginContentContainer'))).toBeVisible();
      await expect(element(by.id('username_input'))).toBeVisible();
      await expect(element(by.id('password_input'))).toBeVisible();
      await expect(element(by.id('role_input'))).toBeVisible();
      await expect(element(by.id('login'))).toBeVisible();
      await expect(element(by.text('Forgot Password?'))).toBeVisible();
  
      await element(by.id('username_input')).tap();
      await element(by.id('username_input')).typeText('jess@gmail.com');
      await element(by.id('password_input')).tap();
      await element(by.id('password_input')).typeText('Supervisor!23');
      await element(by.id('loginContentContainer')).tap();
      await element(by.id('login')).longPress();
  
      // On dashboard
      await expect(element(by.text('Patients Daily Highlights'))).toBeVisible();
      await expect(element(by.id('highlightsCloseButton'))).toBeVisible();
      
      await element(by.id('highlightsCloseButton')).tap();
      await expect(element(by.text('My Patients'))).toBeVisible();
      
      // Click patients tab
      await element(by.id('Patients_Tab')).tap()
      
      await expect(element(by.id('patients'))).toBeVisible();
    });
    
    it('Patients: click filter modal to see filter modal (My Patients)', async () => {
      await expect(element(by.text('My Patients'))).toBeVisible();
      await expect(element(by.id('patients_searchFilter'))).toBeVisible();
      await expect(element(by.id('patients_searchFilter_filter'))).toBeVisible();
      await expect(element(by.id('patients_searchFilter_tabBar'))).toBeVisible();
      await expect(element(by.id('patients_searchFilter_search'))).toBeVisible();
      await expect(element(by.id('patients_searchFilter_indicator'))).toBeVisible();
      await expect(element(by.id('patients_searchFilter_count'))).toBeVisible();
      await expect(element(by.id('patients_searchFilter_filter_icon'))).toBeVisible();
      
      await element(by.id('patients_searchFilter_filter_icon')).tap();
      await expect(element(by.text('Sort and Filter'))).toBeVisible();
      await expect(element(by.text('Sort by'))).toBeVisible();
      await expect(element(by.id('patients_searchFilter_filter_sort_Full Name'))).toBeVisible();
      await expect(element(by.id('patients_searchFilter_filter_sort_Preferred Name'))).toBeVisible();
      await expect(element(by.id('patients_searchFilter_filter_sort_Start Date'))).toBeVisible();
      await expect(element(by.id('patients_searchFilter_filter_chip_Patient Status'))).toBeVisible();
      await expect(element(by.id('patients_searchFilter_filter_datetime_min_Start Date'))).toBeVisible();
      await expect(element(by.id('patients_searchFilter_filter_datetime_max_Start Date'))).toBeVisible();
      await expect(element(by.id('patients_searchFilter_filter_apply'))).toBeVisible();
      await expect(element(by.id('patients_searchFilter_filter_reset'))).toBeVisible();
    });
  
    // need test data 
    it('Patients: apply sort/filter (My Patients)', async () => {
      await element(by.id('patients_searchFilter_filter_sort_Full Name')).tap();
      await element(by.id('patients_searchFilter_filter_chip_Patient Status_Inactive')).tap();
      await element(by.id('patients_searchFilter_filter_apply')).tap();
  
      await expect(element(by.id('patients'))).toBeVisible();
      await expect(element(by.text('My Patients'))).toBeVisible();
    });
  
    it('Patients: switch to "All Patients" tab', async () => {
      await expect(element(by.id('patients_searchFilter_tabBar'))).toBeVisible();
      await expect(element(by.id('patients_searchFilter_tabBar_All Patients'))).toBeVisible()
      
      await element(by.id('patients_searchFilter_tabBar_All Patients')).tap()
    });
  
    it('Patients: click filter modal to see filter modal (All Patients)', async () => {
      await expect(element(by.text('All Patients'))).toBeVisible();
      await expect(element(by.id('patients_searchFilter'))).toBeVisible();
      await expect(element(by.id('patients_searchFilter_filter'))).toBeVisible();
      await expect(element(by.id('patients_searchFilter_tabBar'))).toBeVisible();
      await expect(element(by.id('patients_searchFilter_search'))).toBeVisible();
      await expect(element(by.id('patients_searchFilter_indicator'))).toBeVisible();
      await expect(element(by.id('patients_searchFilter_count'))).toBeVisible();
      await expect(element(by.id('patients_searchFilter_filter_icon'))).toBeVisible();
      
      await element(by.id('patients_searchFilter_filter_icon')).tap();
      await expect(element(by.text('Sort and Filter'))).toBeVisible();
      await expect(element(by.text('Sort by'))).toBeVisible();
      await expect(element(by.id('patients_searchFilter_filter_sort_Full Name'))).toBeVisible();
      await expect(element(by.id('patients_searchFilter_filter_sort_Preferred Name'))).toBeVisible();
      await expect(element(by.id('patients_searchFilter_filter_sort_Start Date'))).toBeVisible();
      await expect(element(by.id('patients_searchFilter_filter_sort_Caregiver'))).toBeVisible();
      await expect(element(by.id('patients_searchFilter_filter_chip_Patient Status'))).toBeVisible();
      await expect(element(by.id('patients_searchFilter_filter_dropdown_Caregiver'))).toBeVisible();
      await expect(element(by.id('patients_searchFilter_filter_datetime_min_Start Date'))).toBeVisible();
      await expect(element(by.id('patients_searchFilter_filter_datetime_max_Start Date'))).toBeVisible();
      await expect(element(by.id('patients_searchFilter_filter_apply'))).toBeVisible();
      await expect(element(by.id('patients_searchFilter_filter_reset'))).toBeVisible();
    });
  
    // need test data 
    it('Patients: apply sort/filter (All Patients)', async () => {
      await element(by.id('patients_searchFilter_filter_sort_Preferred Name')).tap();
      await element(by.id('patients_searchFilter_filter_apply')).tap();
  
      await expect(element(by.id('patients'))).toBeVisible();
    });
  })