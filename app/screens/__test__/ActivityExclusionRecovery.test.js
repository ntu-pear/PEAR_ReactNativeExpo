import React from 'react';
import { act, create } from 'react-test-renderer';
import AddActivityExclusionModal from 'app/components/AddActivityExclusionModal';
import activity from 'app/api/activity';
jest.mock(
  'app/components/AddEditModal',
  () => (props) =>
    require('react').createElement('MockModal', props, props.modalContent),
);
jest.mock('native-base', () => ({
  ScrollView: (props) =>
    require('react').createElement('MockScroll', props, props.children),
  Text: (props) =>
    require('react').createElement('MockText', props, props.children),
}));
jest.mock(
  'app/components/input-components/InputField',
  () => (props) => require('react').createElement('MockInput', props),
);
jest.mock(
  'app/components/input-components/SelectionInputField',
  () => (props) => require('react').createElement('MockSelection', props),
);
jest.mock(
  'app/components/input-components/SingleOptionCheckBox',
  () => (props) => require('react').createElement('MockCheck', props),
);
jest.mock(
  'app/components/AppButton',
  () => (props) => require('react').createElement('MockButton', props),
);
jest.mock('app/api/activity', () => ({
  __esModule: true,
  default: { getCentreActivities: jest.fn(), getActivities: jest.fn() },
  buildActivityTitleMap: jest.fn(() => ({})),
  applyActivityTitles: (rows) => rows,
  isMissingActivityTitle: (title) => !title,
}));
let tree;
const props = { showModal: true, onSubmit: jest.fn(), onClose: jest.fn() };
const mount = async (extra = {}) => {
  await act(async () => {
    tree = create(<AddActivityExclusionModal {...props} {...extra} />);
  });
};
beforeEach(() => {
  jest.clearAllMocks();
  activity.getCentreActivities.mockResolvedValue({
    ok: true,
    data: {
      data: [
        {
          centreActivityID: '9007199254740993',
          activityTitle: 'Synthetic eligible',
        },
        { centreActivityID: 2, activityTitle: 'Synthetic blocked' },
        {
          centreActivityID: 3,
          activityTitle: 'Synthetic deleted',
          is_deleted: true,
        },
      ],
    },
  });
  activity.getActivities.mockResolvedValue({ ok: true, data: { data: [] } });
});
afterEach(() => {
  if (tree) {
    act(() => tree.unmount());
  }
  tree = null;
});
test('blocked/deleted choices are absent and long choice ids are preserved', async () => {
  await mount({ excludedActivityIds: ['2'] });
  expect(tree.root.findByType('MockSelection').props.dataArray).toEqual([
    { label: 'Synthetic eligible', value: '9007199254740993' },
  ]);
});
test('failed eligibility prevents catalogue reads and submission', async () => {
  await mount({ rulesUnavailable: true });
  expect(activity.getCentreActivities).not.toHaveBeenCalled();
  expect(tree.root.findByType('MockModal').props.isInputErrors).toBe(true);
  expect(tree.root.findByType('MockSelection').props.dataArray).toEqual([]);
});
test('failed catalogue is retryable and never shows empty success', async () => {
  activity.getCentreActivities.mockResolvedValueOnce({ ok: false });
  await mount();
  expect(tree.root.findByType('MockModal').props.isInputErrors).toBe(true);
  const retry = tree.root.findByType('MockButton');
  await act(async () => retry.props.onPress());
  expect(tree.root.findByType('MockSelection').props.dataArray).toHaveLength(2);
});
test('closing while a read is pending suppresses the stale result', async () => {
  let resolve;
  activity.getCentreActivities.mockImplementationOnce(
    () =>
      new Promise((r) => {
        resolve = r;
      }),
  );
  await mount();
  await act(async () =>
    tree.update(<AddActivityExclusionModal {...props} showModal={false} />),
  );
  await act(async () =>
    resolve({
      ok: true,
      data: {
        data: [{ centreActivityID: 9, activityTitle: 'Stale synthetic' }],
      },
    }),
  );
  expect(tree.root.findByType('MockSelection').props.dataArray).toEqual([]);
});
