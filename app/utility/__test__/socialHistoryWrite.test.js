import { writeSocialHistory } from 'app/utility/socialHistoryWrite';

const form = {
  PatientID: 7,
  LiveWithListId: 2,
  EducationListId: 1,
  OccupationListId: 1,
  ReligionListId: 1,
  PetListId: 1,
  DietListId: 1,
  ExerciseDisplay: 2,
  SexuallyActiveDisplay: 2,
  DrugUseDisplay: 2,
  CaffeineUseDisplay: 2,
  AlcoholUseDisplay: 2,
  TobaccoUseDisplay: 2,
  SecondhandSmokerDisplay: 2,
};
const record = {
  id: 12,
  patientId: 7,
  liveWithListId: 2,
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
const api = () => ({
  addSocialHistory: jest.fn(async () => ({ ok: true, status: 200 })),
  updateSocialHistory: jest.fn(async () => ({ ok: true, status: 200 })),
  getSocialHistory: jest.fn(async () => ({ ok: true, data: record })),
});

test('accepted create with failed read is uncertain and is not retried', async () => {
  const a = api();
  a.getSocialHistory.mockResolvedValue({ ok: false, status: 500 });
  const result = await writeSocialHistory({ form, api: a });
  expect(result).toMatchObject({ outcome: 'uncertain', accepted: true });
  expect(a.addSocialHistory).toHaveBeenCalledTimes(1);
});
test('another patient or changed values cannot be verified as this save', async () => {
  for (const changed of [{ patientId: 8 }, { liveWithListId: 6 }]) {
    const a = api();
    a.getSocialHistory.mockResolvedValue({
      ok: true,
      data: { ...record, ...changed },
    });
    expect((await writeSocialHistory({ form, api: a })).outcome).toBe(
      'uncertain',
    );
  }
});
test('update must read back the same record ID', async () => {
  const a = api();
  expect(
    (
      await writeSocialHistory({
        form: { ...form, SocialHistoryId: 13 },
        api: a,
      })
    ).outcome,
  ).toBe('uncertain');
  expect(a.addSocialHistory).not.toHaveBeenCalled();
});
test('verified create and update retain their separate supported routes', async () => {
  const a = api();
  expect((await writeSocialHistory({ form, api: a })).outcome).toBe('verified');
  expect(
    (
      await writeSocialHistory({
        form: { ...form, SocialHistoryId: 12 },
        api: a,
      })
    ).outcome,
  ).toBe('verified');
  expect(a.addSocialHistory).toHaveBeenCalledTimes(1);
  expect(a.updateSocialHistory).toHaveBeenCalledTimes(1);
});
test('stale ownership prevents a write and discards a later read result', async () => {
  const a = api();
  expect(
    (await writeSocialHistory({ form, api: a, isCurrent: () => false }))
      .outcome,
  ).toBe('stale');
  expect(a.addSocialHistory).not.toHaveBeenCalled();
  let current = true;
  a.getSocialHistory.mockImplementation(async () => {
    current = false;
    return { ok: true, data: record };
  });
  expect(
    (await writeSocialHistory({ form, api: a, isCurrent: () => current }))
      .outcome,
  ).toBe('stale');
});
