import errors from 'app/config/errors';

describe('Prescription tests', () => {
    beforeAll(async () => {
      await device.launchApp();
    });  

    //will be using patient Detox to do automated testing.
    const patientID = 1019

    //just choose a prescription ID and change accordingly
    let prescriptionID = 8;

    //within the prescription page, will be easier to navigate
    const baseID = `prescription_screen_${patientID}`;

    //to be able to track and see the new prescription item
    const regexPattern = new RegExp(`${baseID}_(\\d+)`);
    let expectedItemCount = 1;

    //List of prescription items with corresponding ids in order from 1 to 14
    const prescriptions  = ['Acetaminophen', 'Diphenhydramine', 'Donepezil', 'Galantamine', 'Guaifenesin', 
                                'Ibuprofen', 'Memantine', 'Olanzapine', 'Paracetamol', 'Rivastigmine', 'Salbutamol',
                                'Antihistamines', 'Dextromethorphan', 'Antihistamines',]
    
    
    it('Prescription: View Prescription Screen', async () => {
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
        
        await expect(element(by.id(`prescription_${patientID}`))).toBeVisible();
        await element(by.id(`prescription_${patientID}`)).tap()

        await expect(element(by.id(baseID))).toBeVisible();

        //read in the flatlist
        await expect(element(by.id(`${baseID}_flatlist`))).toBeVisible()
        await expect(element(by.id(regexPattern)).atIndex(0)).toBeNotVisible();
        await expect(element(by.text('No prescriptions found'))).toExist();
        
    });
    
    // Can implement once api fixes the duplicate prescriptions as it throws error and match more than 1 view of the same prescription

    // it('Prescription: Add Prescription - Check All Prescriptions exist for selection', async () => {
        
    //     await element(by.id(`${baseID}_addPrescription`)).tap();
    //     await expect(element(by.id(`${baseID}_modal_add`))).toBeVisible();

    //     await element(by.id(`${baseID}_modal_add_prescription_select`)).tap();

    //     //check all the prescriptions exist as well
    //     for (let i = 0; i < prescriptions.length; i++) {
    //         await expect(element(by.text(prescriptions[i]))).toBeVisible();
    //     }

    //     //click any option and then exit the modal
    //     await element(by.text('Galantamine')).tap();

    // });

    it('Prescription: Add Prescription - Submit button disabled without input ', async () => {
        
        await element(by.id(`${baseID}_addPrescription`)).tap();
        await expect(element(by.id(`${baseID}_modal_add`))).toBeVisible();
        //check submit button is disabled
        const attributes = await element(by.id(`${baseID}_modal_add_submit_button`)).getAttributes();
        // console.log(attributes);
        // import jestExpect from 'expect';
        const jestExpect = require('expect').default;
        //alpha means the opacity value of the value.
        jestExpect(attributes.alpha).toBe(0.4);

        await element(by.id(`${baseID}_modal_add_cancel_button`)).tap();

    });

    it('Prescription: Add Prescription - Cancel', async () => {
        
        await element(by.id(`${baseID}_addPrescription`)).tap();
        await expect(element(by.id(`${baseID}_modal_add`))).toBeVisible();
        await element(by.id(`${baseID}_modal_add_cancel_button`)).tap();

    });
    

    it('Prescription: Add another prescription while doing error validation checks', async () => {
        
        await element(by.id(`${baseID}_addPrescription`)).tap();
        await expect(element(by.id(`${baseID}_modal_add`))).toBeVisible();

        //add prescription
        await element(by.id(`${baseID}_modal_add_prescription_select`)).tap();
        await element(by.text(prescriptions[prescriptionID - 1])).tap();

        //add dosage
        await element(by.id(`${baseID}_modal_add_dosage_input`)).tap();
        await element(by.id(`${baseID}_modal_add_dosage_input`)).tapReturnKey();
        await expect(element(by.text(errors.notEmptyError))).toExist();

        await element(by.id(`${baseID}_modal_add_dosage_input`)).tap();
        await element(by.id(`${baseID}_modal_add_dosage_input`)).typeText('1 lozenge');
        await element(by.id(`${baseID}_modal_add_dosage_input`)).tapReturnKey();
        await expect(element(by.text(errors.notEmptyError))).not.toExist();

        await element(by.id(`${baseID}_modal_add_meal_taken_radio_After Meal`)).tap();

        await element(by.id(`${baseID}_modal_add_frequency_input`)).tap();
        await element(by.id(`${baseID}_modal_add_frequency_input`)).tapReturnKey();
        await expect(element(by.text(errors.notEmptyError))).toExist();

        await element(by.id(`${baseID}_modal_add_frequency_input`)).tap();
        await element(by.id(`${baseID}_modal_add_frequency_input`)).typeText('99');
        await element(by.id(`${baseID}_modal_add_frequency_input`)).tapReturnKey();
        await expect(element(by.text(errors.frequencyPerDayError))).toExist();

        await element(by.id(`${baseID}_modal_add_frequency_input`)).tap();
        await element(by.id(`${baseID}_modal_add_frequency_input`)).replaceText('0');
        await element(by.id(`${baseID}_modal_add_frequency_input`)).tapReturnKey();
        await expect(element(by.text(errors.frequencyPerDayError))).toExist();

        await element(by.id(`${baseID}_modal_add_frequency_input`)).tap();
        await element(by.id(`${baseID}_modal_add_frequency_input`)).replaceText('3');
        await element(by.id(`${baseID}_modal_add_frequency_input`)).tapReturnKey();
        await expect(element(by.text(errors.frequencyPerDayError))).not.toExist();

        await element(by.id(`${baseID}_modal_add_period_radio_Long Term`)).tap();

        await element(by.id(`${baseID}_modal_add_instruction_input`)).tap();
        await element(by.id(`${baseID}_modal_add_instruction_input`)).tapReturnKey();
        await expect(element(by.text(errors.notEmptyError))).toExist();

        await element(by.id(`${baseID}_modal_add_instruction_input`)).tap();
        await element(by.id(`${baseID}_modal_add_instruction_input`)).typeText('Take 3 times, morning, afternoon and night.');
        await element(by.id(`${baseID}_modal_add_instruction_input`)).tapReturnKey();
        await expect(element(by.text(errors.notEmptyError))).not.toExist();

        await element(by.id(`${baseID}_modal_add_start_date`)).tap();
        const datePicker = element(by.type('android.widget.DatePicker')) 
        await datePicker.setDatePickerDate('2022/02/02', 'yyyy/MM/dd');
        await element(by.text('OK')).tap();

        await element(by.id(`${baseID}_modal_add_end_date`)).tap();
        await datePicker.setDatePickerDate('2027/07/07', 'yyyy/MM/dd');
        await element(by.text('OK')).tap();

        await element(by.id(`${baseID}_modal_add_remarks_input`)).tap();
        await element(by.id(`${baseID}_modal_add_remarks_input`)).tapReturnKey();
        await expect(element(by.text(errors.notEmptyError))).toExist();

        await element(by.id(`${baseID}_modal_add_remarks_input`)).tap();
        await element(by.id(`${baseID}_modal_add_remarks_input`)).typeText('Do occasional checks.');
        await element(by.id(`${baseID}_modal_add_remarks_input`)).tapReturnKey();
        await expect(element(by.text(errors.notEmptyError))).not.toExist();

        await element(by.id(`${baseID}_modal_add_submit_button`)).tap();
        //Successfully added message appear next
        await expect(element(by.text('Successfully added prescription'))).toBeVisible();
        await expect(element(by.text('OK'))).toBeVisible();
        await element(by.text('OK')).tap();
    }); 

    it('Prescription: Check Added Prescription', async () => {
    
        await expect(element(by.id(baseID))).toBeVisible();

        const addedItem = element(by.id(regexPattern)).atIndex(0);
        
        // Select the added item in the list (the newly added one)
        await expect(addedItem).toBeVisible;
        const attributes = await addedItem.getAttributes();
        const testID = attributes.identifier;
        prescriptionID = testID.split('_')[3];  

        //check the attributes of the added item
        await expect(element(by.id(`${baseID}_${prescriptionID}_prescription_value`))).toHaveText('Olanzapine');
        await expect(element(by.id(`${baseID}_${prescriptionID}_dosage_value`))).toHaveText('1 LOZENGE');
        await expect(element(by.id(`${baseID}_${prescriptionID}_frequency_value`))).toHaveText('3');
        await expect(element(by.id(`${baseID}_${prescriptionID}_instruction_value`))).toHaveText('TAKE 3 TIMES, MORNING, AFTERNOON AND NIGHT.');
        await expect(element(by.id(`${baseID}_${prescriptionID}_start_date_value`))).toHaveText('02-FEB-2022');
        await expect(element(by.id(`${baseID}_${prescriptionID}_end_date_value`))).toHaveText('07-JUL-2027');
        await expect(element(by.id(`${baseID}_${prescriptionID}_meal_value`))).toHaveText('Yes');
        await expect(element(by.id(`${baseID}_${prescriptionID}_remarks_value`))).toHaveText('DO OCCASIONAL CHECKS.');
        await expect(element(by.id(`${baseID}_${prescriptionID}_chronic_value`))).toHaveText('Yes');
    });

    it('Prescription: Updated number of Prescriptions after Adding', async () => {
        
        //read in the flatlist
        await expect(element(by.id(`${baseID}_flatlist`))).toBeVisible()

        for (let i = 0; i < expectedItemCount; i++) {
            await expect(element(by.id(regexPattern)).atIndex(i)).toBeVisible();
        }

        // Check for no additional items
        await expect(element(by.id(regexPattern)).atIndex(expectedItemCount)).toBeNotVisible();
        
    });

    it('Prescription: Edit Prescription(Swipeable) and Cancel', async () => {
        // Check if the item is visible
        await expect(element(by.id(`${baseID}_${prescriptionID}`))).toBeVisible();
        
        // Swipe right to show edit option
        await element(by.id(`${baseID}_${prescriptionID}`)).swipe('right','slow')
        
        await element(by.id(`${baseID}_modal_edit_cancel_button`)).tap();
    });

    it('Prescription: Edit Prescription(Button) and Submit', async () => {
        // Check if the item is visible
        await expect(element(by.id(`${baseID}_${prescriptionID}_touchable`))).toBeVisible();
        
        await element(by.id(`${baseID}_${prescriptionID}_edit`)).tap();

        await element(by.id(`${baseID}_modal_edit_prescription_select`)).tap();
        await element(by.text('Ibuprofen')).tap();

        await element(by.id(`${baseID}_modal_edit_dosage_input`)).tap();
        await element(by.id(`${baseID}_modal_edit_dosage_input`)).replaceText('2 tablets');
        await element(by.id(`${baseID}_modal_edit_dosage_input`)).tapReturnKey();

        await element(by.id(`${baseID}_modal_edit_meal_taken_radio_Before Meal`)).tap();

        await element(by.id(`${baseID}_modal_edit_frequency_input`)).tap();
        await element(by.id(`${baseID}_modal_edit_frequency_input`)).replaceText('2');
        await element(by.id(`${baseID}_modal_edit_frequency_input`)).tapReturnKey();

        await element(by.id(`${baseID}_modal_edit_period_radio_Short Term`)).tap();

        await element(by.id(`${baseID}_modal_edit_instruction_input`)).tap();
        await element(by.id(`${baseID}_modal_edit_instruction_input`)).replaceText('Take 2 tablets morning and night time.');
        await element(by.id(`${baseID}_modal_edit_instruction_input`)).tapReturnKey();

        await element(by.id(`${baseID}_modal_edit_start_date`)).tap();
        const datePicker = element(by.type('android.widget.DatePicker')) 
        await datePicker.setDatePickerDate('2023/10/02', 'yyyy/MM/dd');
        await element(by.text('OK')).tap();

        await element(by.id(`${baseID}_modal_edit_end_date`)).tap();
        await datePicker.setDatePickerDate('2025/08/02', 'yyyy/MM/dd');
        await element(by.text('OK')).tap();

        await element(by.id(`${baseID}_modal_edit_remarks_input`)).tap();
        await element(by.id(`${baseID}_modal_edit_remarks_input`)).replaceText('Check regularly.');
        await element(by.id(`${baseID}_modal_edit_remarks_input`)).tapReturnKey();

        await element(by.id(`${baseID}_modal_edit_submit_button`)).tap();

        //Successfully editted message appear next
        await expect(element(by.text('Successfully edited prescription'))).toBeVisible();
        await expect(element(by.text('OK'))).toBeVisible();
        await element(by.text('OK')).tap();
        
    });

    it('Prescription: Check Edited Prescription', async () => {
    
        await expect(element(by.id(baseID))).toBeVisible();

        const addedItem = element(by.id(regexPattern)).atIndex(0);
        
        // Select the added item in the list (the newly added one)
        await expect(addedItem).toBeVisible;
        const attributes = await addedItem.getAttributes();
        const testID = attributes.identifier;
        prescriptionID = testID.split('_')[3];  

        //check the attributes of the added item
        await expect(element(by.id(`${baseID}_${prescriptionID}_prescription_value`))).toHaveText('Ibuprofen');
        await expect(element(by.id(`${baseID}_${prescriptionID}_dosage_value`))).toHaveText('2 TABLETS');
        await expect(element(by.id(`${baseID}_${prescriptionID}_frequency_value`))).toHaveText('2');
        await expect(element(by.id(`${baseID}_${prescriptionID}_instruction_value`))).toHaveText('TAKE 2 TABLETS MORNING AND NIGHT TIME.');
        await expect(element(by.id(`${baseID}_${prescriptionID}_start_date_value`))).toHaveText('02-OCT-2023');
        await expect(element(by.id(`${baseID}_${prescriptionID}_end_date_value`))).toHaveText('02-AUG-2025');
        await expect(element(by.id(`${baseID}_${prescriptionID}_meal_value`))).toHaveText('No');
        await expect(element(by.id(`${baseID}_${prescriptionID}_remarks_value`))).toHaveText('CHECK REGULARLY.');
        await expect(element(by.id(`${baseID}_${prescriptionID}_chronic_value`))).toHaveText('No');
    });

    it('Prescription: Delete Prescription(Button) and Cancel', async () => {
        
        // Check if the item is visible
        await expect(element(by.id(`${baseID}_${prescriptionID}`))).toBeVisible();
        
        await element(by.id(`${baseID}_${prescriptionID}_delete`)).tap();

        await expect(element(by.text('Are you sure you wish to delete this item?'))).toBeVisible();
        await expect(element(by.text('CANCEL'))).toBeVisible();
        await expect(element(by.text('OK'))).toBeVisible();
        await element(by.text('CANCEL')).tap();
        
    });

    it('Prescription: Delete Prescription(Swipeable) and Delete', async () => {
        // Check if the item is visible
        await expect(element(by.id(`${baseID}_${prescriptionID}`))).toBeVisible();
        
        // Swipe left to show delete option
        await element(by.id(`${baseID}_${prescriptionID}`)).swipe('left','slow')

        await expect(element(by.text('Are you sure you wish to delete this item?'))).toBeVisible();
        await expect(element(by.text('CANCEL'))).toBeVisible();
        await expect(element(by.text('OK'))).toBeVisible();
        await element(by.text('OK')).tap();

        //Successfully deleted message appear next
        await expect(element(by.text('Successfully deleted prescription'))).toBeVisible();
        await expect(element(by.text('OK'))).toBeVisible();
        await element(by.text('OK')).tap();

    });

    it('Prescription: Updated number of Prescriptions after Deletion', async () => {
        
        expectedItemCount -= 1;

        //read in the flatlist and ensure there are no prescriptions inside that person
        await expect(element(by.id(`${baseID}_flatlist`))).toBeVisible()
        await expect(element(by.id(regexPattern)).atIndex(0)).toBeNotVisible();
        await expect(element(by.text('No prescriptions found'))).toExist();
        
    });  


})