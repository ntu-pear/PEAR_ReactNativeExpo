describe('Patient Profile tests', () => {
    beforeAll(async () => {
      await device.launchApp();
    });  

    //will be using patient Jeline Mao for this test, temporaily use for all easier(future can use different people which are pre-loaded)
    const patientID =  5;

    it('Patient Profile: View Patient Profile : Information Card', async () => {
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

        //see if can go to All Patients and click on that patient instead.
        await expect(element(by.id('patients_searchFilter_tabBar'))).toBeVisible();
        await expect(element(by.id('patients_searchFilter_tabBar_All Patients'))).toBeVisible()
        await element(by.id('patients_searchFilter_tabBar_All Patients')).tap()

        //go to that patient profile
        await element(by.id(`patientprofile_${patientID}`)).tap();

        //check lefthand side portion of the patient information card
        await expect(element(by.id("patient_profile_picture"))).toBeVisible();

        await expect(element(by.id("patient_preferred_name"))).toBeVisible();
        await expect(element(by.id('patient_preferred_name'))).toHaveText('Jeline');

        await expect(element(by.id("patient_gender"))).toBeVisible();
        await expect(element(by.id('patient_gender'))).toHaveText('FEMALE');

        await expect(element(by.id("patient_preferred_language"))).toBeVisible();
        await expect(element(by.id('patient_preferred_language'))).toHaveText('Cantonese');

        //check righthand side portion of the patient information card

        await expect(element(by.id("nric_label"))).toBeVisible();
        await expect(element(by.id('nric_value'))).toHaveText('Sxxxx481J');
    
        await expect(element(by.id("dob_label"))).toBeVisible();
        await expect(element(by.id('dob_value'))).toHaveText('05-MAY-1980');
    
        await expect(element(by.id("age_label"))).toBeVisible();
        await expect(element(by.id('age_value'))).toHaveText('44');
    
        await expect(element(by.id("mobile_number_label"))).toBeVisible();
        await expect(element(by.id('mobile_number_value'))).toHaveText('92222816');

    });

    it('Patient Profile: View Patient Profile : Cards', async () => {

        //check that all 13 elements of the cards are visible in the patient profile.
        await expect(element(by.id(`allergy_${patientID}`))).toBeVisible();
        await expect(element(by.id(`vital_${patientID}`))).toBeVisible();
        await expect(element(by.id(`medication_${patientID}`))).toBeVisible();
        await expect(element(by.id(`prescription_${patientID}`))).toBeVisible();

        await expect(element(by.id(`problemLog_${patientID}`))).toBeVisible();
        await expect(element(by.id(`medicalHistory_${patientID}`))).toBeVisible();
        await expect(element(by.id(`activityRoutine_${patientID}`))).toBeVisible();
        await expect(element(by.id(`schedule_${patientID}`))).toBeVisible();

        await expect(element(by.id(`activityPreference_${patientID}`))).toBeVisible();
        await expect(element(by.id(`photoAlbum_${patientID}`))).toBeVisible();
        await expect(element(by.id(`holiday_${patientID}`))).toBeVisible();
        await expect(element(by.id(`mobilityAid_${patientID}`))).toBeVisible();

        await expect(element(by.id(`doctorNote_${patientID}`))).toBeVisible();

    });

    it('Patient Profile: View Patient Profile: Accordions', async () => {
        
        await element(by.id(`${patientID}_scroll_view`)).scrollTo('bottom');

        await expect(element(by.id(`accordion_Patient Information_header`))).toBeVisible();
        await element(by.id(`accordion_Patient Information_header`)).tap();
        await element(by.id(`${patientID}_scroll_view`)).scrollTo('bottom');
        await expect(element(by.id(`accordion_Patient Information_content`))).toBeVisible();
        await element(by.id(`accordion_Patient Information_header`)).tap();

        await expect(element(by.id(`accordion_Patient Preferences_header`))).toBeVisible();
        await element(by.id(`accordion_Patient Preferences_header`)).tap();
        await element(by.id(`${patientID}_scroll_view`)).scrollTo('bottom');
        await expect(element(by.id(`accordion_Patient Preferences_content`))).toBeVisible();
        await element(by.id(`accordion_Patient Preferences_header`)).tap();

        await expect(element(by.id(`accordion_Guardian(s) Information_header`))).toBeVisible();
        await element(by.id(`accordion_Guardian(s) Information_header`)).tap();
        await element(by.id(`${patientID}_scroll_view`)).scrollTo('bottom');
        await expect(element(by.id(`accordion_Guardian(s) Information_content`))).toBeVisible();
        await element(by.id(`accordion_Guardian(s) Information_header`)).tap();

        await expect(element(by.id(`accordion_Social History_header`))).toBeVisible();
        await element(by.id(`accordion_Social History_header`)).tap();
        await element(by.id(`${patientID}_scroll_view`)).scrollTo('bottom');
        await expect(element(by.id(`accordion_Social History_content`))).toBeVisible();
        await element(by.id(`accordion_Social History_header`)).tap();

    });

    it('Patient Profile: Navigation between Patient Profile and Cards', async () => {
        
        await expect(element(by.id(`allergy_${patientID}`))).toBeVisible();
        await element(by.id(`allergy_${patientID}`)).tap()
        await expect(element(by.id(`allergy_screen_${patientID}_profileNameButton`))).toBeVisible();
        await element(by.id(`allergy_screen_${patientID}_profileNameButton`)).tap()

        await expect(element(by.id(`vital_${patientID}`))).toBeVisible();
        await element(by.id(`vital_${patientID}`)).tap()
        await expect(element(by.id(`vital_screen_${patientID}_profileNameButton`))).toBeVisible();
        await element(by.id(`vital_screen_${patientID}_profileNameButton`)).tap()

        await expect(element(by.id(`medication_${patientID}`))).toBeVisible();
        await element(by.id(`medication_${patientID}`)).tap()
        await expect(element(by.id(`medication_screen_${patientID}_profileNameButton`))).toBeVisible();
        await element(by.id(`medication_screen_${patientID}_profileNameButton`)).tap()

        await expect(element(by.id(`prescription_${patientID}`))).toBeVisible();
        await element(by.id(`prescription_${patientID}`)).tap()
        await expect(element(by.id(`prescription_screen_${patientID}_profileNameButton`))).toBeVisible();
        await element(by.id(`prescription_screen_${patientID}_profileNameButton`)).tap()

        await expect(element(by.id(`problemLog_${patientID}`))).toBeVisible();
        await element(by.id(`problemLog_${patientID}`)).tap()
        await expect(element(by.id(`problem_log_screen_${patientID}_profileNameButton`))).toBeVisible();
        await element(by.id(`problem_log_screen_${patientID}_profileNameButton`)).tap()

        await expect(element(by.id(`medicalHistory_${patientID}`))).toBeVisible();
        await element(by.id(`medicalHistory_${patientID}`)).tap()
        await expect(element(by.id(`medical_history_screen_${patientID}_profileNameButton`))).toBeVisible();
        await element(by.id(`medical_history_screen_${patientID}_profileNameButton`)).tap()

        // commented out as routine not implemented yet.
        // await expect(element(by.id(`activityRoutine_${patientID}`))).toBeVisible();
        // await element(by.id(`activityRoutine_${patientID}`)).tap()


        await expect(element(by.id(`schedule_${patientID}`))).toBeVisible();
        await element(by.id(`schedule_${patientID}`)).tap()
        await expect(element(by.id(`schedule_screen_${patientID}_profileNameButton`))).toBeVisible();
        await element(by.id(`schedule_screen_${patientID}_profileNameButton`)).tap()

        await expect(element(by.id(`activityPreference_${patientID}`))).toBeVisible();
        await element(by.id(`activityPreference_${patientID}`)).tap()
        await expect(element(by.id(`activity_preference_screen_${patientID}_profileNameButton`))).toBeVisible();
        await element(by.id(`activity_preference_screen_${patientID}_profileNameButton`)).tap()

        // commented out as photo album not implemented yet.
        // await expect(element(by.id(`photoAlbum_${patientID}`))).toBeVisible();
        // await element(by.id(`photoAlbum_${patientID}`)).tap()

        // commented out as holiday is not implemented yet.
        // await expect(element(by.id(`holiday_${patientID}`))).toBeVisible();
        // await element(by.id(`holiday_${patientID}`)).tap()

        await expect(element(by.id(`mobilityAid_${patientID}`))).toBeVisible();
        await element(by.id(`mobilityAid_${patientID}`)).tap()
        await expect(element(by.id(`mobility_aid_screen_${patientID}_profileNameButton`))).toBeVisible();
        await element(by.id(`mobility_aid_screen_${patientID}_profileNameButton`)).tap()

        await expect(element(by.id(`doctorNote_${patientID}`))).toBeVisible();
        await element(by.id(`doctorNote_${patientID}`)).tap()
        await expect(element(by.id(`doctor_note_screen_${patientID}_profileNameButton`))).toBeVisible();
        await element(by.id(`doctor_note_screen_${patientID}_profileNameButton`)).tap()

    });

    


})