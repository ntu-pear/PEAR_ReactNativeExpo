import React from 'react';
import { act, create } from 'react-test-renderer';
import PatientAddGuardianScreen from 'app/screens/PatientAddGuardianScreen';
let mockButtons;
jest.mock('native-base', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    View,
    Center: View,
    SectionList: ({ sections, renderItem, ListFooterComponent }) => (
      <View>
        {sections[0].data.map((item, index) => (
          <View key={index}>{renderItem({ item, index })}</View>
        ))}
        <ListFooterComponent />
      </View>
    ),
  };
});
jest.mock('app/components/AddPatientGuardian', () => () => null);
jest.mock('app/components/AddPatientProgress', () => () => null);
jest.mock('app/components/AddPatientBottomButtons', () => (props) => {
  mockButtons = props;
  return null;
});
test('repeated add actions cannot create a third guardian even before React commits', () => {
  const primary = { marker: 'Primary' };
  const concat = jest.fn();
  const remove = jest.fn();
  let screen;
  act(() => {
    screen = create(
      <PatientAddGuardianScreen
        componentList={{ guardian: [primary] }}
        concatFormData={concat}
        removeFormData={remove}
      />,
    );
  });
  const add = mockButtons.addComponent;
  act(() => {
    add();
    add();
    add();
  });
  expect(concat).toHaveBeenCalledTimes(1);
  expect(mockButtons.list).toHaveLength(2);
  act(() => mockButtons.removeComponent());
  expect(remove).toHaveBeenCalledTimes(1);
  expect(mockButtons.list[0]).toBe(primary);
  act(() => mockButtons.addComponent());
  expect(concat).toHaveBeenCalledTimes(2);
  expect(mockButtons.list).toHaveLength(2);
  act(() => screen.unmount());
});
