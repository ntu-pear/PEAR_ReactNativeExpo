describe('Mobility Aid tests', () => {
    beforeAll(async () => {
      await device.launchApp();
    });  

    //will be using patient Bi Gong for this test, temporaily use for all easier(future can use different people which are pre-loaded)
    const patientID =  4;
    let mobilityId = 4;

    //within the mobility aid screen, this will be easier to navigate
    const baseID = `mobility_aid_screen_${patientID}`;

    const regexPattern = new RegExp(`${baseID}_(\\d+)`);
    let expectedItemCount = 2;

    it('Mobility Aid: View Mobility Aid', async () => {
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
        
        //go into mobility aid screen
        await expect(element(by.id(`mobilityAid_${patientID}`))).toBeVisible();
        await element(by.id(`mobilityAid_${patientID}`)).tap()

        // Check if the patient mobility page is visible
        await expect(element(by.id(baseID))).toBeVisible();
        await expect(element(by.id(`${baseID}_${mobilityId}`))).toBeVisible();
        await expect(element(by.id(`${baseID}_${mobilityId}_touchable`))).toBeVisible();
    });

    it('Mobility Aid: Add Mobility Aid - Cancel', async () => {
        
        await element(by.id(`${baseID}_addMobilityAid`)).tap();
        await expect(element(by.id(`${baseID}_modal_add`))).toBeVisible();
        await element(by.id(`${baseID}_modal_add_cancel_button`)).tap();

    });

    it('Mobility Aid: Add Mobility Aid - Submit', async () => {
        
        await element(by.id(`${baseID}_addMobilityAid`)).tap();
        await element(by.id(`${baseID}_modal_add_mobility_aid_input`)).tap();
        await element(by.text('Walkers')).tap();

        // temporaily do not include remarks for add
        // await element(by.id(`${baseID}_modal_add_remarks_input`)).tap();
        // await element(by.id(`${baseID}_modal_add_remarks_input`)).typeText('Some remarks');
        // await element(by.id(`${baseID}_modal_add_remarks_input`)).tapReturnKey();
        
        //change from default option of fully recovered to not recovered
        await element(by.id(`${baseID}_modal_add_condition_radio_Not Recovered`)).tap();

        await element(by.id(`${baseID}_modal_add_submit_button`)).tap();
        //Successfully added message appear next
        await expect(element(by.text('Successfully added mobility aid'))).toBeVisible();
        await expect(element(by.text('OK'))).toBeVisible();
        await element(by.text('OK')).tap();
         
    });    


    it('Mobility Aid: Updated number of Mobility Aids after Addition', async () => {
        
        //read in the flatlist
        await waitFor(element(by.id(`${baseID}_flatlist`)))
            .toBeVisible()
            .withTimeout(3000);  

        for (let i = 0; i < expectedItemCount; i++) {
            await waitFor(element(by.id(regexPattern)).atIndex(i))
                .toBeVisible()
                .withTimeout(3000);
        }

        // Check for no additional items
        await expect(element(by.id(regexPattern)).atIndex(expectedItemCount)).toBeNotVisible();
        
    });    

    it('Mobility Aid: Verify Added Mobility Aid', async () => {
                
        const addedItem = element(by.id(regexPattern)).atIndex(0);
        // Select the added item in the list (the newly added one)

        await expect(addedItem).toBeVisible;
        const attributes = await addedItem.getAttributes();
        const testID = attributes.identifier;
        mobilityId = testID.split('_')[4];  

        //check the attributes of the added item
        await expect(element(by.id(`${baseID}_${mobilityId}_mobilityAid_value`))).toHaveText('Walkers');
        await expect(element(by.id(`${baseID}_${mobilityId}_condition_value`))).toHaveText('Not Recovered');
            
    });   

    it('Mobility Aid: Edit Mobility Aid(Button) and Cancel', async () => {
        // Check if the item is visible
        await expect(element(by.id(`${baseID}_${mobilityId}_touchable`))).toBeVisible();
        
        await element(by.id(`${baseID}_${mobilityId}_edit`)).tap();
        
        await element(by.id(`${baseID}_modal_edit_mobility_aid_input`)).tap();
        await element(by.text('Crutches')).tap();
        
        // temporaily do not include remarks for edit
        // await element(by.id(`${baseID}_modal_edit_remarks_input`)).tap();
        // await element(by.id(`${baseID}_modal_edit_remarks_input`)).typeText('New remarks');
        // await element(by.id(`${baseID}_modal_edit_remarks_input`)).tapReturnKey();

        await element(by.id(`${baseID}_modal_edit_cancel_button`)).tap();
        
    });

    it('Mobility Aid: Edit Mobility Aid(Swipeable) and Edit', async () => {
        // Check if the item is visible
        await expect(element(by.id(`${baseID}_${mobilityId}`))).toBeVisible();
        
        // Swipe right to show edit option
        await element(by.id(`${baseID}_${mobilityId}`)).swipe('right','slow')
        
        await element(by.id(`${baseID}_modal_edit_mobility_aid_input`)).tap();
        await element(by.text('Crutches')).tap();
        
        //change to fully recovered
        await element(by.id(`${baseID}_modal_edit_condition_radio_Fully Recovered`)).tap();

        await element(by.id(`${baseID}_modal_edit_submit_button`)).tap();

        //Successfully editted message appear next
        await expect(element(by.text('Successfully edited mobility aid'))).toBeVisible();
        await expect(element(by.text('OK'))).toBeVisible();
        await element(by.text('OK')).tap();
        
    });

    it('Mobility Aid: Verify details of edited mobility aid', async () => {
        // Check if the item is visible
        await expect(element(by.id(`${baseID}_${mobilityId}`))).toBeVisible();
        
        await expect(element(by.id(`${baseID}_${mobilityId}_mobilityAid_value`))).toHaveText('Crutches');
        await expect(element(by.id(`${baseID}_${mobilityId}_condition_value`))).toHaveText('Fully Recovered');
    });

    it('Mobility Aid: Delete Mobility Aid(Swipeable) and Cancel', async () => {
        // Check if the item is visible
        await expect(element(by.id(`${baseID}_${mobilityId}`))).toBeVisible();
        
        // Swipe left to show edit option
        await element(by.id(`${baseID}_${mobilityId}`)).swipe('left','slow')
        
        await expect(element(by.text('Are you sure you wish to delete this item?'))).toBeVisible();
        await expect(element(by.text('CANCEL'))).toBeVisible();
        await expect(element(by.text('OK'))).toBeVisible();
        await element(by.text('CANCEL')).tap();

        
    });

    it('Mobility Aid: Delete Mobility Aid(Button) and Delete', async () => {
        
        // Check if the item is visible
        await expect(element(by.id(`${baseID}_${mobilityId}`))).toBeVisible();
        
        await element(by.id(`${baseID}_${mobilityId}_delete`)).tap();

        await expect(element(by.text('Are you sure you wish to delete this item?'))).toBeVisible();
        await expect(element(by.text('CANCEL'))).toBeVisible();
        await expect(element(by.text('OK'))).toBeVisible();
        await element(by.text('OK')).tap();

        //Successfully deleted message appear next
        await expect(element(by.text('Successfully deleted mobility aid'))).toBeVisible();
        await expect(element(by.text('OK'))).toBeVisible();
        await element(by.text('OK')).tap();
        
    });

    it('Mobility Aid: Updated number of Mobility Aids after Deletion', async () => {
        
        expectedItemCount -= 1;

        //read in the flatlist
        await waitFor(element(by.id(`${baseID}_flatlist`)))
            .toBeVisible()
            .withTimeout(3000);  

        for (let i = 0; i < expectedItemCount; i++) {
            await waitFor(element(by.id(regexPattern)).atIndex(i))
                .toBeVisible()
                .withTimeout(3000);
        }

        // Check for no additional items
        await expect(element(by.id(regexPattern)).atIndex(expectedItemCount)).toBeNotVisible();
        
    });  


})