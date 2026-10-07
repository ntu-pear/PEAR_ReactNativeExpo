// IDs are opaque: do not round long numeric strings or change their case.
export const opaqueId = (value) => {
  if (typeof value === 'string' && value.trim()) {
    return value;
  }
  if (typeof value === 'number' && Number.isSafeInteger(value)) {
    return value;
  }
  throw new Error('A complete, lossless identifier is required.');
};

const personFields = new Set([
  'name',
  'firstName',
  'lastName',
  'preferredName',
  'address',
  'tempAddress',
  'Name',
  'FirstName',
  'LastName',
  'PreferredName',
  'Address',
  'TempAddress',
]);
export const uppercasePersonFields = (payload) => {
  const result = { ...payload };
  Object.keys(result).forEach((key) => {
    if (personFields.has(key) && typeof result[key] === 'string') {
      result[key] = result[key].toUpperCase();
    }
  });
  if (Array.isArray(result.newGuardian)) {
    result.newGuardian = result.newGuardian.map(uppercasePersonFields);
  }
  if (result.newGuardian && !Array.isArray(result.newGuardian)) {
    result.newGuardian = uppercasePersonFields(result.newGuardian);
  }
  return result;
};

const updateKeys = [
  'name',
  'nric',
  'address',
  'tempAddress',
  'homeNo',
  'handphoneNo',
  'gender',
  'dateOfBirth',
  'isApproved',
  'preferredName',
  'preferredLanguageId',
  'updateBit',
  'autoGame',
  'startDate',
  'endDate',
  'isActive',
  'isRespiteCare',
  'privacyLevel',
  'terminationReason',
  'inActiveReason',
  'inActiveDate',
  'profilePicture',
  'isDeleted',
];
const requiredKeys = [
  'name',
  'nric',
  'gender',
  'dateOfBirth',
  'isApproved',
  'updateBit',
  'autoGame',
  'startDate',
  'isActive',
  'isRespiteCare',
  'privacyLevel',
];
const editable = {
  Address: 'address',
  TempAddress: 'tempAddress',
  HomeNo: 'homeNo',
  HandphoneNo: 'handphoneNo',
  StartDate: 'startDate',
  EndDate: 'endDate',
  IsRespiteCare: 'isRespiteCare',
  PrivacyLevel: 'privacyLevel',
};
// PatientUpdate is a full replacement. Use a fresh complete record and preserve
// photo, identity, language and status; display projections contain masked/default data.
export const buildPatientInfoUpdate = ({
  record,
  edits,
  changedFields,
  patientId,
  userId,
  now = new Date(),
}) => {
  if (String(opaqueId(record?.id)) !== String(opaqueId(patientId))) {
    throw new Error('The patient response did not match this patient.');
  }
  const actor = opaqueId(userId);
  requiredKeys.forEach((key) => {
    if (
      record[key] === undefined ||
      record[key] === null ||
      record[key] === ''
    ) {
      throw new Error(
        'The complete patient record is unavailable. Reload before editing.',
      );
    }
  });
  if (/\*|x{2,}/i.test(record.nric)) {
    throw new Error(
      'The complete patient identity is unavailable. Reload before editing.',
    );
  }
  const result = {};
  updateKeys.forEach((key) => {
    if (record[key] !== undefined) {
      result[key] = record[key];
    }
  });
  changedFields.forEach((field) => {
    const key = editable[field];
    if (key) {
      result[key] = edits[field];
    }
  });
  if (changedFields.has('PrivacyLevel')) {
    result.privacyLevel = Number(edits.PrivacyLevel);
    if (![1, 2, 3].includes(result.privacyLevel)) {
      throw new Error('Choose a valid privacy level.');
    }
  }
  if (changedFields.has('IsRespiteCare')) {
    result.isRespiteCare = [true, 1, '1', 'true'].includes(edits.IsRespiteCare)
      ? '1'
      : '0';
  }
  ['startDate', 'endDate'].forEach((key) => {
    if (result[key] !== null && Number.isNaN(new Date(result[key]).getTime())) {
      throw new Error('Choose valid start and end dates.');
    }
  });
  if (result.endDate && new Date(result.endDate) < new Date(result.startDate)) {
    throw new Error('Leave date cannot be earlier than join date.');
  }
  result.ModifiedById = String(actor);
  result.modifiedDate = now.toISOString();
  return uppercasePersonFields(result);
};

export const resolvePreferredLanguage = (value, options = []) => {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return 0;
  }
  const text = String(value).trim();
  if (!text) {
    return 0;
  }
  const match = (Array.isArray(options) ? options : []).find(
    (option) =>
      option &&
      (String(option.value) === text ||
        (typeof value === 'string' &&
          String(option.label ?? '')
            .trim()
            .toLowerCase() === text.toLowerCase())),
  );
  return match?.value ?? 0;
};

export const buildPatientPreferencesUpdate = ({
  record,
  patientId,
  userId,
  preferredName,
  preferredLanguageId,
  languageOptions,
}) => {
  if (typeof preferredName !== 'string' || !preferredName.trim()) {
    throw new Error('Enter a preferred name.');
  }
  const language = languageOptions?.find(
    (option) => String(option.value) === String(preferredLanguageId),
  );
  const id = language?.value;
  const valid =
    (typeof id === 'number' && Number.isSafeInteger(id) && id > 0) ||
    (typeof id === 'string' && /^0*[1-9]\d*$/.test(id));
  if (!valid) {
    throw new Error('Choose an available preferred language.');
  }
  const result = buildPatientInfoUpdate({
    record,
    patientId,
    userId,
    edits: {},
    changedFields: new Set(),
  });
  return {
    ...result,
    preferredName: preferredName.trim().toUpperCase(),
    preferredLanguageId: id,
  };
};
