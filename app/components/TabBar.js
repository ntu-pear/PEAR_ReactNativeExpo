// Libs
import { Text, TouchableOpacity } from 'react-native';
import { StyleSheet, View } from 'react-native';

// Configurations
import colors from 'app/config/colors';
import typography from 'app/config/typography';

function TabBar({
  TABS={},
  curTab='',
  setCurTab=()=>{},  
  handleSwitchTab=()=>{}
}) {  
  // Switch between tabs
  const handleOnToggleViewMode = (mode) => {
    setCurTab(mode);    
    handleSwitchTab(mode);
  }

  return (
    <View style={styles.optionsContainer}>
      {Object.keys(TABS).map(mode => (
        <TouchableOpacity 
          key={mode}
          style={[styles.tab, ...curTab==TABS[mode] ? [styles.selectedTab] : []]}
          onPress={() => handleOnToggleViewMode(TABS[mode])}
          activeOpacity={curTab==TABS[mode] ? 1 : 0.5}
          >
            <Text style={[styles.tabText, ...curTab==TABS[mode] ? [styles.selectedTabText] : []]}>{mode}</Text>
        </TouchableOpacity>

      ))}            
    </View>
  );
}

const styles = StyleSheet.create({
  optionsContainer: {
    flexDirection: 'row',
    paddingVertical: '1%',
    paddingHorizontal: '2%',
    alignSelf: 'flex-start',
    flexWrap: 'wrap'
  },
  tab: {
    padding: '1.5%',
    flex: 0.5,
  },
  tabText: {
    fontSize: 20,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? typography.ios : typography.android,
  },
  selectedTab: {
    borderBottomColor: colors.green,
    borderBottomWidth: 3,
  },
  selectedTabText: {
    fontWeight: 'bold',
    color: colors.green,
  }
});

export default TabBar;
