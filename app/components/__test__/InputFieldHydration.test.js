import React from 'react';
import { act, create } from 'react-test-renderer';
import InputField from 'app/components/input-components/InputField';
jest.mock('native-base', () => ({ VStack: 'VStack', Input: 'Input' }));
jest.mock('app/components/ErrorMessage', () => 'ErrorMessage');
jest.mock('app/components/RequiredIndicator', () => 'RequiredIndicator');
test('an asynchronously loaded value appears without focus and unrelated renders preserve the local draft', () => {
  let tree;
  const onChangeText = jest.fn();
  act(() => {
    tree = create(<InputField value="" onChangeText={onChangeText} />);
  });
  act(() => {
    tree.update(
      <InputField value="Loaded remarks" onChangeText={onChangeText} />,
    );
  });
  expect(tree.root.findByType('Input').props.value).toBe('Loaded remarks');
  act(() => tree.root.findByType('Input').props.onChangeText('Local draft'));
  act(() => {
    tree.update(
      <InputField
        title="Remarks"
        value="Loaded remarks"
        onChangeText={onChangeText}
      />,
    );
  });
  expect(tree.root.findByType('Input').props.value).toBe('Local draft');
  expect(onChangeText).toHaveBeenLastCalledWith('Local draft');
  act(() => tree.unmount());
});
