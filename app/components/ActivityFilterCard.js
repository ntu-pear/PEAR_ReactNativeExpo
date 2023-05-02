import React, { useEffect, useRef, useState } from 'react';
import { Modal, Text, View, Row, Center } from 'native-base';
import { Button } from 'native-base';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform, StyleSheet } from 'react-native';
import colors from 'app/config/colors';
import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown';

import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import TextField from '@mui/material/TextField';

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
  getDefaultStartTime,
  getDefaultEndTime,
}) => {
  const initialRef = React.useRef(null);
  const finalRef = React.useRef(null);
  const [loading, setLoading] = useState(false);
  const [selectedStartTimeTemp, setSelectedStartTimeTemp] =
    useState(getDefaultStartTime);
  const [selectedEndTimeTemp, setSelectedEndTimeTemp] =
    useState(getDefaultEndTime);
  const [selectedActivityTemp, setSelectedActivityTemp] = useState(null);
  const searchRef = useRef(null);
  const [startTimePicker, setStartTimePicker] = useState(Platform.OS === 'ios');
  const [endTimePicker, setEndTimePicker] = useState(Platform.OS === 'ios');

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
    setSelectedStartTimeTemp(value);
    if (Platform.OS === 'android') {
      setStartTimePicker(false);
    }
  };

  const onChangeEndTime = (event, value) => {
    setSelectedEndTimeTemp(value);
    if (Platform.OS === 'android') {
      setEndTimePicker(false);
    }
  };

  const showStartTimePicker = () => {
    setStartTimePicker(true);
  };

  const showEndTimePicker = () => {
    setEndTimePicker(true);
  };

  const handleApply = () => {
    setModalVisible(false);
    updateFilteredActivityData();
    setSelectedStartTime(selectedStartTimeTemp);
    setSelectedEndTime(selectedEndTimeTemp);
    setSelectedActivity(selectedActivityTemp);
  };

  const handleReset = () => {
    setSelectedStartTimeTemp(getDefaultStartTime);
    setSelectedEndTimeTemp(getDefaultEndTime);
    setSelectedActivityTemp(null);
    searchRef.current.clear();
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
      style={
        Platform.OS == 'web' ? { marginTop: '20%', flexDirection: 'row' } : {}
      }
    >
      <Modal.Content
        style={
          Platform.OS == 'web'
            ? {
                alignSelf: 'flex-start',
              }
            : {}
        }
        height={
          Platform.OS === 'web'
            ? '400px'
            : Platform.OS === 'ios'
            ? '45%'
            : '30%'
        }
        backgroundColor={colors.white_var1}
      >
        <Modal.Body>
          <View style={styles.activityNameViewStyle} zIndex={6}>
            <Text style={styles.textStyle}>Activity Name</Text>
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
                  setSelectedActivityTemp(null);
                }}
                textInputProps={{
                  placeholder: 'Enter Activity Name',
                  autoCorrect: false,
                  autoCapitalize: 'none',
                  style:
                    Platform.OS === 'web'
                      ? {
                          width: 450,
                          fontSize: 18,
                          marginLeft: 15,
                        }
                      : {},
                }}
                suggestionsListContainerStyle={
                  Platform.OS === 'web'
                    ? {
                        backgroundColor: colors.light,
                        width: 400,
                        marginLeft: 25,
                        fontSize: 18,
                      }
                    : {}
                }
                suggestionsListMaxHeight={150}
              />
            </View>
          </View>
          <View style={styles.activityTimeViewStyle} zIndex={4}>
            <Text style={styles.textStyle}>Activity Time</Text>
            <Row style={styles.rowStyle}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                {Platform.OS === 'web' && (
                  <View m="2" px="2" w="40%">
                    <TimePicker
                      ampm={false}
                      label="Start Time"
                      TrapFocusProps={{ disableEnforceFocus: true }}
                      value={selectedStartTimeTemp}
                      onChange={(newValue) => {
                        setSelectedStartTimeTemp(newValue);
                      }}
                      renderInput={(params) => <TextField {...params} />}
                    />
                  </View>
                )}
                {startTimePicker && (
                  <View style={styles.dateTimePickerViewStyle}>
                    <DateTimePicker
                      value={selectedStartTimeTemp}
                      display={'default'}
                      mode={'time'}
                      is24Hour={true}
                      onChange={onChangeStartTime}
                      style={styles.dateTimePickerStyle}
                    />
                  </View>
                )}
                {!startTimePicker && Platform.OS === 'android' && (
                  <Button
                    backgroundColor={colors.white_var1}
                    borderColor={colors.light_gray}
                    flex={1}
                    onPress={showStartTimePicker}
                  >
                    <Text fontSize={20}>
                      {selectedStartTimeTemp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </Button>
                )}
                <Center
                  width={'20%'}
                  alignSelf={'center'}
                  justifyContent={'center'}
                  _text={{
                    fontSize: '20px',
                  }}
                  flex={1}
                >
                  to
                </Center>
                {Platform.OS === 'web' && (
                  <View m="2" px="2" w="40%">
                    <TimePicker
                      ampm={false}
                      label="End Time"
                      TrapFocusProps={{ disableEnforceFocus: true }}
                      value={selectedEndTimeTemp}
                      onChange={(newValue) => {
                        setSelectedEndTimeTemp(newValue);
                      }}
                      renderInput={(params) => <TextField {...params} />}
                    />
                  </View>
                )}
                {endTimePicker && (
                  <View style={styles.dateTimePickerViewStyle}>
                    <DateTimePicker
                      value={selectedEndTimeTemp}
                      display={'default'}
                      mode={'time'}
                      is24Hour={true}
                      onChange={onChangeEndTime}
                      style={styles.dateTimePickerStyle}
                    />
                  </View>
                )}
                {!endTimePicker && Platform.OS === 'android' && (
                  <Button
                    backgroundColor={colors.white_var1}
                    borderColor={colors.light_gray}
                    flex={1}
                    onPress={showEndTimePicker}
                  >
                    <Text fontSize={20}>
                      {selectedEndTimeTemp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </Button>
                )}
              </LocalizationProvider>
            </Row>
          </View>
          <View style={styles.resetViewStyle}>
            <Text
              onPress={() => {
                handleReset();
              }}
              textDecorationLine={'underline'}
              color={colors.black}
            >
              Reset
            </Text>
          </View>
        </Modal.Body>
        <Modal.Footer backgroundColor={colors.white}>
          <Button.Group space={2}>
            <Button
              variant="ghost"
              colorScheme="blueGray"
              onPress={() => {
                setModalVisible(false);
                handleReset();
              }}
            >
              Cancel
            </Button>
            <Button
              backgroundColor={colors.green}
              onPress={() => {
                handleApply();
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
  activityNameViewStyle: {
    flex: 2,
    padding: 5,
    paddingBottom: 30,
  },
  activityTimeViewStyle: {
    flex: 2,
    padding: 5,
    paddingBottom: 30,
  },
  resetViewStyle: {
    flex: 1,
    alignItems: 'center',
  },
  vStackStyle: {
    flexDirection: 'column',
  },
  dateTimePickerViewStyle: {
    flex: 1,
    width: '50%',
  },
  dateTimePickerStyle: {
    padding: Platform.OS === 'ios' ? 30 : 60,
    width: '100%',
    height: '30%',
    fontSize: 20,
  },
  textStyle: {
    fontSize: 20,
    padding: 5,
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
