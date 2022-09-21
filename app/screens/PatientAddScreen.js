import React, { useState } from 'react';
import { Box, Input, Icon, FormControl, Text } from 'native-base';

import { PatientAddPatientInfoScreen } from 'app/screens/PatientAddPatientInfoScreen';
import { PatientAddGuardianScreen } from 'app/screens/PatientAddGuardianScreen';
import { PatientAddAllergyScreen } from 'app/screens/PatientAddAllergyScreen';

export function PatientAddScreen(props) {
  const [qnNo, setQnNo] = useState(1); // sets qnNo = 0

  const nextQuestionHandler = () => {
    setQnNo(qnNo + 1);
  };

  const prevQuestionHandler = () => {
    setQnNo(qnNo - 1);
  };

  return (
    <Box>
      {qnNo === 1 ? (
        <PatientAddPatientInfoScreen
          key={1}
          nextQuestionHandler={nextQuestionHandler}
        />
      ) : (
        [
          qnNo === 2 ? (
            <PatientAddGuardianScreen
              key={2}
              nextQuestionHandler={nextQuestionHandler}
              prevQuestionHandler={prevQuestionHandler}
            />
          ) : qnNo === 3 ? (
            <PatientAddAllergyScreen
              key={3}
              nextQuestionHandler={nextQuestionHandler}
              prevQuestionHandler={prevQuestionHandler}
            />
          ) : (
            console.log('add more screens if needed')
          ),
        ]
      )}
    </Box>
  );
}

export default PatientAddScreen;
