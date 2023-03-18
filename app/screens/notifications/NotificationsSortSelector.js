import { FormControl, HStack, Select } from 'native-base';

const sortByParams = [
  ['None', ''],
  ['Sender name', 'senderName'],
  ['Date', 'createdDateTime'],
  ['Notification Type', 'type'],
  ['Status', 'status'],
];
function NotificationSortSelector(props) {
  const { sortBy, setSortBy } = props;
  return (
    <HStack w="100%" marginTop={3}>
      <>
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
        </Select>
      </>
    </HStack>
  );
}

export default NotificationSortSelector;
