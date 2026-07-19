/**
 * @jest-environment node
 */

jest.mock('app/utility/miscFunctions', () => ({
  convertTimeMilitary: jest.fn((time) => new Date(`2026-01-01T${time.slice(0, 2)}:${time.slice(2)}:00`)),
}));

const { getScheduleDayValue, parseScheduleDay, parseScheduleString } = require('app/utility/parseScheduleString');

describe('parseScheduleString utility', () => {
  const scheduleDate = new Date('2026-06-16T00:00:00.000Z');
  const patientID = 1;
  const patientName = 'Jane Doe';

  it('returns empty array for blank schedule strings', () => {
    expect(parseScheduleString('', scheduleDate, patientID, patientName)).toEqual([]);
    expect(parseScheduleString(null, scheduleDate, patientID, patientName)).toEqual([]);
  });

  it('parses activity-only slots without crashing', () => {
    const result = parseScheduleString(
      'Breathing Exercise--Vital Check',
      scheduleDate,
      patientID,
      patientName,
    );

    expect(result).toHaveLength(2);
    expect(result[0].activityTitle).toBe('Breathing Exercise');
    expect(result[0].medications).toEqual([]);
  });

  it('parses medication metadata when present', () => {
    const result = parseScheduleString(
      'Breathing+Vital Check | Give Medication@0930: Diphenhydramine(2 tabs)**Always leave at least 4 hours between doses',
      scheduleDate,
      patientID,
      patientName,
    );

    expect(result).toHaveLength(1);
    expect(result[0].medications).toHaveLength(1);
    expect(result[0].medications[0]).toEqual(
      expect.objectContaining({
        medName: 'Diphenhydramine',
        medDosage: '2 tabs',
        medNote: 'Always leave at least 4 hours between doses',
      }),
    );
  });

  it('skips malformed medication entries instead of throwing', () => {
    expect(() =>
      parseScheduleString(
        'Activity | malformed medication entry',
        scheduleDate,
        patientID,
        patientName,
      ),
    ).not.toThrow();

    const result = parseScheduleString(
      'Activity | malformed medication entry',
      scheduleDate,
      patientID,
      patientName,
    );

    expect(result[0].medications).toEqual([]);
  });

  it('parses v1 object-shaped day schedules', () => {
    const dayObject = {
      '09:00-09:30': 'Free and Easy',
      '13:30-14:00':
        'PLAYWRIGHT TEST ACTIVITY 2 | Give Medication@1330: Ibuprofen(1)**Patient to take after lunch',
    };

    const result = parseScheduleDay(dayObject, scheduleDate, patientID, patientName);

    expect(result).toHaveLength(2);
    expect(result[0].activityTitle).toBe('Free and Easy');
    expect(result[1].medications[0]).toEqual(
      expect.objectContaining({
        medName: 'Ibuprofen',
        medDosage: '1',
      }),
    );
  });
});

describe('getScheduleDayValue', () => {
  it('reads day values case-insensitively', () => {
    const sched = {
      monday: 'Morning Walk',
      PatientID: 1,
    };

    expect(getScheduleDayValue(sched, 'Monday')).toBe('Morning Walk');
    expect(getScheduleDayValue(sched, 'Tuesday')).toBe('');
  });
});
