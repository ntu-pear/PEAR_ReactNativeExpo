import React from 'react';
import { Box, Icon, Text, HStack, VStack } from 'native-base';
import colors from 'app/config/colors';
import { TouchableOpacity, Platform, StyleSheet } from 'react-native';
// import { background } from 'native-base/lib/typescript/theme/styled-system';

function AccountCard(props) {
  const { vectorIconComponent, text, navigation, routes } = props;

  const handleOnPressToNextScreen = () => {
    if (Platform.OS === 'web') {
      navigation('/' + routes);
    } else {
      navigation.push(routes);
    }
  };

  return (
    <TouchableOpacity onPress={handleOnPressToNextScreen}>
      <VStack style={styles.VStackOuter}>
        <Box style={styles.CardBoxContainer}>
          <VStack style={styles.VStackInner}>
            <HStack style={styles.HStackWrapper}>
              <Icon
                as={{ ...vectorIconComponent }}
                top="3"
                left="2"
                color={colors.black_var1}
                size="50"
              />
              <Text style={styles.TextContent}>{text}</Text>
            </HStack>
          </VStack>
        </Box>
      </VStack>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  CardBoxContainer: {
    borderRadius: 10,
    borderWidth: Platform.OS === 'web' ? null : 1,
    borderColor: colors.primary_gray,
    minWidth: '100%',
    minHeight: Platform.OS === 'web' ? null : 20,
  },
  VStackOuter: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 5,
  },
  VStackInner: {
    width: '100%',
    space: 4,
    flexWrap: 'wrap',
    marginBottom: 25,
  },
  TextContent: {
    alignSelf: 'flex-start',
    fontSize: 19,
    marginTop: Platform.OS === 'web' ? 2 : 28,
    marginLeft: 19,
    color: colors.black_var1,
  },
  HStackWrapper: {
    space: 5,
    alignItems: 'center',
  },
});

export default AccountCard;
