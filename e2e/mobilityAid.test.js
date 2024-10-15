describe('Mobility Aid tests', () => {
    beforeAll(async () => {
      await device.launchApp();
    });  

    //will be using patient Detox for testing
    const patientID =  1019;
    let mobilityId = 4;

    //within the mobility aid screen, this will be easier to navigate
    const baseID = `mobility_aid_screen_${patientID}`;

    //to be able to track the new mobility aid being added
    const regexPattern = new RegExp(`${baseID}_(\\d+)`);
    let expectedItemCount = 1;

    const mobilityAids  = ['Cane', 'Crutches', 'Walkers', 'Gait trainers', 'Scooter', 'Wheelchairs',]

    it('Mobility Aid: View Mobility Aid Screen', async () => {
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

        //go to that patient profile
        await element(by.id(`patientprofile_${patientID}`)).tap();
        
        //go into mobility aid screen
        await expect(element(by.id(`mobilityAid_${patientID}`))).toBeVisible();
        await element(by.id(`mobilityAid_${patientID}`)).tap()

        // Check if the patient mobility page is visible
        await expect(element(by.id(baseID))).toBeVisible();
        await expect(element(by.id(regexPattern)).atIndex(0)).toBeNotVisible();
        await expect(element(by.text('No mobility aids found'))).toExist();
    });

    it('Mobility Aid: Add Mobility Aid - Cancel', async () => {
        
        await element(by.id(`${baseID}_addMobilityAid`)).tap();
        await expect(element(by.id(`${baseID}_modal_add`))).toBeVisible();
        await element(by.id(`${baseID}_modal_add_cancel_button`)).tap();

    });

    it('Mobility Aid: Add Mobility Aid - Submit button disabled without input', async () => {
        
        await element(by.id(`${baseID}_addMobilityAid`)).tap();
        await expect(element(by.id(`${baseID}_modal_add`))).toBeVisible();

        const attributes = await element(by.id(`${baseID}_modal_add_submit_button`)).getAttributes();
        // import jestExpect from 'expect';
        const jestExpect = require('expect').default;
        //alpha means the opacity value of the value.
        jestExpect(attributes.alpha).toBe(0.4);

        await element(by.id(`${baseID}_modal_add_cancel_button`)).tap();

    });

    it('Mobility Aid: Add Mobility Aid - Submit', async () => {
        
        await element(by.id(`${baseID}_addMobilityAid`)).tap();
        await element(by.id(`${baseID}_modal_add_mobility_aid_select`)).tap();

        //check if all mobility aids are present in the selection input
        for (let i = 0; i < mobilityAids.length; i++) {
            await expect(element(by.text(mobilityAids[i]))).toBeVisible();
        }

        await element(by.text('Walkers')).tap();

        await element(by.id(`${baseID}_modal_add_remarks_input`)).tap();
        await element(by.id(`${baseID}_modal_add_remarks_input`)).typeText('Some remarks');
        await element(by.id(`${baseID}_modal_add_remarks_input`)).tapReturnKey();
        
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
        await expect(element(by.id(`${baseID}_flatlist`))).toBeVisible()

        for (let i = 0; i < expectedItemCount; i++) {
            await expect(element(by.id(regexPattern)).atIndex(i)).toBeVisible();
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
        
        await element(by.id(`${baseID}_modal_edit_mobility_aid_select`)).tap();
        await element(by.text('Crutches')).tap();
        
        await element(by.id(`${baseID}_modal_edit_remarks_input`)).tap();
        await element(by.id(`${baseID}_modal_edit_remarks_input`)).replaceText('New remarks');
        await element(by.id(`${baseID}_modal_edit_remarks_input`)).tapReturnKey();

        await element(by.id(`${baseID}_modal_edit_cancel_button`)).tap();
        
    });

    it('Mobility Aid: Edit Mobility Aid(Swipeable) and Edit', async () => {
        // Check if the item is visible
        await expect(element(by.id(`${baseID}_${mobilityId}`))).toBeVisible();
        
        // Swipe right to show edit option
        await element(by.id(`${baseID}_${mobilityId}`)).swipe('right','slow')
        
        await element(by.id(`${baseID}_modal_edit_mobility_aid_select`)).tap();
        await element(by.text('Crutches')).tap();

        await element(by.id(`${baseID}_modal_edit_remarks_input`)).tap();
        await element(by.id(`${baseID}_modal_edit_remarks_input`)).replaceText('New remarks');
        await element(by.id(`${baseID}_modal_edit_remarks_input`)).tapReturnKey();
        
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
       await expect(element(by.id(`${baseID}_flatlist`))).toBeVisible()  

       for (let i = 0; i < expectedItemCount; i++) {
           await expect(element(by.id(regexPattern)).atIndex(i)).toBeVisible();
       }

       // Check for no additional items
       await expect(element(by.id(regexPattern)).atIndex(expectedItemCount)).toBeNotVisible();
        
    });  


})