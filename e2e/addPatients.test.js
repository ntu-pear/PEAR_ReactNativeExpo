describe('AddPatients tests', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  const testData = {
    validData: {
      FirstName: 'detox test',
      LastName: 'test',
      NRIC: 'S3717548Z',
      Address: 'test address',
      PostalCode: '123456',
      TempAddress: 'test address',
      TempPostalCode: '123456',
      HomeNo: '62626262',
      HandphoneNo: '82828282',
      PreferredName: 'detox',
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
    }
  };

  const disabledPrev = async () => {
    await expect(
      element(
        by.traits(['button', 'disabled']).and(
        by.id(`${baseID}_bottomBtns_prev`))
    )).toExist();
  }

  const disabledNext = async () => {
    await expect(
      element(
        by.traits(['button', 'disabled']).and(
        by.id(`${baseID}_bottomBtns_next`))
    )).toExist();
  }

  const enabledPrev = async () => {
    await expect(
      element(
        by.traits(['button']).and(
        by.id(`${baseID}_bottomBtns_prev`))
    )).toExist();
  }

  const enabledNext = async () => {
    await expect(
      element(
        by.traits(['button']).and(
        by.id(`${baseID}_bottomBtns_next`))
    )).toExist();
  }

  const reopenForm = async () => {
    await device.pressBack();
    await expect(element(by.id('addPatients'))).toBeVisible();
    await element(by.id('addPatients')).tap();    
  }
  
  const baseID = 'addPatients_patient';
  
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
    await expect(element(by.id('addPatients'))).toBeVisible();
    await element(by.id('addPatients')).tap();
  });
  
  // it('Add Patients: patient info - valid data ', async () => {
  //   await expect(element(by.id(`${baseID}_title`))).toBeVisible();
    
  //   for(var item in testData.validData) {
  //     console.log(`${baseID}_${item}_input`)
  //     await element(by.id(`${baseID}_${item}_input`)).tap();
  //     await element(by.id(`${baseID}_${item}_input`)).typeText(testData.validData[item]);
      
  //     await expect(element(by.id(`${baseID}_${item}_input_error`))).not.toBeVisible();
  //     await element(by.id(baseID)).scroll(100, 'down');
  //   }
  //   await device.pressBack();    
  //   await disabledPrev();
  //   await enabledNext();
  // }); 

  it('Add Patients: patient info - erase input', async () => {
    await element(by.id(baseID)).scrollTo('top');

    let previous = `${baseID}_LastName_input`;
    for(var item in testData.validData) {
      console.log(`${baseID}_${item}_input`)
      await element(by.id(`${baseID}_${item}_input`)).tap();
      await element(by.id(`${baseID}_${item}_input`)).replaceText('');
      await element(by.id(previous)).tap();
      if(item != 'HomeNo' && item != 'HandphoneNo' && item != 'TempPostalCode' && item != 'TempAddress' && previous != null) {
        await waitFor(element(by.id(`${baseID}_${item}_error`))).toHaveText('is required');        
      }
      await element(by.id(baseID)).scroll(100, 'down');
    }

    await element(by.id(baseID)).scrollTo('bottom');
    await element(by.id(`${baseID}_bottomBtns_prev`)).tap();    
    
    await disabledNext();
    await disabledPrev();    
  });
    
  
  // it('Add Patients: patient info - leave blank and click out', async () => {
  //   await reopenForm();
  //   await expect(element(by.id(`${baseID}_title`))).toBeVisible();
  //   let previous = `${baseID}_LastName_input`;
  //   for(var item in testDataID) {
  //     if(testDataID[item].type == 'input') {
  //       await element(by.id(`${baseID}_${item}_input`)).tap();
  //       await element(by.id(previous)).tap();
  //       previous = `${baseID}_${item}_input`;
  //       if(item != 'HomeNo' && item != 'HandphoneNo' && item != 'TempPostalCode' && item != 'TempAddress' && previous != null) {
  //         await waitFor(element(by.id(`${previous}_error`))).toHaveText('is required');        
  //       }
  //     }
  //     await element(by.id(baseID)).scroll(100, 'down');
  //   }
  //   await element(by.id(baseID)).scrollTo('bottom');    
  //   await element(by.id(`${baseID}_bottomBtns_prev`)).tap();   
    
  //   await disabledNext();
  //   await disabledPrev();
  // }); 

  // it('Add Patients: patient info - no/invalid first name ', async () => {
  //   await reopenForm();
  //   await expect(element(by.id(`${baseID}_title`))).toBeVisible();
    
  //   const field = `${baseID}_FirstName_input`;
    
  //   for(var item in testDataID) {
  //     console.log(`${baseID}_${item}_input`)
  //     if(item == 'FirstName') continue
  //     await element(by.id(`${baseID}_${item}_input`)).tap();
  //     if(testDataID[item].type == 'input') {
  //       await element(by.id(`${baseID}_${item}_input`)).typeText(testData.validData[item]);
  //     } else if(testDataID[item].type == 'select') {
  //       await element(by.text(testDataID[item]['suffix'])).tap();
  //     } else if(testDataID[item].type == 'input') {
  //       await element(by.id(`${baseID}_${item}_input`)).tap();
  //     } 
  //     await expect(element(by.id(`${baseID}_${item}_input_error`))).not.toBeVisible();
  //     await element(by.id(baseID)).scroll(100, 'down');
  //   }   
    
  //   await disabledNext();
  //   await disabledPrev();
    

  //   await waitFor(element(by.text(field))).toBeVisible().whileElement(by.id(scrollView)).scroll(300, 'up');
  //   await element(by.id(field)).tap();
  //   await element(by.id(field)).typeText(testData.invalidDataCharacters[item]);
  //   await waitFor(element(by.id(`${field}_error`))).toHaveText(
  //     'cannot contain numbers or symbols',
  //     );        
  //   }   
  //   await disabledNext();
  //   await disabledPrev();


  // });
})