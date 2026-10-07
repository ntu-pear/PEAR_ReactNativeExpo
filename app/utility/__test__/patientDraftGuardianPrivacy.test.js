import AsyncStorage from '@react-native-async-storage/async-storage';
import patientDraft from 'app/utility/patientDraft';
jest.mock('@react-native-async-storage/async-storage', () => {
  const values = new Map();
  return {
    setItem: jest.fn(async (key, value) => values.set(key, value)),
    getItem: jest.fn(async (key) => values.get(key) || null),
    removeItem: jest.fn(async (key) => values.delete(key)),
    clear: () => values.clear(),
  };
});
const existing = {
  Mode: 'existing',
  ExistingGuardianId: '9007199254740993',
  NRIC: 'S0000000J',
  SelectedNric: 'S0000000J',
  FirstName: 'SYNTHETIC',
  LastName: 'IDENTITY',
  Email: 'test@example.invalid',
  ContactNo: 'SYNTHETIC_CONTACT',
  Address: 'SYNTHETIC_ADDRESS',
  RelationshipID: 3,
  RelationshipName: 'Child',
};
beforeEach(() => {
  AsyncStorage.clear();
  jest.clearAllMocks();
});
test('the real draft saver stores no existing guardian identity or contact fields', async () => {
  const form = {
    patientInfo: { syntheticField: 'unchanged' },
    guardianInfo: [{ ...existing }],
  };
  await patientDraft.saveDraft(form, 2, { guardian: [{}] });
  const saved = JSON.parse(await AsyncStorage.getItem('patientDraft'));
  expect(saved.guardianInfo).toEqual([
    { Mode: 'existing', RelationshipID: 3, RelationshipName: 'Child' },
  ]);
  expect(saved.patientInfo).toEqual(form.patientInfo);
  expect(form.guardianInfo[0]).toEqual(existing);
  const restored = await patientDraft.loadDraft();
  expect(restored.formData.guardianInfo).toEqual(saved.guardianInfo);
  expect(restored.step).toBe(2);
  expect(restored.componentList).toEqual({ guardian: [{}] });
});
test('legacy unsafe existing-primary draft restoration discards identity and requires a fresh search', async () => {
  await AsyncStorage.setItem(
    'patientDraft',
    JSON.stringify({ guardianInfo: [existing] }),
  );
  const { formData } = await patientDraft.loadDraft();
  expect(formData.guardianInfo[0]).toEqual({
    Mode: 'existing',
    RelationshipID: 3,
    RelationshipName: 'Child',
  });
  expect(formData.guardianInfo[0]).not.toHaveProperty('ExistingGuardianId');
  expect(formData.guardianInfo[0]).not.toHaveProperty('SelectedNric');
  expect(formData.guardianInfo[0]).not.toHaveProperty('NRIC');
});
test('the new sanitizer leaves the legacy new-guardian draft branch unchanged', async () => {
  const fresh = {
    Mode: 'new',
    FirstName: 'SYNTHETIC',
    DOB: new Date('2000-01-01T00:00:00Z'),
  };
  await patientDraft.saveDraft({ guardianInfo: [fresh] }, 2, {
    guardian: [{}],
  });
  expect(
    JSON.parse(await AsyncStorage.getItem('patientDraft')).guardianInfo[0],
  ).toEqual({ ...fresh, DOB: fresh.DOB.toISOString() });
  expect((await patientDraft.loadDraft()).formData.guardianInfo[0]).toEqual(
    fresh,
  );
});
