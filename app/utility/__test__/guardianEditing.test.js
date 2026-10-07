/** @jest-environment node */
import {
  buildGuardianUpdate,
  buildPrimaryGuardianUpdate,
  guardianRecords,
} from 'app/utility/guardianEditing';
const supervisor = { id: 'TEST-SUP', roleName: 'SUPERVISOR' };
const guardian = {
  id: 2,
  firstName: 'TEST',
  lastName: 'GUARDIAN',
  nric: 'TEST ID',
  dateOfBirth: '1970-01-01T00:00:00Z',
  active: 'Y',
  isDeleted: '0',
  status: 'custom-status',
  guardianApplicationUserId: 'TEST-LINK',
  gender: 'F',
  relationshipName: 'Child',
};
const edits = {
  preferredName: 'TEST',
  contactNo: '12345678',
  address: 'TEST ADDRESS',
  relationshipName: 'Sibling',
};
const allocation = {
  id: 3,
  patientId: 7,
  active: 'Y',
  isDeleted: false,
  guardianId: 1,
  guardian2Id: 2,
  caregiverId: 'TEST-CG',
  tempCaregiverId: 9,
  doctorId: 'TEST-DOC',
  tempDoctorId: 10,
  supervisorId: 'TEST-SUP',
  gameTherapistId: 'TEST-GT',
};
test('relationship editing uses the actual actor and preserves identity, status and account linkage', () => {
  const payload = buildGuardianUpdate({
    guardian,
    edits: { ...edits, nric: 'CHANGED', firstName: 'CHANGED' },
    patientId: 7,
    user: supervisor,
  });
  expect(payload).toMatchObject({
    nric: 'TEST ID',
    firstName: 'TEST',
    dateOfBirth: guardian.dateOfBirth,
    guardianApplicationUserId: 'TEST-LINK',
    status: 'custom-status',
    ModifiedById: 'TEST-SUP',
    patientId: 7,
    relationshipName: 'Sibling',
  });
  expect(
    buildGuardianUpdate({
      guardian,
      edits,
      patientId: 7,
      user: { id: 'TEST-CG', roleName: 'CAREGIVER' },
    }).ModifiedById,
  ).toBe('TEST-CG');
});
test('masked or missing identity and forbidden roles cannot produce a full update', () => {
  for (const overrides of [{ nric: '****' }, { dateOfBirth: null }])
    expect(() =>
      buildGuardianUpdate({
        guardian: { ...guardian, ...overrides },
        edits,
        patientId: 7,
        user: supervisor,
      }),
    ).toThrow();
  expect(() =>
    buildGuardianUpdate({
      guardian,
      edits,
      patientId: 7,
      user: { id: 'TEST-DOC', roleName: 'DOCTOR' },
    }),
  ).toThrow();
});
test('primary selection omits staff fields and swaps the former primary into secondary', () => {
  const payload = buildPrimaryGuardianUpdate({
    allocation,
    guardians: [{ ...guardian, id: 1 }, guardian],
    guardianId: 2,
    patientId: 7,
    user: supervisor,
  });
  expect(payload).toEqual({
    patientId: 7,
    guardianId: 2,
    guardian2Id: 1,
    ModifiedById: 'TEST-SUP',
  });
  expect(payload).not.toHaveProperty('caregiverId');
  expect(payload).not.toHaveProperty('doctorId');
  expect(allocation.guardianId).toBe(1);
});
test('wrong-patient, inactive, unlinked and caregiver primary-selection attempts are rejected', () => {
  const base = {
    allocation,
    guardians: [guardian],
    guardianId: 2,
    patientId: 7,
    user: supervisor,
  };
  expect(() => buildPrimaryGuardianUpdate({ ...base, patientId: 8 })).toThrow();
  expect(() =>
    buildPrimaryGuardianUpdate({
      ...base,
      allocation: { ...allocation, active: 'N' },
    }),
  ).toThrow();
  expect(() =>
    buildPrimaryGuardianUpdate({ ...base, guardians: [] }),
  ).toThrow();
  expect(() =>
    buildPrimaryGuardianUpdate({
      ...base,
      user: { id: 'TEST-CG', roleName: 'CAREGIVER' },
    }),
  ).toThrow();
});
test('fresh guardian reads validate patient identity and retain account fields', () => {
  const response = {
    ok: true,
    data: {
      data: [
        {
          patient: { id: 7 },
          patient_guardians: [
            { patient_guardian: guardian, relationshipName: 'Child' },
          ],
        },
      ],
    },
  };
  expect(guardianRecords(response, 7)[0].guardianApplicationUserId).toBe(
    'TEST-LINK',
  );
  expect(() => guardianRecords(response, 8)).toThrow();
  expect(() => guardianRecords({ ok: false, status: 403 }, 7)).toThrow();
});
