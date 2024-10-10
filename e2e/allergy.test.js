describe('Allergy tests', () => {
    beforeAll(async () => {
      await device.launchApp();
    });  

    //will be using patient OO id 1015 for this test, and also patient September id 1018 to test 0 allergies as well.
    const patientID = 1015;
    const patientID2 = 1018;

    //will be using peanuts allergy ID to check that it currently exists and is being created. 
    let allergyID = 1;

    //within the allergy screen, this will be easier to navigate
    const baseID = `allergy_screen_${patientID}`;
    const baseID2 = `allergy_screen_${patientID2}`;

    //to be able to track and see the new allergy item
    const regexPattern = new RegExp(`${baseID}_(\\d+)`);
    let expectedItemCount = 2;

    const allergies = ['Corn', 'Eggs', 'Fish', 'Meat', 'Milk', 'Peanuts', 'Tree nuts', 'Shellfish', 'Soy', 'Wheat', 'Seafood',]
    const reactions = ['Rashes', 'Sneezing', 'Vomiting', 'Nausea', 'Swelling', 'Difficulty Breathing', 'Diarrhea',
                        'Abdominal cramp or pain', 'Nasal Congestion', 'Itching', 'Hives', ]
    //List of allergy items with corresponding ids 1 - to be updated, 2 - None, 3 - Corn, 4 - Eggs, 5 - Fish, 6 - Meat, 
    // 7 - Milk, 8 - Peanuts, 9 - Tree Nuts, 10 - Shellfish, 11 - Soy, 12 - Wheat, 13 - Seafood

    //List of allergy reactions with corresponding ids 1 - 'Rashes', 2 - 'Sneezing', 3 - 'Vomiting', 4 - 'Nausea', 5 - 'Swelling', 
    // 6 - 'Difficulty Breathing', 7 - 'Diarrhea', 8 - 'Abdominal cramp or pain', 9 - 'Nasal Congestion', 10 - 'Itching', 11 - 'Hives'
    
    
    it('Allergy: View Allergy Screen - 0 Allergies', async () => {
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
        await element(by.id(`patientprofile_${patientID2}`)).tap();
        
        //go into allergy screen
        await expect(element(by.id(`allergy_${patientID2}`))).toBeVisible();
        await element(by.id(`allergy_${patientID2}`)).tap()

        //Check if at the current allergy page
        await expect(element(by.id(baseID2))).toBeVisible();

        //read in the flatlist and ensure there are no allergies inside that person
        await expect(element(by.id(`${baseID2}_flatlist`))).toBeVisible()
        await expect(element(by.id(regexPattern)).atIndex(0)).toBeNotVisible();
        await expect(element(by.text('No allergies found'))).toExist();
        
    });
    
    it('Allergy: Add Allergy - To be Updated and None is present with all allergies when selecting allergy', async () => {
        
        await element(by.id(`${baseID2}_addAllergy`)).tap();
        await expect(element(by.id(`${baseID2}_modal_add`))).toBeVisible();

        await element(by.id(`${baseID2}_modal_add_allergy_select`)).tap();
        
        //verify the options of To Be Updated and None is not selectable
        await expect(element(by.text('To be updated'))).toBeVisible();
        await expect(element(by.text('None'))).toBeVisible();

        //also check all the other allergies exist as well
        for (let i = 0; i < allergies.length; i++) {
            await expect(element(by.text(allergies[i]))).toBeVisible();
        }

        //click any option and then exit the modal
        await element(by.text('Soy')).tap();
        await element(by.id(`${baseID2}_modal_add_cancel_button`)).tap();

    });

    it('Allergy: View Allergy Screen - 1 Allergies', async () => {
    
        await device.pressBack();

        await device.pressBack();

        //go to that patient profile
        await element(by.id(`patientprofile_${patientID}`)).tap();
        
        //go into allergy screen
        await expect(element(by.id(`allergy_${patientID}`))).toBeVisible();
        await element(by.id(`allergy_${patientID}`)).tap()
        await expect(element(by.id(baseID))).toBeVisible();
        // Check if the patient allergy page is visible and current existing allergy exists

        const allergyItem = element(by.id(regexPattern)).atIndex(0);
        const attributes = await allergyItem.getAttributes();
    
        //get label details
        const labelText = attributes.label;
        console.log(labelText)
    
        //get identifier details
        const testID = attributes.identifier;
        console.log(testID)
        allergyID = testID.split('_')[3];  

        // Parse the label text for the required fields
        const regex = new RegExp('Allergic To:\\s*(.*?)\\s*Reaction:\\s*(.*?)\\s*Notes:\\s*(.*?)(?:\\s*Delete|$)');
        const matches = labelText.match(regex);
        console.log(matches)
        const actualAllergy = matches[1];
        const actualReaction = matches[2];
        const actualNotes = matches[3];

        await expect(element(by.id(`${baseID}_${allergyID}_allergy_value`))).toHaveText(actualAllergy);
        await expect(element(by.id(`${baseID}_${allergyID}_reaction_value`))).toHaveText(actualReaction);
        await expect(element(by.id(`${baseID}_${allergyID}_notes_value`))).toHaveText(actualNotes);

    });

    it('Allergy: Add Allergy - To be Updated and None is not present with all allergies when selecting allergy', async () => {
        
        await element(by.id(`${baseID}_addAllergy`)).tap();
        await expect(element(by.id(`${baseID}_modal_add`))).toBeVisible();

        await element(by.id(`${baseID}_modal_add_allergy_select`)).tap();
        
        //verify the options of To Be Updated and None is not selectable
        await expect(element(by.text('To be updated'))).toBeNotVisible();
        await expect(element(by.text('None'))).toBeNotVisible();

        //also check all the other allergies exist as well
        for (let i = 0; i < allergies.length; i++) {
            await expect(element(by.text(allergies[i]))).toBeVisible();
        }

        await element(by.text('Soy')).tap();
        // then click on another valid option before exiting the modal
        await element(by.id(`${baseID}_modal_add_cancel_button`)).tap();

    });
    
    it('Allergy: Add Allergy - Cancel', async () => {
        
        await element(by.id(`${baseID}_addAllergy`)).tap();
        await expect(element(by.id(`${baseID}_modal_add`))).toBeVisible();
        const attributes = await element(by.id(`${baseID}_modal_add_cancel_button`)).getAttributes();
        console.log(attributes);
        await element(by.id(`${baseID}_modal_add_cancel_button`)).tap();

    });

    it('Allergy: Add Allergy - Submit button disabled without input', async () => {
        
        await element(by.id(`${baseID}_addAllergy`)).tap();
        await expect(element(by.id(`${baseID}_modal_add`))).toBeVisible();

        const attributes = await element(by.id(`${baseID}_modal_add_submit_button`)).getAttributes();
        console.log(attributes);
        // import jestExpect from 'expect';
        const jestExpect = require('expect').default;
        //alpha means the opacity value of the value.
        jestExpect(attributes.alpha).toBe(0.4);

        await element(by.id(`${baseID}_modal_add_cancel_button`)).tap();

    });

    it('Allergy: Add Allergy - Submit', async () => {
        
        await element(by.id(`${baseID}_addAllergy`)).tap();
        await element(by.id(`${baseID}_modal_add_allergy_select`)).tap();
        
        //add allergy Soy
        await element(by.text('Soy')).tap();

        await element(by.id(`${baseID}_modal_add_reaction_select`)).tap();

        //check if all reactions are present in the selection input
        for (let i = 0; i < reactions.length; i++) {
            await expect(element(by.text(reactions[i]))).toBeVisible();
        }

        //add reaction 
        await element(by.text('Vomiting')).tap();
        
        //add remarks input
        await element(by.id(`${baseID}_modal_add_remarks_input`)).tap();
        await element(by.id(`${baseID}_modal_add_remarks_input`)).typeText('Some remarks');
        await element(by.id(`${baseID}_modal_add_remarks_input`)).tapReturnKey();

        await element(by.id(`${baseID}_modal_add_submit_button`)).tap();
        //Successfully added message appear next
        await expect(element(by.text('Successfully added allergy'))).toBeVisible();
        await expect(element(by.text('OK'))).toBeVisible();
        await element(by.text('OK')).tap();
         
    });

    it('Allergy: Updated number of Allergies after Addition', async () => {
        
        //read in the flatlist
        await expect(element(by.id(`${baseID}_flatlist`))).toBeVisible()

        for (let i = 0; i < expectedItemCount; i++) {
            await expect(element(by.id(regexPattern)).atIndex(i)).toBeVisible();
        }

        // Check for no additional items
        await expect(element(by.id(regexPattern)).atIndex(expectedItemCount)).toBeNotVisible();
        
    }); 

    it('Allergy: Verify Added Allergy Details', async () => {
                
        const addedItem = element(by.id(regexPattern)).atIndex(0);
        // Select the added item in the list (the newly added one)

        await expect(addedItem).toBeVisible;
        const attributes = await addedItem.getAttributes();
        const testID = attributes.identifier;
        allergyID = testID.split('_')[3];  

        //check the attributes of the added item
        await expect(element(by.id(`${baseID}_${allergyID}_allergy_value`))).toHaveText('Soy');
        await expect(element(by.id(`${baseID}_${allergyID}_reaction_value`))).toHaveText('Vomiting');
        await expect(element(by.id(`${baseID}_${allergyID}_notes_value`))).toHaveText('SOME REMARKS');
        
    });   

    it('Allergy: Verify Allergy being added is not clickable', async () => {
                
        await element(by.id(`${baseID}_addAllergy`)).tap();
        await element(by.id(`${baseID}_modal_add_allergy_select`)).tap();


        const attributes = await element(by.id(`${baseID}_modal_add_allergy_select_Soy`)).getAttributes();
        console.log(attributes);
        
        // import jestExpect from 'expect';
        const jestExpect = require('expect').default;
        //alpha means the opacity value of the value.
        jestExpect(attributes.alpha).toBe(0.4);

        //in future, can reference
        // const multipleMatchedElements = await element(by.text('Multiple')).getAttributes();
        // jestExpect(multipleMatchedElements.elements.length).toBe(5);
        // jestExpect(multipleMatchedElements.elements[0].identifier).toBe('FirstElement');

        await element(by.text('Fish')).tap();
        await element(by.id(`${baseID}_modal_add_cancel_button`)).tap();

    }); 

    it('Allergy: Delete Allergy(Swipeable) and Cancel', async () => {
        // Check if the item is visible
        await expect(element(by.id(`${baseID}_${allergyID}`))).toBeVisible();
        
        // Swipe left to show delete option
        await element(by.id(`${baseID}_${allergyID}`)).swipe('left','slow')
        
        await expect(element(by.text('Are you sure you wish to delete this item?'))).toBeVisible();
        await expect(element(by.text('CANCEL'))).toBeVisible();
        await expect(element(by.text('OK'))).toBeVisible();
        await element(by.text('CANCEL')).tap();

        
    });

    it('Allergy: Delete Allergy(Button) and Delete', async () => {
        
        // Check if the item is visible
        await expect(element(by.id(`${baseID}_${allergyID}`))).toBeVisible();
        
        await element(by.id(`${baseID}_${allergyID}_delete`)).tap();

        await expect(element(by.text('Are you sure you wish to delete this item?'))).toBeVisible();
        await expect(element(by.text('CANCEL'))).toBeVisible();
        await expect(element(by.text('OK'))).toBeVisible();
        await element(by.text('OK')).tap();

        //Successfully deleted message appear next
        await expect(element(by.text('Successfully deleted allergy'))).toBeVisible();
        await expect(element(by.text('OK'))).toBeVisible();
        await element(by.text('OK')).tap();
        
    });

    it('Allergy: Updated number of Allergies after Deletion', async () => {
        
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