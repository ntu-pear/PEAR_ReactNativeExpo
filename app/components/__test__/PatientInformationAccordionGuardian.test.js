import React from 'react';
import { act, create } from 'react-test-renderer';
import PatientInformationAccordion from 'app/components/PatientInformationAccordion';
import InformationCard from 'app/components/InformationCard';
import routes from 'app/navigation/routes';

const mockPush = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ push: mockPush }),
}));
jest.mock('app/hooks/useGetSelectionOptions', () => () => ({ data: [] }));
jest.mock('app/api/patient', () => ({ getPatient: jest.fn() }));
jest.mock('native-base', () => {
  const { View, Text, TouchableOpacity: Button } = require('react-native');
  return {
    Button,
    Text,
    VStack: View,
    HStack: View,
    Box: View,
    Divider: View,
    IconButton: Button,
  };
});
jest.mock('react-native-vector-icons/FontAwesome', () => 'Icon');
jest.mock('react-native-collapsible/Accordion', () => (props) => {
  const { View } = require('react-native');
  return (
    <View>
      {props.sections.map((section) => (
        <View key={section.title}>{props.renderContent(section)}</View>
      ))}
    </View>
  );
});
jest.mock('app/components/AppButton', () => ({ title, onPress }) => {
  const { TouchableOpacity: Button, Text } = require('react-native');
  return (
    <Button onPress={onPress}>
      <Text>{title}</Text>
    </Button>
  );
});

const patientId = '90071992547409931';
const guardian = {
  guardianID: '90071992547409933',
  firstName: 'SYNTHETIC',
  nric: 'TEST-A',
};
const secondary = {
  guardianID: '90071992547409935',
  firstName: 'SYNTHETIC',
  nric: 'TEST-B',
};
const render = async (guardianData, extra = {}) => {
  let tree;
  await act(async () => {
    tree = create(
      <PatientInformationAccordion
        patientID={patientId}
        patientProfile={{ patientID: patientId }}
        guardianData={guardianData}
        {...extra}
      />,
    );
  });
  return tree;
};
const guardianCards = (tree) =>
  tree.root
    .findAllByType(InformationCard)
    .filter((card) => card.props.title === 'Guardian(s) Information');
beforeEach(() => mockPush.mockClear());

test.each([
  undefined,
  null,
  {},
  { guardian: null },
  { guardian: {} },
  { guardian: { firstName: 'SYNTHETIC' } },
  { guardian: { guardianID: '' } },
  { guardian: { guardianID: false } },
  { guardian: { guardianID: {} } },
  { guardian: { guardianID: Number.MAX_SAFE_INTEGER + 1 } },
  { guardian: { guardianID: '0' } },
])(
  'an absent or unidentified guardian has no inert Edit control: %p',
  async (data) => {
    const tree = await render(data);
    const cards = guardianCards(tree);
    expect(cards).toHaveLength(1);
    expect(cards[0].props.handleOnPress).toBeNull();
    // The real InformationCard renders no AppButton; its NRIC eye is absent for empty data.
    const edits = cards[0].findAll((node) => node.props.title === 'EDIT');
    expect(edits).toHaveLength(0);
    expect(mockPush).not.toHaveBeenCalled();
  },
);

test('the linked guardian Edit routes with lossless guardian and patient IDs', async () => {
  const tree = await render({ guardian });
  const card = guardianCards(tree)[0];
  const button = card.findAll((node) => node.props.title === 'EDIT')[0];
  expect(button).toBeDefined();
  await act(async () => button.props.onPress());
  expect(mockPush).toHaveBeenCalledTimes(1);
  expect(mockPush).toHaveBeenCalledWith(routes.EDIT_PATIENT_GUARDIAN, {
    guardianProfile: guardian,
    patientID: patientId,
  });
});

test('two linked guardians keep separate valid Edit routes', async () => {
  const tree = await render({ guardian, additionalGuardian: secondary });
  const cards = guardianCards(tree);
  expect(cards).toHaveLength(2);
  for (const card of cards) {
    const button = card.findAll((node) => node.props.title === 'EDIT')[0];
    expect(button).toBeDefined();
    await act(async () => button.props.onPress());
  }
  expect(mockPush.mock.calls).toEqual([
    [
      routes.EDIT_PATIENT_GUARDIAN,
      { guardianProfile: guardian, patientID: patientId },
    ],
    [
      routes.EDIT_PATIENT_GUARDIAN,
      { guardianProfile: secondary, patientID: patientId },
    ],
  ]);
});

test('a safe numeric guardian ID remains unchanged in navigation', async () => {
  const numericGuardian = { ...guardian, guardianID: 7 };
  const tree = await render({ guardian: numericGuardian });
  const button = guardianCards(tree)[0].findAll(
    (node) => node.props.title === 'EDIT',
  )[0];
  await act(async () => button.props.onPress());
  expect(mockPush).toHaveBeenCalledWith(routes.EDIT_PATIENT_GUARDIAN, {
    guardianProfile: numericGuardian,
    patientID: patientId,
  });
});

test('an unidentified secondary guardian remains readable without a dead subtitle Edit', async () => {
  const tree = await render({
    guardian,
    additionalGuardian: { firstName: 'SYNTHETIC', nric: 'TEST-B' },
  });
  const cards = guardianCards(tree);
  expect(cards).toHaveLength(2);
  expect(cards[1].props.subtitle).toBe('Guardian 2');
  expect(cards[1].findAll((node) => node.props.title === 'EDIT')).toHaveLength(
    0,
  );
});

test.each([
  { guardianLoading: true },
  { guardianError: 'Unable to load guardian', onRetry: jest.fn() },
])(
  'loading and failed guardian sections expose no stale Edit: %p',
  async (state) => {
    const tree = await render(
      { guardian, additionalGuardian: secondary },
      state,
    );
    expect(guardianCards(tree)).toHaveLength(0);
    expect(mockPush).not.toHaveBeenCalled();
  },
);
