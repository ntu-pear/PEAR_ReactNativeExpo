describe('Patients tests', () => {
    beforeAll(async () => {
      await device.launchApp();
    });  

    //will be using patient Detox for testing
    const patientID =  1019;
    const regexPattern = new RegExp(`patientprofile_(\\d+)`);
    const myPatientsCount = 4;
  
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

      await element(by.id('patients_searchFilter_filter_apply')).tap();
    });

    it('Patients: filter detox patient based on start and end date (My Patients)', async () => {
      
      await element(by.id('patients_searchFilter_filter_icon')).tap();

      await element(by.id('patients_searchFilter_filter_datetime_min_Start Date')).tap();
      const datePicker = element(by.type('android.widget.DatePicker')) 
      await datePicker.setDatePickerDate('2024/09/01', 'yyyy/MM/dd');
      await element(by.text('OK')).tap();

      await element(by.id('patients_searchFilter_filter_datetime_max_Start Date')).tap();
      await datePicker.setDatePickerDate('2024/12/01', 'yyyy/MM/dd');
      await element(by.text('OK')).tap();

      await element(by.id('patients_searchFilter_filter_apply')).tap();
      await expect(element(by.id("patients_flatlist"))).toBeVisible();
      await expect(element(by.id(`patientprofile_${patientID}`))).toBeVisible();

    });

    it('Patients: Ensure only got patient detox within filter results(My Patients)', async () => {
        
      //read in the flatlist
      await expect(element(by.id('patients_flatlist'))).toBeVisible()

      for (let i = 0; i < 1; i++) {
          await expect(element(by.id(regexPattern)).atIndex(i)).toBeVisible();
      }

      // Check for no additional items
      await expect(element(by.id(regexPattern)).atIndex(1)).toBeNotVisible();
      
    });

    it('Patients: Reset filter and ensure all patients are redisplayed(My Patients)', async () => {
        
      await element(by.id('patients_searchFilter_filter_icon')).tap();
      await expect(element(by.id('patients_searchFilter_filter_reset'))).toBeVisible();
      await element(by.id('patients_searchFilter_filter_reset')).tap();
      
      //read in the flatlist
      await expect(element(by.id('patients_flatlist'))).toBeVisible()

      for (let i = 0; i < myPatientsCount; i++) {
          await expect(element(by.id(regexPattern)).atIndex(i)).toBeVisible();
      }

      // Check for no additional items
      await expect(element(by.id(regexPattern)).atIndex(myPatientsCount)).toBeNotVisible();
      
    });

    

    // it('Patients: search for patient detox through Search Bar (My Patients)', async () => {

    //   await element(by.id('patients_searchFilter_search')).tap();
    //   await element(by.id('patients_searchFilter_search')).typeText('detox');
    //   await element(by.id('patients_searchFilter_search')).tapReturnKey();

    //   await expect(element(by.id("patients_flatlist"))).toBeVisible();
    //   await expect(element(by.id(`patientprofile_${patientID}`))).toBeVisible();
      
    //   for (let i = 0; i < expectedItemCount; i++) {
    //       await expect(element(by.id(regexPattern)).atIndex(i)).toBeVisible();
    //   }

    //   // Check for no additional items
    //   await expect(element(by.id(regexPattern)).atIndex(expectedItemCount)).toBeNotVisible();

    // });

    // it('Patients: Clear search bar to return to show all patients(My Patients)', async () => {

    //   await element(by.id('patients_searchFilter_search')).tap();
    //   await element(by.id('patients_searchFilter_search')).clearText();
    //   await element(by.id('patients_searchFilter_search')).tapReturnKey();
      
    //   for (let i = 0; i < myPatientsCount; i++) {
    //       await expect(element(by.id(regexPattern)).atIndex(i)).toBeVisible();
    //   }

    //   // Check for no additional items
    //   await expect(element(by.id(regexPattern)).atIndex(myPatientsCount)).toBeNotVisible();

    // });

  
    
    it('Patients: Use search filter bar to find inactive patients(My Patients)', async () => {
      await element(by.id('patients_searchFilter_filter_icon')).tap();
      await element(by.id('patients_searchFilter_filter_sort_Full Name')).tap();
      await element(by.id('patients_searchFilter_filter_chip_Patient Status_Inactive')).tap();
      await element(by.id('patients_searchFilter_filter_apply')).tap();
  
      await expect(element(by.id('patients'))).toBeVisible();
      await expect(element(by.text('My Patients'))).toBeVisible();
    });

    it('Patients: Reset filter to ensure active patients are displayed(My Patients)', async () => {
        
      await element(by.id('patients_searchFilter_filter_icon')).tap();
      await expect(element(by.id('patients_searchFilter_filter_reset'))).toBeVisible();
      await element(by.id('patients_searchFilter_filter_reset')).tap();
      
      //read in the flatlist
      await expect(element(by.id('patients_flatlist'))).toBeVisible()

      for (let i = 0; i < myPatientsCount; i++) {
          await expect(element(by.id(regexPattern)).atIndex(i)).toBeVisible();
      }

      // Check for no additional items
      await expect(element(by.id(regexPattern)).atIndex(myPatientsCount)).toBeNotVisible();
      
    });
  
    it('Patients: Switch to "All Patients" tab', async () => {
      await expect(element(by.id('patients_searchFilter_tabBar'))).toBeVisible();
      await expect(element(by.id('patients_searchFilter_tabBar_All Patients'))).toBeVisible()
      
      await element(by.id('patients_searchFilter_tabBar_All Patients')).tap()
    });
  
    it('Patients: Click filter modal to see filter modal (All Patients)', async () => {
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
  
   
    it('Patients: Use search filter bar to find current patients(All Patients)', async () => {
      await element(by.id('patients_searchFilter_filter_dropdown_Caregiver')).tap();
      //match case-insensitive and any items followed by the caregiver name
      await element(by.text(/Jessica Sim.*/i)).tap();
      await element(by.id('patients_searchFilter_filter_apply')).tap();

      //read in the flatlist
      await expect(element(by.id('patients_flatlist'))).toBeVisible()

      for (let i = 0; i < myPatientsCount; i++) {
          await expect(element(by.id(regexPattern)).atIndex(i)).toBeVisible();
      }

      // Check for no additional items
      await expect(element(by.id(regexPattern)).atIndex(myPatientsCount)).toBeNotVisible();
      
    });

    it('Patients: Verify all current patients(All Patients)', async () => {
      
      //read in the flatlist
      await expect(element(by.id('patients_flatlist'))).toBeVisible()

      for (let i = 0; i < myPatientsCount; i++) {
          await expect(element(by.id(regexPattern)).atIndex(i)).toBeVisible();
      }

      // Check for no additional items
      await expect(element(by.id(regexPattern)).atIndex(myPatientsCount)).toBeNotVisible();
      
    });


  })