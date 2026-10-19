// Omitted fields are not an invitation to edit or replace them with defaults.
const fields = [
  ['Live with', ['liveWithListId', 'LiveWithListId']],
  ['Education', ['educationListId', 'EducationListId']],
  ['Occupation', ['occupationListId', 'OccupationListId']],
  ['Religion', ['religionListId', 'ReligionListId']],
  ['Pet', ['petListId', 'PetListId']],
  ['Diet', ['dietListId', 'DietListId']],
  ['Exercise', ['exercise', 'Exercise']],
  ['Sexually active', ['sexuallyActive', 'SexuallyActive']],
  ['Drug use', ['drugUse', 'DrugUse']],
  ['Caffeine use', ['caffeineUse', 'CaffeineUse']],
  ['Alcohol use', ['alcoholUse', 'AlcoholUse']],
  ['Tobacco use', ['tobaccoUse', 'TobaccoUse']],
  [
    'Secondhand smoker',
    ['secondHandSmoker', 'secondhandSmoker', 'SecondhandSmoker'],
  ],
];
const returnedValue = (record, aliases) =>
  aliases.find((key) => Object.prototype.hasOwnProperty.call(record, key));
export const socialHistoryVisibleLabels = (record) => {
  if (!record || typeof record !== 'object') {
    return [];
  }
  return fields
    .filter(([label, aliases]) => {
      if (
        Array.isArray(record.visibleSocialHistoryFields) &&
        !record.visibleSocialHistoryFields.includes(label)
      ) {
        return false;
      }
      const key = returnedValue(record, aliases);
      // Backend masking sentinel always wins over descriptions or route metadata.
      if (key) {
        return record[key] != null && String(record[key]) !== '-1';
      }
      return false;
    })
    .map(([label]) => label);
};
export const socialHistoryCanEdit = (record) => {
  const id = record?.socialHistoryId ?? record?.id;
  const validId =
    typeof id === 'number'
      ? Number.isSafeInteger(id) && id > 0
      : /^[1-9]\d*$/.test(String(id ?? ''));
  return validId && socialHistoryVisibleLabels(record).length === fields.length;
};
