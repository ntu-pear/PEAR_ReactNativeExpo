import { maskIdentifier } from 'app/utility/identifierMask';
import {
  socialHistoryVisibleLabels,
  socialHistoryCanEdit,
} from 'app/utility/socialHistoryFields';
import { writeSocialHistory } from 'app/utility/socialHistoryWrite';

test.each([
  ['S1234567A', '*****567A'],
  ['T1234567Z', '*****567Z'],
  ['1234567', '***4567'],
  ['*****567A', '*****567A'],
  ['ABC', '***'],
  ['', ''],
])('identifier%s masks by default, including letter suffixes', (raw, masked) =>
  expect(maskIdentifier(raw)).toBe(masked),
);
const complete = {
  id: 12,
  liveWithListId: 1,
  educationListId: 1,
  occupationListId: 1,
  religionListId: 1,
  petListId: 1,
  dietListId: 1,
  exercise: 2,
  sexuallyActive: 2,
  drugUse: 2,
  caffeineUse: 2,
  alcoholUse: 2,
  tobaccoUse: 2,
  secondHandSmoker: 2,
};
test('returned-field authority is shared by view and editor; missing fields are not defaulted into edit authority', () => {
  const limited = {
    id: 12,
    liveWithListId: 1,
    educationListId: 1,
    exercise: 0,
  };
  expect(socialHistoryVisibleLabels(limited)).toEqual([
    'Live with',
    'Education',
    'Exercise',
  ]);
  expect(socialHistoryCanEdit(limited)).toBe(false);
  expect(socialHistoryCanEdit(complete)).toBe(true);
  expect(socialHistoryCanEdit({ ...complete, petListId: null })).toBe(false);
  expect(socialHistoryVisibleLabels({ liveWithDescription: 'Alone' })).toEqual(
    [],
  );
  expect(
    socialHistoryVisibleLabels({
      ...complete,
      liveWithListId: -1,
      liveWithDescription: 'Must stay hidden',
      sexuallyActive: '-1',
    }),
  ).not.toContain('Live with');
  expect(socialHistoryCanEdit({ ...complete, sexuallyActive: -1 })).toBe(false);
  expect(
    socialHistoryVisibleLabels({
      exercise: -1,
      visibleSocialHistoryFields: ['Exercise'],
    }),
  ).toEqual([]);
  expect(
    socialHistoryCanEdit({
      ...complete,
      visibleSocialHistoryFields: ['Live with'],
    }),
  ).toBe(false);
});
test('privacy-limited or unidentified existing record sends no write, even if the form contains defaults', async () => {
  const api = {
    addSocialHistory: jest.fn(),
    updateSocialHistory: jest.fn(),
    getSocialHistory: jest.fn(),
  };
  const result = await writeSocialHistory({
    form: { PatientID: 1, SocialHistoryId: 12, LiveWithListId: 1 },
    sourceRecord: { id: 12, liveWithListId: 1 },
    api,
  });
  expect(result.outcome).toBe('rejected');
  expect(api.updateSocialHistory).not.toHaveBeenCalled();
  expect(api.addSocialHistory).not.toHaveBeenCalled();
});
