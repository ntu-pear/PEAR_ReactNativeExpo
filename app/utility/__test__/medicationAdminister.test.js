/**
 * @jest-environment node
 */

import {
  administrationFailureMessage,
  assignedCaregiverIdFrom,
  buildMedicationScheduleUpdate,
  currentUserId,
  isAssignedCaregiver,
  listMedicationScheduleRows,
  logMedicationAdministration,
  matchMedicationScheduleRow,
  normalizeAdministerTime,
} from 'app/utility/medicationAdminister';

describe('medicationAdminister helpers', () => {
  test('currentUserId prefers v1 id fields', () => {
    expect(currentUserId({ id: 'abc', userID: 'legacy' })).toBe('abc');
    expect(currentUserId({ userID: 'legacy' })).toBe('legacy');
    expect(currentUserId({})).toBe('');
  });

  test('isAssignedCaregiver matches assignedTo or allocation ids', () => {
    expect(
      isAssignedCaregiver({
        userId: 'CG-1',
        assignedTo: 'CG-1',
      }),
    ).toBe(true);
    expect(
      isAssignedCaregiver({
        userId: 'CG-1',
        assignedTo: 'UNASSIGNED',
        caregiverId: 'CG-1',
      }),
    ).toBe(true);
    expect(
      isAssignedCaregiver({
        userId: 'CG-1',
        assignedTo: 'CG-2',
        caregiverId: 'CG-9',
      }),
    ).toBe(false);
  });

  test('normalizeAdministerTime accepts Date, HHmm, and HH:mm', () => {
    expect(normalizeAdministerTime('1130')).toBe('1130');
    expect(normalizeAdministerTime('11:30')).toBe('1130');
    expect(normalizeAdministerTime(new Date(2026, 7, 17, 11, 30))).toBe('1130');
  });

  test('matchMedicationScheduleRow matches patient, name, and time', () => {
    const rows = [
      {
        PatientID: 7,
        PrescriptionName: 'Galantamine',
        AdministerTime: '11:30',
        AssignedTo: 'CG-1',
        Status: '0',
      },
    ];
    expect(
      matchMedicationScheduleRow(rows, {
        patientID: 7,
        prescriptionName: 'Galantamine',
        administerTime: '1130',
      }),
    ).toEqual(rows[0]);
    expect(
      matchMedicationScheduleRow(rows, {
        patientID: 7,
        prescriptionName: 'Other',
        administerTime: '1130',
      }),
    ).toBeNull();
  });

  test('listMedicationScheduleRows ignores message-only payloads', () => {
    expect(
      listMedicationScheduleRows({ message: 'No medication schedules to be returned' }),
    ).toEqual([]);
  });

  test('buildMedicationScheduleUpdate records the clicker as AdministeredBy', () => {
    expect(
      buildMedicationScheduleUpdate({
        row: {
          PatientID: 7,
          PrescriptionName: 'Galantamine',
          AdministerDate: '2026-08-17',
          AdministerTime: '1130',
        },
        userId: 'CG-9',
      }),
    ).toEqual({
      PatientID: 7,
      PrescriptionName: 'Galantamine',
      AdministerDate: '2026-08-17',
      AdministerTime: '1130',
      Status: '1',
      AdministeredBy: 'CG-9',
    });
  });

  test('assignedCaregiverIdFrom prefers schedule AssignedTo over allocation', () => {
    expect(
      assignedCaregiverIdFrom({
        row: { AssignedTo: 'CG-1' },
        allocation: { caregiverId: 'CG-2' },
      }),
    ).toBe('CG-1');
    expect(
      assignedCaregiverIdFrom({
        allocation: { caregiverId: 'CG-2', tempCaregiverId: 'CG-3' },
      }),
    ).toBe('CG-2');
  });

  test('logMedicationAdministration persists when a matching slot exists', async () => {
    const getSchedule = jest.fn().mockResolvedValue({
      ok: true,
      data: [
        {
          PatientID: 7,
          PrescriptionName: 'Galantamine',
          AdministerDate: '2026-08-17',
          AdministerTime: '1130',
          Status: '0',
          AssignedTo: 'CG-1',
        },
      ],
    });
    const updateSchedule = jest.fn().mockResolvedValue({ ok: true, status: 200, data: {} });

    const result = await logMedicationAdministration({
      getSchedule,
      updateSchedule,
      patientID: 7,
      prescriptionName: 'Galantamine',
      administerTime: '1130',
      userId: 'CG-9',
    });

    expect(result.ok).toBe(true);
    expect(result.assignedTo).toBe('CG-1');
    expect(updateSchedule).toHaveBeenCalledWith(
      expect.objectContaining({
        PatientID: 7,
        Status: '1',
        AdministeredBy: 'CG-9',
      }),
    );
  });

  test('logMedicationAdministration does not claim success when the slot is missing', async () => {
    const result = await logMedicationAdministration({
      getSchedule: async () => ({ ok: true, data: [] }),
      updateSchedule: jest.fn(),
      patientID: 7,
      prescriptionName: 'Galantamine',
      administerTime: '1130',
      userId: 'CG-9',
    });

    expect(result.ok).toBe(false);
    expect(result.reason).toBe('slot_not_found');
    expect(administrationFailureMessage(result.reason)).toMatch(/not recorded/i);
  });
});
