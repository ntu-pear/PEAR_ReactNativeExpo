// Lib
import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { VStack, HStack, Text, IconButton, Box, Divider } from 'native-base';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Hooks
import formatDateTime from 'app/hooks/useFormatDateTime.js';

// Config
import typography from 'app/config/typography';
import colors from 'app/config/colors';
import { maskIdentifier } from 'app/utility/identifierMask';

// Components
import AppButton from 'app/components/AppButton';

function InformationCard({
  displayData,
  title,
  subtitle,
  handleOnPress = null,
  unMaskedNRIC = null,
  buttonTitle = null,
}) {
  const [revealedFor, setRevealedFor] = useState(null);
  const masked =
    revealedFor?.rows !== displayData || revealedFor?.nric !== unMaskedNRIC;

  const itemizedData = (displayData || []).map((item) =>
    item.label === 'NRIC'
      ? {
          ...item,
          value: masked
            ? maskIdentifier(item.value)
            : unMaskedNRIC || maskIdentifier(item.value),
        }
      : item,
  );
  const handleUnmaskNRIC = () => {
    if (unMaskedNRIC) {
      setRevealedFor(masked ? { rows: displayData, nric: unMaskedNRIC } : null);
    }
  };

  return (
    <Box
      bg={colors.white}
      borderRadius={16}
      shadow={2}
      p={Platform.OS === 'web' ? 6 : 5}
      mb={4}
      style={styles.cardContainer}
    >
      {/* Title and Edit button */}
      <HStack
        alignItems="center"
        justifyContent="space-between"
        mb={subtitle ? 3 : 4}
        px={1}
        style={{ flexGrow: 1, flexShrink: 1 }}
      >
        {title && (
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text
              numberOfLines={2}
              ellipsizeMode="tail"
              adjustsFontSizeToFit
              minimumFontScale={0.9}
              style={styles.titleText}
            >
              {title}
            </Text>
          </View>
        )}
        {handleOnPress && !subtitle && (
          <AppButton
            title={buttonTitle || 'EDIT'}
            onPress={handleOnPress}
            color="green"
          />
        )}
      </HStack>

      {subtitle && (
        <HStack alignItems="center" justifyContent="space-between" mb={4}>
          <Text style={styles.subtitleText}>{subtitle}</Text>
          {handleOnPress && (
            <AppButton
              title={buttonTitle || 'EDIT'}
              onPress={handleOnPress}
              color="green"
            />
          )}
        </HStack>
      )}

      {/* Data rows */}
      {itemizedData && itemizedData.length > 0 ? (
        itemizedData.map((data, index) => (
          <View key={index}>
            <HStack
              justifyContent="space-between"
              alignItems="center"
              py={2}
              flexWrap="nowrap"
            >
              {/* Label */}
              <Text
                numberOfLines={undefined}
                ellipsizeMode="tail"
                style={styles.fieldLabel}
              >
                {data?.label ?? '-'}
              </Text>

              {/* Value + Eye icon */}
              <HStack alignItems="center" flex={1} minWidth={0}>
                <Text
                  numberOfLines={undefined}
                  ellipsizeMode="tail"
                  style={styles.fieldValue}
                >
                  {data === undefined
                    ? '-'
                    : data.value === 1 || data.value === true
                    ? 'Yes'
                    : data.value === 0
                    ? 'No'
                    : !data.value || data.value === 'null'
                    ? '-'
                    : ['DOB', 'Start Date', 'End Date', 'Date'].includes(
                        data.label,
                      )
                    ? formatDateTime(data.value, true)
                    : data.value}
                </Text>

                {data.label === 'NRIC' && (
                  <IconButton
                    accessibilityLabel={masked ? 'Reveal NRIC' : 'Hide NRIC'}
                    _icon={{
                      as: MaterialCommunityIcons,
                      name: masked ? 'eye-outline' : 'eye',
                    }}
                    onPress={handleUnmaskNRIC}
                    isDisabled={!unMaskedNRIC}
                    style={styles.nricToggle}
                    p={2}
                    ml={1}
                  />
                )}
              </HStack>
            </HStack>
            {index < itemizedData.length - 1 && (
              <Divider my={1.5} bg={colors.grey_lighter} />
            )}
          </View>
        ))
      ) : (
        <Text color={colors.grey}>Not available</Text>
      )}
    </Box>
  );
}

InformationCard.defaultProps = {
  title: null,
  subtitle: null,
};

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
  },
  titleText: {
    ...typography.heading1,
    fontWeight: 'bold',
    color: colors.black,
    flexShrink: 1,
  },
  subtitleText: {
    ...typography.subheading1,
    fontWeight: 'bold',
    color: colors.black,
  },
  fieldLabel: {
    ...typography.subheading1,
    textTransform: 'uppercase',
    color: colors.grey_dark,
    flexBasis: '45%',
  },
  nricToggle: {
    minWidth: 48,
    minHeight: 48,
    flexShrink: 0,
  },
  fieldValue: {
    ...typography.subheading1SemiBold,
    color: colors.black,
    textAlign: 'right',
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
  },
});

export default InformationCard;
