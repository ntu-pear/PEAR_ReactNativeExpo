import React, { useState } from 'react';
import { Box, Input, Icon, FormControl, Text } from 'native-base';

import { MaterialIcons } from '@expo/vector-icons';
import colors from '../config/colors';
import typography from '../config/typography';
import errors from '../config/errors';
import useApiHandler from '../hooks/useApiHandler';

import { PatientAddFirstScreen } from './PatientAddFirstScreen';
import { PatientAddSecondScreen } from './PatientAddSecondScreen';
import { PatientAddThirdScreen } from './PatientAddThirdScreen';

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
        <PatientAddFirstScreen
          key={1}
          nextQuestionHandler={nextQuestionHandler}
        />
      ) : (
        [
          qnNo === 2 ? (
            <PatientAddSecondScreen
              key={2}
              nextQuestionHandler={nextQuestionHandler}
              prevQuestionHandler={prevQuestionHandler}
            />
          ) : qnNo === 3 ? (
            <PatientAddThirdScreen
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
