import React, { useState } from 'react';
import { Box, Input, Icon, FormControl, Text } from 'native-base';

import { MaterialIcons } from '@expo/vector-icons';
import colors from 'app/config/colors';
import typography from 'app/config/typography';
import errors from 'app/config/errors';
import useApiHandler from 'app/hooks/useApiHandler';

import { PatientAddPatientInfoScreen } from 'app/screens/PatientAddPatientInfoScreen';
import { PatientAddGuardianScreen } from 'app/screens/PatientAddGuardianScreen';
import { PatientAddAllergyScreen } from 'app/screens/PatientAddAllergyScreen';

export function PatientAddScreen(props) {
  console.log(props);

  const [qnNo, setQnNo] = useState(1); // sets qnNo = 0

  const nextQuestionHandler = () => {
    console.log('Updating qnNo', qnNo);
    setQnNo(qnNo + 1);
  };

  const prevQuestionHandler = () => {
    console.log('Updating qnNo', qnNo);
    setQnNo(qnNo - 1);
  };
  return (
    <Box>
      {console.log(qnNo)}
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
