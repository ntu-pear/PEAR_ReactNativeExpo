describe('Add Patients Tests', () => {
    const baseID = 'addPatients_patient';
  
    beforeAll(async () => {
      await device.launchApp();
    });
  
    const testData = {
      validData: {
        FirstName: 'detox test',
        LastName: 'test',
        PreferredName: 'detox',
        NRIC: 'S3717548Z',
        Address: 'test address',
        PostalCode: '123456',
        TempAddress: 'test address',
        TempPostalCode: '123456',
        HomeNo: '62626262',
        HandphoneNo: '82828282',
      },
      invalidDataCharacters: {
        FirstName: '1detox test',
        LastName: '1test',
        PreferredName: '1detox',
        NRIC: '1S3717548',
        PostalCode: 'a12346',
        TempPostalCode: 'a12346',
        HomeNo: 'a2626262',
        HandphoneNo: 'a2828282',
      },
      invalidDataCharacters2: {
        FirstName: ']detox test',
        LastName: ']test',
        PreferredName: ']detox',
        NRIC: '#S3717548',
        PostalCode: '#12346',
        TempPostalCode: '#12346',
        HomeNo: '#2626262',
        HandphoneNo: '#2828282',
      },
      invalidDataFormat: {
        NRIC: 'S3717548Y',
        HomeNo: '72626262',
        HandphoneNo: '72828282',
      },
      invalidDataLength: {
        NRIC: 'SS371Z',
        PostalCode: '23456',
        TempPostalCode: '23456',
        HomeNo: '626262',
        HandphoneNo: '828282',
      },
    };
  
    const isButtonDisabled = async (id) => {
      await expect(
        element(
          by.traits(['button', 'disabled']).and(
          by.id(id))
      )).toExist();
    };
  
    const isButtonEnabled = async (id) => {
      await expect(
        element(
          by.traits(['button']).and(
          by.id(id))
      )).toExist();
    };
  
    const reopenForm = async () => {
      await device.pressBack();
      await expect(element(by.id('addPatients'))).toBeVisible();
      await element(by.id('addPatients')).tap();
    };
  
    it('Add Patients: open form', async () => {
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
      await element(by.id('login')).tap(); // Correcting from longPress to tap
  
      // On dashboard
      await expect(element(by.text('Patients Daily Highlights'))).toBeVisible();
      await expect(element(by.id('highlightsCloseButton'))).toBeVisible();
  
      await element(by.id('highlightsCloseButton')).tap();
      await expect(element(by.text('My Patients'))).toBeVisible();
  
      // Click patients tab
      await element(by.id('Patients_Tab')).tap();
      await expect(element(by.id('patients'))).toBeVisible();
      await expect(element(by.id('addPatients'))).toBeVisible();
      await element(by.id('addPatients')).tap();
    });
  
    it('Add Patients: patient info - valid data', async () => {
      // Verify the title is visible
      await expect(element(by.id(`${baseID}_title`))).toBeVisible();
    
      for (const [key, value] of Object.entries(testData.validData)) {
        const fieldId = `${baseID}_${key}_input`;
        
        // Tap on the input field to focus
        await element(by.id(fieldId)).tap();
        
        // Type the text into the input field
        await element(by.id(fieldId)).typeText(value);
        
        // Dismiss the keyboard
        await device.pressBack();
        
        // Check if error message is not visible
        await expect(element(by.id(`${fieldId}_error`))).not.toBeVisible();
        
        // Scroll down to ensure next input is visible if needed
        await element(by.id(baseID)).scroll(150, 'down');
      }
    
      // Perform actions after filling the form
      await isButtonDisabled(`${baseID}_bottomBtns_prev`);
      await isButtonEnabled(`${baseID}_bottomBtns_next`);
    });
    
    // not implemented yet, will do this after covering this aspect.
    // it('Add Patients: patient info - erase input', async () => {
    //   await element(by.id(baseID)).scrollTo('top');
  
    //   let previousField = `${baseID}_LastName_input`;
  
    //   for (const [key, value] of Object.entries(testData.validData)) {
    //     const fieldId = `${baseID}_${key}_input`;
    //     await element(by.id(fieldId)).tap();
    //     await element(by.id(fieldId)).replaceText('');
    //     await element(by.id(previousField)).tap();
  
    //     if (!['HomeNo', 'HandphoneNo', 'TempPostalCode', 'TempAddress'].includes(key)) {
    //       await waitFor(element(by.id(`${fieldId}_error`)))
    //         .toHaveText('is required')
    //         .withTimeout(5000);
    //     }
  
    //     previousField = fieldId;
    //     await element(by.id(baseID)).scroll(100, 'down');
    //   }
  
    //   await element(by.id(baseID)).scrollTo('bottom');
    //   await element(by.id(`${baseID}_bottomBtns_prev`)).tap();
  
    //   await isButtonDisabled(`${baseID}_bottomBtns_next`);
    //   await isButtonDisabled(`${baseID}_bottomBtns_prev`);
    // });
  
    it('Add Patients: patient info - no first name', async () => {
      await reopenForm();
      await expect(element(by.id(`${baseID}_title`))).toBeVisible();
  
      for (const [key, value] of Object.entries(testData.validData)) {
        if (key === 'FirstName') continue;
  
        let fieldId = `${baseID}_${key}`;
        await element(by.id(`${fieldId}_input`)).tap();
  
        if (key in testData.invalidDataCharacters) {
          await element(by.id(`${fieldId}_input`)).typeText(testData.invalidDataCharacters[key]);
          //currently need to click okay then have the error appeared, may need to improve real-time validation
          await element(by.id(`${fieldId}_input`)).tapReturnKey();
          await waitFor(element(by.id(`${fieldId}_error`))).toBeVisible();
        } else {
          await element(by.id(`${fieldId}_input`)).typeText(value);
          await expect(element(by.id(`${fieldId}_error`))).not.toBeVisible();
        }
  
        await element(by.id(baseID)).scroll(150, 'down');
      }
  
      await isButtonDisabled(`${baseID}_bottomBtns_next`);
      await isButtonDisabled(`${baseID}_bottomBtns_prev`);
    });
  });
  