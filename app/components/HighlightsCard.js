import React from 'react';
import { StyleSheet, Platform, TouchableOpacity, View } from 'react-native';
import { Text, Box, VStack, HStack, Avatar } from 'native-base';
import colors from 'app/config/colors';
import typography from 'app/config/typography';

function HighlightsCard({ item }) {
  const list = () => {
    return item.highlights.map((element) => {
      return (
        <View key={element.highlightID}>
          <Text fontSize="12">{element.highlightDescription}</Text>
        </View>
      );
    });
  };

  return (
    <TouchableOpacity>
      <Box
        w="100%"
        borderWidth="1"
        borderColor={colors.primary_gray}
        rounded="lg"
        p="2"
        mt="3"
      >
        <HStack w="100%" space={2} flexWrap="wrap" mb="1">
          <VStack w="28%" space={2} alignItems="center">
            <Avatar size="sm" bg={colors.pink} marginY="auto">
              {' '}
            </Avatar>
            <Text
              bold
              color={colors.black_var1}
              fontFamily={
                Platform.OS === 'ios' ? 'Helvetica' : typography.android
              }
            >
              {item.patientName}
            </Text>
          </VStack>
          <VStack w="68%" space={2}>
            {list()}
          </VStack>
        </HStack>
      </Box>
    </TouchableOpacity>
  );
}

// const styles = StyleSheet.create({
// });

export default HighlightsCard;
