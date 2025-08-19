describe('Add Patients Tests', () => {
    const baseID = 'addPatients_patient';
    const baseID2 = 'addPatients_guardian';
    const baseID3 = 'addPatients_allergy';
  
    beforeAll(async () => {
      await device.launchApp();
    });

    //preferred languages with ids in order from 1 to 13
    const languages  = ['Cantonese', 'English', 'Hainanese', 'Hakka', 'Hindi', 'Hokkien', 'Malay', 'Mandarin', 
                          'Tamil', 'Teochew', 'Japanese', 'Spanish', 'Korean']
    
    //relationshipIDs with ids in order from 1 to 12
    const relationships = ['Husband','Wife', 'Child', 'Parent', 'Sibling', 'Grandchild', 'Friend', 
                            'Nephew', 'Niece', 'Aunt' , 'Uncle', 'Grandparent']

    //allergies with ids in order from 1 to 11
    const allergies = ['Corn', 'Eggs', 'Fish', 'Meat', 'Milk', 'Peanuts', 'Tree nuts', 'Shellfish', 'Soy', 'Wheat', 'Seafood',]
    //reactions with ids in order from 1 to 11
    const reactions = ['Rashes', 'Sneezing', 'Vomiting', 'Nausea', 'Swelling', 'Difficulty Breathing', 'Diarrhea',
                      'Abdominal cramp or pain', 'Nasal Congestion', 'Itching', 'Hives', ]

    const regexPattern = new RegExp(`patientprofile_(\\d+)`);
    //will need to tentatively delete patientID and guardianID everytime to test this e2e testing unless mock the adding
  
    const testData = {
      validData: {
        FirstName: 'test',
        LastName: 'user',
        PreferredName: 'testuser',
        PreferredLanguageListID: 4,
        NRIC: 'S7811691I',
        DOB: '1978/08/07',
        Gender: 'Female',
        Address: 'test address',
        PostalCode: '123456',
        TempAddress: 'test address',
        TempPostalCode: '123456',
        HomeNo: '62626262',
        HandphoneNo: '82828282',
        IsRespiteCare: 'Yes',
        StartDate: '2024/10/10',
      },
      invalidDataCharacters: {
        FirstName: '1detox test',
        LastName: '1test',
        PreferredName: '1detox',
        PreferredLanguageListID: 0,
        NRIC: 'S7811691A',
        DOB: '2222/22/22',
        Gender: 'NA',
        Address: '123 Test St,',
        PostalCode: 'a12346',
        TempAddress: '$123 Test St',
        TempPostalCode: 'a12346',
        HomeNo: '72626262',
        HandphoneNo: '72828282',
        IsRespiteCare: 'NIL',
        StartDate: '1919/19/19',
      },
      invalidDataLength: {
        NRIC: 'S7811691',
        PostalCode: '23456',
        TempPostalCode: '23456',
        HomeNo: '6262626',
        HandphoneNo: '8282828',
      },
    };

    const testData2 = {
      validData: {
        FirstName: 'second',
        LastName: 'detoxuser',
        NRIC: 'S6371964A',
        DOB: '1963/04/06',
        Gender: 'Female',
        Address: 'test address',
        PostalCode: '123456',
        TempAddress: 'test address',
        TempPostalCode: '123456',
        ContactNo: '82828282',
        PreferredName: 'seconddetoxuser',
        RelationshipID: 5,
      },
      invalidDataCharacters: {
        FirstName: '2detox test',
        LastName: '2test',
        NRIC: 'S7811691A',
        DOB: '3333/33/33',
        Gender: 'NA',
        Address: 'TestHall @123',
        PostalCode: 'b98765',
        TempAddress: '123 ? Test St',
        TempPostalCode: 'b98765',
        ContactNo: '72828282',
        PreferredName: '2detox',
        RelationshipID: 13,
      },
      invalidDataLength: {
        NRIC: 'S7811691',
        PostalCode: '98765',
        TempPostalCode: '98765',
        ContactNo: '8383838',
      },
    };

    const allergyData = {
      validData: {
        AllergyListID: 3,
        ReactionListID: 2,
        AllergyRemarks: 'Some remarks has been inputed',
      }
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
      await element(by.id('login')).tap(); 
  
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
    
    it('Add Patients: patient info - erase input', async () => {
      await element(by.id(baseID)).scrollTo('top');
  
      for (const [key, value] of Object.entries(testData.validData)) {
        const fieldId = `${baseID}_${key}`;

        if (key === 'PreferredLanguageListID' || key === 'DOB' || key === 'Gender' || key === 'IsRespiteCare' || key === 'StartDate') {
          
        } else {
          await element(by.id(`${fieldId}_input`)).tap();
          await element(by.id(`${fieldId}_input`)).clearText();
          await element(by.id(`${fieldId}_input`)).tapReturnKey();

          if(key === 'TempAddress' || key === 'TempPostalCode' || key === 'HomeNo' || key === 'HandphoneNo') {
            await expect(element(by.id(`${fieldId}_input_error`))).not.toBeVisible();
          }  else {
            await expect(element(by.id(`${fieldId}_input_error`))).toBeVisible();
          }
        }
  
        await element(by.id(baseID)).scroll(80, 'down');
      }
  
      await isButtonDisabled(`${baseID}_bottomBtns_next`);
    });
  
    it('Add Patients: patient info - test invalid data', async () => {
     await element(by.id(baseID)).scrollTo('top');
      await expect(element(by.id(`${baseID}_title`))).toBeVisible();
  
      for (const [key, value] of Object.entries(testData.validData)) {
  
        const fieldId = `${baseID}_${key}`;

        if (key === 'PreferredLanguageListID' || key === 'DOB' || key === 'Gender' || key === 'IsRespiteCare' || key === 'StartDate') {
          
        } else {
        
        await element(by.id(`${fieldId}_input`)).tap();
  
        if (key in testData.invalidDataCharacters) {
          await element(by.id(`${fieldId}_input`)).typeText(testData.invalidDataCharacters[key]);
          //currently need to click okay then have the error appeared, may need to improve real-time validation
          await element(by.id(`${fieldId}_input`)).tapReturnKey();
          await expect(element(by.id(`${fieldId}_input_error`))).toBeVisible();
        } else {
          await element(by.id(`${fieldId}_input`)).typeText(value);
          await expect(element(by.id(`${fieldId}_input_error`))).not.toBeVisible();
        }

      }
  
        await element(by.id(baseID)).scroll(80, 'down');
      }
  
      await isButtonDisabled(`${baseID}_bottomBtns_next`);
    });

    it('Add Patients: patient info - test invalid data length', async () => {
     await element(by.id(baseID)).scrollTo('top');
    await expect(element(by.id(`${baseID}_title`))).toBeVisible();
  
      for (const [key, value] of Object.entries(testData.validData)) {
  
        const fieldId = `${baseID}_${key}`;

        if (key === 'PreferredLanguageListID' || key === 'DOB' || key === 'Gender' || key === 'IsRespiteCare' || key === 'StartDate') {
          
        } else {
        
        await element(by.id(`${fieldId}_input`)).tap();
  
        if (key in testData.invalidDataLength) {
          await element(by.id(`${fieldId}_input`)).typeText(testData.invalidDataLength[key]);
          //currently need to click okay then have the error appeared, may need to improve real-time validation
          await element(by.id(`${fieldId}_input`)).tapReturnKey();
          await expect(element(by.id(`${fieldId}_input_error`))).toBeVisible();
        } else {
          //skip these fields
        }

      }
  
        await element(by.id(baseID)).scroll(80, 'down');
      }
  
      await isButtonDisabled(`${baseID}_bottomBtns_next`);
    });

    it('Add Patients: patient info - valid data', async () => {
      //start at the top of the form
      await element(by.id(baseID)).scrollTo('top');
      
      // Verify the title is visible
      await expect(element(by.id(`${baseID}_title`))).toBeVisible();
    
      for (const [key, value] of Object.entries(testData.validData)) {
        const fieldId = `${baseID}_${key}`;
        
        switch(key) {
          case 'DOB' :
          case 'StartDate': 
            await element(by.id(`${fieldId}`)).tap();
            const datePicker = element(by.type('android.widget.DatePicker')) 
            await datePicker.setDatePickerDate(value, 'yyyy/MM/dd');
            await element(by.text('OK')).tap();
            break;

          case 'Gender':
          case 'IsRespiteCare': 
            await element(by.id(`${fieldId}_${value}`)).tap();
            break;

          case 'PreferredLanguageListID':
            await element(by.id(`${fieldId}_input`)).tap();
            await element(by.text(languages[value - 1])).tap();  
            break;

          default:
          // Tap on the input field to focus
            await element(by.id(`${fieldId}_input`)).tap();
          // Replace the text into the input field
            await element(by.id(`${fieldId}_input`)).replaceText(value);
          // Dismiss the keyboard
            await element(by.id(`${fieldId}_input`)).tapReturnKey();

            if (key === "NRIC") {
              await element(by.id(`${fieldId}_mask`)).tap();
            }
          // Check if error message is not visible
            await expect(element(by.id(`${fieldId}_error`))).not.toBeVisible();
            break;
          
        }
        
        // Scroll down to ensure next input is visible if needed
        await element(by.id(baseID)).scroll(80, 'down');
      }
    
      // Perform actions after filling the form
      await isButtonEnabled(`${baseID}_bottomBtns_next`);
    });

    it('Add Patients: navigate between add patient and guardian information', async () => {
  
      // click next page to go to Patient Guardian
      await element(by.id(`${baseID}_bottomBtns_next`)).tap();

      //ensure able to go back to the previous page
      await expect(element(by.id(baseID2))).toBeVisible();
      await element(by.id(baseID2)).scrollTo('bottom');
      await isButtonEnabled(`${baseID2}_bottomBtns_prev`);
      await isButtonDisabled(`${baseID2}_bottomBtns_next`);

      //click back to the previous page
      await element(by.id(`${baseID2}_bottomBtns_prev`)).tap();

      //TODO: check all information tallies with the information being previously inputed

      //go back to add guardian information
      await element(by.id(baseID)).scrollTo('bottom');
      await isButtonEnabled(`${baseID}_bottomBtns_next`);
      // click next page to go to Patient Guardian
      await element(by.id(`${baseID}_bottomBtns_next`)).tap();

    });

    it('Add Patients: guardian info - erase input', async () => {
  
      for (const [key, value] of Object.entries(testData2.validData)) {
        const fieldId = `${baseID2}_${key}`;

        if (key === 'RelationshipID' || key === 'DOB' || key === 'Gender' ) {
          
        } else {
          await element(by.id(`${fieldId}_input`)).tap();
          await element(by.id(`${fieldId}_input`)).clearText();
          await element(by.id(`${fieldId}_input`)).tapReturnKey();

          if(key === 'TempAddress' || key === 'TempPostalCode') {
            await expect(element(by.id(`${fieldId}_input_error`))).not.toBeVisible();
          }  else {
            await expect(element(by.id(`${fieldId}_input_error`))).toBeVisible();
          }
        }
  
        await element(by.id(baseID2)).scroll(80, 'down');
      }

      await isButtonEnabled(`${baseID2}_bottomBtns_prev`);
      await isButtonDisabled(`${baseID2}_bottomBtns_next`);
    });

    it('Add Patients: guardian info - test invalid data', async () => {
      
      await element(by.id(baseID2)).scrollTo('top');
      
      await expect(element(by.id(`${baseID2}_title`))).toBeVisible();
  
      for (const [key, value] of Object.entries(testData2.validData)) {
  
        const fieldId = `${baseID2}_${key}`;

        if (key === 'DOB' || key === 'Gender' || key === 'RelationshipID' ) {
          
        } else {
        
        await element(by.id(`${fieldId}_input`)).tap();
  
        if (key in testData2.invalidDataCharacters) {
          await element(by.id(`${fieldId}_input`)).typeText(testData2.invalidDataCharacters[key]);
          
          await element(by.id(`${fieldId}_input`)).tapReturnKey();
          await expect(element(by.id(`${fieldId}_input_error`))).toBeVisible();
        } else {
          await element(by.id(`${fieldId}_input`)).typeText(value);
          await expect(element(by.id(`${fieldId}_input_error`))).not.toBeVisible();
        }

      }
  
        await element(by.id(baseID2)).scroll(80, 'down');
      }
  
      await isButtonDisabled(`${baseID2}_bottomBtns_next`);
    });

    it('Add Patients: guardian info - test invalid data length', async () => {
      
      await element(by.id(baseID2)).scrollTo('top');
      
      await expect(element(by.id(`${baseID2}_title`))).toBeVisible();
  
      for (const [key, value] of Object.entries(testData2.validData)) {
  
        const fieldId = `${baseID2}_${key}`;

        if (key === 'DOB' || key === 'Gender' || key === 'RelationshipID') {
          //do not need to check
        } else {
        
        await element(by.id(`${fieldId}_input`)).tap();
  
        if (key in testData2.invalidDataLength) {
          await element(by.id(`${fieldId}_input`)).typeText(testData2.invalidDataLength[key]);
          
          await element(by.id(`${fieldId}_input`)).tapReturnKey();
          await expect(element(by.id(`${fieldId}_input_error`))).toBeVisible();
        } else {
          //skip these fields
        }

      }
  
        await element(by.id(baseID2)).scroll(80, 'down');
      }
  
      await isButtonDisabled(`${baseID2}_bottomBtns_next`);
    });

    it('Add Patients: guardian info - valid data', async () => {
      //start at the top of the form
      await element(by.id(baseID2)).scrollTo('top');
      
      // Verify the title is visible
      await expect(element(by.id(`${baseID2}_title`))).toBeVisible();
      
      for (const [key, value] of Object.entries(testData2.validData)) {
        const fieldId = `${baseID2}_${key}`;
        
        switch(key) {
          case 'DOB' :
            await element(by.id(`${fieldId}`)).tap();
            const datePicker = element(by.type('android.widget.DatePicker')) 
            await datePicker.setDatePickerDate(value, 'yyyy/MM/dd');
            await element(by.text('OK')).tap();
            break;

          case 'Gender': 
            await element(by.id(`${fieldId}_${value}`)).tap();
            break;

          case 'RelationshipID':
            await element(by.id(`${fieldId}_input`)).tap();
            await element(by.text(relationships[value - 1])).tap();  
            break;

          default:
          // Tap on the input field to focus
            await element(by.id(`${fieldId}_input`)).tap();
          // Replace the text into the input field
            await element(by.id(`${fieldId}_input`)).replaceText(value);
          // Dismiss the keyboard
            await element(by.id(`${fieldId}_input`)).tapReturnKey();

            if (key === "NRIC") {
              await element(by.id(`${fieldId}_mask`)).tap();
            }
          // Check if error message is not visible
            await expect(element(by.id(`${fieldId}_error`))).not.toBeVisible();
            break;
          
        }
        
        // Scroll down to ensure next input is visible if needed
        await element(by.id(baseID2)).scroll(80, 'down');
      }
    
      // Perform actions after filling the form
      await isButtonEnabled(`${baseID2}_bottomBtns_next`);
    });

    it('Add Patients: navigate between add guardian and allergy information', async () => {
  
      // click next page to go to Patient Allergy
      await element(by.id(`${baseID2}_bottomBtns_next`)).tap();

      //ensure able to go back to the previous page
      await expect(element(by.id(baseID3))).toBeVisible();
      await element(by.id(baseID3)).scrollTo('bottom');
      await isButtonEnabled(`${baseID3}_bottomBtns_prev`);

      //click back to the previous page
      await element(by.id(`${baseID3}_bottomBtns_prev`)).tap();

      //TODO: check all information tallies with the information being previously inputed

      //go back to add allergy information
      await element(by.id(baseID2)).scrollTo('bottom');
      await isButtonEnabled(`${baseID2}_bottomBtns_next`);
      // click next page to go to Patient Allergy
      await element(by.id(`${baseID2}_bottomBtns_next`)).tap();

    });

    it('Add Patients: allergy info - valid data', async () => {
      
      // Verify the title is visible
      await expect(element(by.id(`${baseID3}_title`))).toBeVisible();
      
      for (const [key, value] of Object.entries(allergyData.validData)) {
        const fieldId = `${baseID3}_${key}`;
        
        switch(key) {
          case 'AllergyListID':
            await element(by.id(`${fieldId}_input`)).tap();
            await element(by.text(allergies[value - 1])).tap();  
            break;

          case 'ReactionListID':
            await element(by.id(`${fieldId}_input`)).tap();
            await element(by.text(reactions[value - 1])).tap();  
            break;

          default:
          // Tap on the input field to focus
            await element(by.id(`${fieldId}_input`)).tap();
          // Replace the text into the input field
            await element(by.id(`${fieldId}_input`)).replaceText(value);
          // Dismiss the keyboard
            await element(by.id(`${fieldId}_input`)).tapReturnKey();
          // Check if error message is not visible
            await expect(element(by.id(`${fieldId}_error`))).not.toBeVisible();
            break;
          
        }
        
      }
    
      // Perform actions after filling the form
      await isButtonEnabled(`${baseID3}_bottomBtns_submit`);
    });
  
    it('Add Patients: Confirmation of adding patient', async () => {
    
      // Perform actions after filling the form
      await isButtonEnabled(`${baseID3}_bottomBtns_submit`);
      // click next page to go to Patient Allergy
      await element(by.id(`${baseID3}_bottomBtns_submit`)).tap();
      // confirmation message of adding patient

      //Ensure final display message is correct
      await expect(element(by.text('Successfully added Patient'))).toBeVisible();

      await expect(element(by.text('OK'))).toBeVisible();
      await element(by.text('OK')).tap();

    });

    it('Add Patients: Verify patient added under My Patients', async () => {
      
      //read in the flatlist
      await expect(element(by.id('patients_flatlist'))).toBeVisible()

      //go into the patient profile to verify if it is correct.
      await element(by.text(/TESTUSER.*/i)).tap();

    });

    //TODO in future: start date must be +/- 30 days of current date, not sure can dynamically change the date based on the device instead of manually changing here

    
    

  });
  