import React, { useEffect, useRef, useState } from 'react';
import { Modal, VStack, Text, View, Row, Center } from 'native-base';
import { Button } from 'native-base';
import DateTimePicker from '@react-native-community/datetimepicker';
import { StyleSheet } from 'react-native';
import colors from 'app/config/colors';
import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown';

const ActivityFilterCard = ({
  modalVisible,
  setModalVisible,
  selectedStartTime,
  setSelectedStartTime,
  selectedEndTime,
  setSelectedEndTime,
  updateFilteredActivityData,
  activityList,
  setSelectedActivity,
  activityFilterList,
  setActivityFilterList,
}) => {
  const initialRef = React.useRef(null);
  const finalRef = React.useRef(null);
  const [loading, setLoading] = useState(false);
  const [selectedActivityTemp, setSelectedActivityTemp] = useState(null);
  const searchRef = useRef(null);

  const onOpenSuggestionsList = () => {
    const list = [];
    activityList.forEach((item, i) => {
      list.push({
        id: i.toString(),
        title: item,
      });
    });
    setActivityFilterList(list);
  };

  const findActivityInActivityList = (query) => {
    if (query) {
      setLoading(true);
      // const filterList = [];
      let search = query.toLowerCase();
      const suggestions = activityList
        .filter((item) => item.toLowerCase().includes(search))
        .map((item, i) => ({
          id: i.toString(),
          title: item,
        }));
      setActivityFilterList(suggestions);
      setLoading(false);
    } else {
      setActivityFilterList(null);
    }
  };

  const onChangeActivityName = (value) => {
    setSelectedActivityTemp(value);
  };
  const onChangeStartTime = (event, value) => {
    setSelectedStartTime(value);
  };

  const onChangeEndTime = (event, value) => {
    setSelectedEndTime(value);
  };

  useEffect(() => {
    setSelectedStartTime(selectedStartTime);
    setSelectedEndTime(selectedEndTime);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStartTime, selectedEndTime]);

  return (
    <Modal
      size={'lg'}
      animationPreset={'slide'}
      isOpen={modalVisible}
      onClose={() => setModalVisible(false)}
      initialFocusRef={initialRef}
      finalFocusRef={finalRef}
    >
      <Modal.Content height={'2/5'}>
        <Modal.Body>
          <VStack style={styles.vStackStyle}>
            <View style={styles.viewStyle} zIndex={6}>
              <Text>Activity Name</Text>
              <View>
                <AutocompleteDropdown
                  ref={searchRef}
                  closeOnBlur={true}
                  closeOnSubmit={false}
                  dataSet={activityFilterList}
                  onSelectItem={onChangeActivityName}
                  onChangeText={findActivityInActivityList}
                  inputHeight={50}
                  onOpenSuggestionsList={onOpenSuggestionsList}
                  loading={loading}
                  onClear={() => {
                    setActivityFilterList(null);
                  }}
                  textInputProps={{
                    placeholder: 'Enter Activity Name',
                    autoCorrect: false,
                    autoCapitalize: 'none',
                  }}
                  suggestionsListMaxHeight={150}
                />
              </View>
            </View>
            <View zIndex={4}>
              <Text>Activity Time</Text>
              <Row style={styles.rowStyle}>
                <View style={styles.dateTimePickerViewStyle}>
                  <DateTimePicker
                    value={selectedStartTime}
                    mode={'time'}
                    is24Hour={true}
                    onChange={onChangeStartTime}
                    style={styles.dateTimePickerStyle}
                  />
                </View>
                <Center
                  width={'20%'}
                  alignSelf={'center'}
                  justifyContent={'center'}
                  _text={{
                    fontSize: '25px',
                  }}
                >
                  to
                </Center>
                <View style={styles.dateTimePickerViewStyle}>
                  <DateTimePicker
                    value={selectedEndTime}
                    mode={'time'}
                    is24Hour={true}
                    onChange={onChangeEndTime}
                    style={styles.dateTimePickerStyle}
                  />
                </View>
              </Row>
            </View>
          </VStack>
        </Modal.Body>
        <Modal.Footer>
          <Button.Group space={2}>
            <Button
              variant="ghost"
              colorScheme="blueGray"
              onPress={() => {
                setModalVisible(false);
              }}
            >
              Cancel
            </Button>
            <Button
              backgroundColor={colors.green}
              onPress={() => {
                setModalVisible(false);
                updateFilteredActivityData();
                setSelectedActivity(selectedActivityTemp);
                searchRef.current.clear();
              }}
            >
              Apply
            </Button>
          </Button.Group>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
};

const styles = StyleSheet.create({
  rowStyle: {
    flex: 1,
    alignSelf: 'flex-start',
    alignContent: 'space-between',
  },
  viewStyle: {
    flex: 1,
    padding: 5,
    paddingBottom: 30,
  },
  vStackStyle: {
    flex: 1,
  },
  dateTimePickerViewStyle: {
    flex: 1,
    width: '50%',
  },
  dateTimePickerStyle: {
    padding: 30,
    width: '100%',
    height: '30%',
  },
  textStyle: {
    fontSize: 20,
    alignSelf: 'center',
    width: '100%',
  },
  autocompleteContainer: {
    backgroundColor: '#ffffff',
    borderWidth: 0,
    width: '100%',
    alignSelf: 'center',
  },
  itemText: {
    fontSize: 20,
    paddingTop: 5,
    paddingBottom: 5,
    margin: 2,
  },
});

export default ActivityFilterCard;
