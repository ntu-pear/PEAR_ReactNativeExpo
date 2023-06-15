import React, { StyleSheet, View } from 'react-native';
import { HStack, Text } from 'native-base';
import SelectionInputField from 'app/components/SelectionInputField';

const listOfSorts = [
  { label: 'None', value: '' },
  { label: 'Sender Name', value: 'senderName' },
  { label: 'Date', value: 'createdDateTime' },
  { label: 'Notification Type', value: 'type' },
  { label: 'Status', value: 'status' },
];

function NotificationSortSelector(props) {
  const { sortBy, setSortBy } = props;
  return (
    <HStack w="40%" marginTop={3}>
      <View style={styles.sortingContainer}>
        {/* Standardize use of drop down selectors --- Justin
        <FormControl.Label key="sortByLabel">{'Sort By: '}</FormControl.Label>
        <Select
          onValueChange={setSortBy}
          placeholder="(Optional) Choose a value to sort by"
          selectedValue={sortBy}
          minWidth="30%"
        >
          {sortByParams.map(([label, value]) => (
            <Select.Item label={label} key={label} value={value} />
          ))}
        </Select> */}
        <Text style={styles.sortText}> {'Sort By: '}</Text>
        <SelectionInputField
          placeholderText={'Sort By'}
          onDataChange={setSortBy}
          value={sortBy}
          dataArray={listOfSorts}
        />
      </View>
    </HStack>
  );
}

const styles = StyleSheet.create({
  sortingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortText: {
    fontSize: 15,
    marginTop: 5,
  },
});

export default NotificationSortSelector;
