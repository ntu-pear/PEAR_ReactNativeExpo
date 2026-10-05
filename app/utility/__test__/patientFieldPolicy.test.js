/** @jest-environment node */
import {
  opaqueId,
  uppercasePersonFields,
  buildPatientInfoUpdate,
} from 'app/utility/patientFieldPolicy';
import {
  primaryGuardianId,
  guardianRoleLabel,
} from 'app/utility/guardianPrimary';
import { idsEqual } from 'app/utility/medicationAdminister';
const id = '900719925474099312345';
const record = {
  id,
  name: 'Test Patient',
  nric: 'S1234567D',
  gender: 'M',
  dateOfBirth: '1950-01-01T00:00:00',
  isApproved: '1',
  updateBit: '1',
  autoGame: '1',
  startDate: '2020-01-01T00:00:00',
  endDate: null,
  isActive: '1',
  isRespiteCare: '0',
  privacyLevel: 2,
  preferredLanguageId: 12,
  profilePicture: 'https://synthetic.invalid/picture.png',
  preferredName: 'Test',
  address: 'Old Address',
  isDeleted: 0,
};
const build = (extra = {}) =>
  buildPatientInfoUpdate({
    record,
    edits: { Address: 'new address', NRIC: 'changed', Gender: 'F' },
    changedFields: new Set(['Address', 'NRIC', 'Gender']),
    patientId: id,
    userId: 'Actor-CaseSensitive',
    ...extra,
  });
test('an address update preserves fresh identity, photo, language and status without display defaults', () => {
  expect(build()).toEqual(
    expect.objectContaining({
      address: 'NEW ADDRESS',
      name: 'TEST PATIENT',
      nric: record.nric,
      gender: 'M',
      profilePicture: record.profilePicture,
      preferredLanguageId: 12,
      isApproved: '1',
      updateBit: '1',
      autoGame: '1',
      ModifiedById: 'Actor-CaseSensitive',
    }),
  );
  expect(build()).not.toHaveProperty('id');
});
test('unchanged contact data comes from the fresh record', () => {
  expect(
    build({ edits: { Address: 'stale' }, changedFields: new Set() }).address,
  ).toBe('OLD ADDRESS');
});
test.each(['wrong-patient', 'masked', 'missing'])(
  'incomplete fresh read %s cannot be saved',
  (kind) => {
    const bad = { ...record };
    if (kind === 'wrong-patient') bad.id = 'different';
    if (kind === 'masked') bad.nric = 'SXXXX567D';
    if (kind === 'missing') delete bad.isApproved;
    expect(() => build({ record: bad })).toThrow();
  },
);
test('invalid dates and leave before join are rejected', () => {
  expect(() =>
    build({
      edits: { EndDate: '2019-01-01' },
      changedFields: new Set(['EndDate']),
    }),
  ).toThrow(/earlier/);
  expect(() =>
    build({
      edits: { EndDate: 'invalid' },
      changedFields: new Set(['EndDate']),
    }),
  ).toThrow(/valid/);
});
test('only textual names and addresses are uppercased, including nested guardians', () => {
  const data = {
    name: 'Test',
    address: 'Road',
    email: 'Case@Example.invalid',
    password: 'Sensitive',
    nric: 'CaseSensitive',
    userId: 'user-X',
    newGuardian: [
      {
        firstName: 'Alice',
        tempAddress: 'Lane',
        email: 'Alice@Example.invalid',
      },
    ],
  };
  const result = uppercasePersonFields(data);
  expect(result).toEqual({
    ...data,
    name: 'TEST',
    address: 'ROAD',
    newGuardian: [
      {
        firstName: 'ALICE',
        tempAddress: 'LANE',
        email: 'Alice@Example.invalid',
      },
    ],
  });
  expect(data.newGuardian[0].firstName).toBe('Alice');
});
test('long and case-sensitive identifiers survive; already rounded numbers fail', () => {
  expect(opaqueId(id)).toBe(id);
  expect(opaqueId('Patient-AbC')).toBe('Patient-AbC');
  expect(() => opaqueId(9007199254740992)).toThrow();
  expect(idsEqual('Actor-A', 'actor-a')).toBe(false);
});
test('primary guardian is derived from this active allocation, not array order', () => {
  const allocation = {
    ok: true,
    data: {
      patientId: id,
      guardianId: 'Guardian-Z',
      active: 'Y',
      isDeleted: '0',
    },
  };
  expect(primaryGuardianId(allocation, id)).toBe('Guardian-Z');
  expect(guardianRoleLabel({ isPrimary: true })).toBe('Primary guardian');
  expect(primaryGuardianId(allocation, 'different')).toBeNull();
  expect(primaryGuardianId({ ok: false }, id)).toBeNull();
  expect(guardianRoleLabel({})).toBe('Primary status unavailable');
});
