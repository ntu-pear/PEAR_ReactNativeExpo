import React from 'react';
import { act, create } from 'react-test-renderer';
import Form from 'app/components/ActivityManagementForm';
jest.mock('app/utility/miscFunctions', () => ({
  convertTimeMilitary: jest.fn(),
}));
jest.mock(
  'app/components/input-components/SelectionInputField',
  () => (props) => require('react').createElement('MockSelection', props),
);
test('availability selection uses centre_activity_id despite empty activity_id', () => {
  let tree;
  act(() => {
    tree = create(
      <Form
        kind="availability"
        draft={{ activity_id: '', centre_activity_id: '11' }}
        data={{
          activities: [{ id: 1, title: 'Art' }],
          centres: [{ id: 11, activity_id: 1 }],
        }}
        onChange={() => {}}
        disabled={false}
      />,
    );
  });
  expect(tree.root.findByType('MockSelection').props.value).toBe('11');
  act(() => tree.unmount());
});
