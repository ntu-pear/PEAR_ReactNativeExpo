// Libs
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
} from 'react-native';
import { VStack, Actionsheet, useDisclose } from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';

// Configurations
import typography from 'app/config/typography';
import colors from 'app/config/colors';

// Components
import ErrorMessage from 'app/components/ErrorMessage';
import RequiredIndicator from '../RequiredIndicator';

function SelectionInputField({
  testID = '',
  isRequired = false,
  hideError = true,
  showTitle = true,
  title = '',
  placeholder = '',
  onDataChange = () => {},
  value = '',
  dataArray = [],
  onEndEditing = () => {},
  isDisabledItems = {},
  selectBoxStyle = {},
  displayTextStyle = {},
  arrowIconColor = colors.grey,
}) {
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [error, setError] = useState({ isError: false, errorMsg: '' });
  const [selectedValue, setSelectedValue] = useState(value ? value : null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState(dataArray);

  const { isOpen, onOpen, onClose } = useDisclose(); // Controls dropdown visibility

  useEffect(() => {
    onEndEditing ? onEndEditing(isFirstRender || error.isError) : null;
    setIsFirstRender(false);
    setError({
      ...error,
      isError: isRequired && value === 0,
    });
  }, []);

  useEffect(() => {
    if (isDisabledItems.length > 0) {
      if (isDisabledItems[value] === true) {
        setSelectedValue(
          Object.keys(isDisabledItems).find(
            (key) => isDisabledItems[key] === true,
          ) || null,
        );
      }
    }
  }, [isDisabledItems]);

  useEffect(() => {
    if (!isFirstRender) {
      onEndEditing ? onEndEditing(error.isError) : null;
    }
  }, [error, onEndEditing]);

  // Keep internal selected value in sync with prop changes (e.g. edit-mode prefills)
  useEffect(() => {
    setSelectedValue(value ? value : null);
  }, [value]);

  // Filter data based on search input
  useEffect(() => {
    setFilteredData(
      dataArray.filter((item) =>
        (item.label ?? '').toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    );
  }, [searchQuery, dataArray]);

  // Clear search query every time the selection input is opened
  const handleOpen = () => {
    setSearchQuery('');
    onOpen();
  };

  const handleValueChanged = (selected) => {
    setSelectedValue(selected);
    onDataChange(selected);
    onClose(); // Close dropdown after selection
  };

  return (
    <View testID={testID} style={styles.componentContainer}>
      <VStack>
        {showTitle && (
          <Text style={styles.titleMsg}>
            {title}:{isRequired ? <RequiredIndicator /> : ''}
          </Text>
        )}

        {/* Selection Box (Triggers the dropdown) */}
        <TouchableOpacity
          onPress={handleOpen}
          style={[styles.selectBox, selectBoxStyle]}
        >
          <Text
            style={[
              selectedValue ? styles.selectedText : styles.placeholderText,
              displayTextStyle,
            ]}
          >
            {selectedValue
              ? dataArray.find((item) => String(item.value) === String(selectedValue))?.label
              : placeholder}
          </Text>
          <MaterialIcons
            name="arrow-drop-down"
            size={24}
            color={arrowIconColor}
          />
        </TouchableOpacity>

        {/* Actionsheet (Dropdown) */}
        <Actionsheet isOpen={isOpen} onClose={onClose}>
          <Actionsheet.Content>
            <KeyboardAvoidingView
              behavior="padding"
              keyboardVerticalOffset={70}
              style={{ width: '100%' }}
            >
              {dataArray.length > 15 && (
                <TextInput
                  testID={`${testID}_search`}
                  style={styles.searchBar}
                  placeholder="Search..."
                  placeholderTextColor={colors.grey}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              )}

              <FlatList
                data={filteredData}
                keyExtractor={(item) => String(item.value)}
                style={{ width: '100%' }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.item,
                      selectedValue === item.value && styles.selectedItem,
                    ]}
                    onPress={() => handleValueChanged(item.value)}
                    disabled={isDisabledItems[item.value]}
                  >
                    <Text
                      style={[
                        styles.itemText,
                        selectedValue === item.value && styles.selectedText,
                        // No override here—list items use default styles
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </KeyboardAvoidingView>
          </Actionsheet.Content>
        </Actionsheet>

        {hideError && !error.errorMsg ? null : (
          <ErrorMessage testID={testID} message={error.errorMsg} />
        )}
      </VStack>
    </View>
  );
}

SelectionInputField.defaultProps = {
  isRequired: false,
};

const styles = {
  componentContainer: {
    display: 'flex',
    width: '100%',
    marginTop: 5,
    justifyContent: 'flex-start',
  },
  titleMsg: {
    marginBottom: 5,
    marginTop: 10,
    color: colors.grey,
    ...typography.body1SemiBold,
  },
  selectBox: {
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.grey_lighter,
  },
  placeholderText: {
    color: colors.grey,
    fontSize: 16,
  },
  selectedText: {
    color: colors.black,
    ...typography.subheading1,
  },
  searchBar: {
    height: 45,
    width: '95%',
    backgroundColor: colors.grey_lightest,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    marginLeft: 20,
    ...typography.subheading1,
    color: colors.black,
    borderWidth: 1,
    borderColor: colors.grey_lighter,
  },
  item: {
    width: '100%',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey_lighter,
    alignItems: 'center',
  },
  itemText: {
    ...typography.subheading1,
    color: colors.black,
    textAlign: 'center',
    width: '100%',
  },
  selectedItem: {
    backgroundColor: colors.grey_lightest,
  },
};

export default SelectionInputField;
