import React from 'react';
import { Platform } from 'react-native';
import { Stack, Text, FormControl, TextArea } from 'native-base';
import colors from 'app/config/colors';
import typography from 'app/config/typography';

function PersonalDoctorCard(props) {
  // const {date, doctorId, doctorName, doctorRemarks, patientId} = props.doctorNote[0];
  const { doctorNote } = props;

  return (
    <Stack space={2}>
      <Text
        color={colors.black_var1}
        fontFamily={Platform.OS === 'ios' ? 'Helvetica' : typography.android}
        fontSize="2xl"
        fontWeight="semibold"
      >
        Doctor's Notes
      </Text>
      <FormControl>
        <Stack space={0} alignItems="flex-start" flexWrap="wrap">
          <FormControl.Label
            width="100%"
            _text={{
              fontFamily: `${
                Platform.OS === 'ios' ? 'Helvetica' : typography.android
              }`,
              fontSize: 'lg',
              fontWeight: 'thin',
            }}
          >
            Medical Notes
          </FormControl.Label>
          <TextArea
            color={colors.black_var1}
            fontFamily={
              Platform.OS === 'ios' ? 'Helvetica' : typography.android
            }
            fontSize="lg"
            isReadOnly
            input="lg"
            ml="-2.5"
            minH="30%"
            maxH="50%"
            variant="unstyled"
            value={
              doctorNote && doctorNote[0] && doctorNote[0].doctorRemarks
                ? doctorNote[0].doctorRemarks
                : 'Not available'
            }
            w="100%"
          />
        </Stack>
      </FormControl>
    </Stack>
  );
}

export default PersonalDoctorCard;
