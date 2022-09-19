import React from 'react';
import { Box, Progress } from 'native-base';
import colors from 'app/config/colors';
import typography from 'app/config/typography';

function AddPatientProgress({ value }) {
  return (
    <Box marginTop={10}>
      <Progress
        _filledTrack={{
          bg: colors.green,
        }}
        value={value}
      />
    </Box>
  );
}

export default AddPatientProgress;
