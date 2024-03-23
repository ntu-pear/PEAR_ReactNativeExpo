// Libs
import React from 'react';
import { SearchBar as Search} from 'react-native-elements';
import { Keyboard } from 'react-native';

// Configurations
import colors from 'app/config/colors';
import { View } from 'native-base';
import SelectionInputField from './SelectionInputField';

function SearchBar({
  testID='',
  placeholder="Search",
  SEARCH_OPTIONS={},
  searchOption=null,
  value = null,
  onChangeText = () => {},
  containerStyle = null,
  inputContainerStyle = null,
  style = null,
  autoCapitalize='none',
  handleOnToggleSearchOptions=()=>{}
}) {
    
  if(Object.keys(SEARCH_OPTIONS).length > 0) {
    return (
      <>
        <View style={styles.searchBar} testID={testID}>
          <SearchBar
            testID={`${testID}_input`} 
            onChangeText={onChangeText}
            value={value}
            autoCapitalize='characters'
            inputContainerStyle={{borderTopRightRadius: 0, borderBottomRightRadius: 0, height: 47}}
            placeholder={placeholder}
          />
        </View>
        {SEARCH_OPTIONS.length > 1 ? (
          <View style={{flex: 0.4, zIndex: 1}}>
            <SelectionInputField
              testID={`${testID}_searchOptions`}
              dataArray={SEARCH_OPTIONS}
              showTitle={false}
              otherProps={{
                backgroundColor: colors.green,
                color: colors.white,
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                borderTopRightRadius: 10, 
                borderBottomRightRadius: 10,
              }}
              value={searchOption}
              onDataChange={handleOnToggleSearchOptions}                        
            />
          </View>
        ) : null}
      </>
    )

  } else {
    return (
      <Search
        testID={`${testID}_input`}
        placeholder={placeholder}
        onChangeText={onChangeText}
        onClear={Keyboard.dismiss}
        value={value}
        lightTheme={true}
        containerStyle={[styles.containerStyle, containerStyle]}
        inputContainerStyle={[styles.inputContainerStyle, inputContainerStyle]}
        inputStyle={styles.inputStyle}
        style={style}
        autoCapitalize={autoCapitalize}
      />
    )
  }
}

const styles = {
  searchBar: {
    flex: 1,    
    marginTop: 5
  },
  containerStyle: {
    flex: 1, 
    padding: 0,
    backgroundColor: 'transparent',
    borderBottomColor: 'transparent',
    borderTopColor: 'transparent',
  },
  inputContainerStyle: {
    backgroundColor: colors.white,
    borderRadius: 10,
  },
  inputStyle: { 
    fontSize: 16,
  }
}

export default SearchBar;
