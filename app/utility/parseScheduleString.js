import { convertTimeMilitary } from 'app/utility/miscFunctions';

const parseMedicationEntry = (entry, patientID, patientName) => {
  if (!entry || !entry.includes('@')) return null;

  const medicationInfo = entry.split('@')[1];
  if (!medicationInfo || !medicationInfo.includes(': ')) return null;

  const medPart = medicationInfo.split(': ')[1];
  if (!medPart) return null;

  const med = medPart.split('**')[0];
  const medTime = medicationInfo.split(':')[0];
  const medNote = medicationInfo.split('**')[1] ?? '';
  const dosageMatch = med.match(/\(([^)]+)\)/);

  return {
    patientID,
    patientName,
    medID: 0,
    medName: (med.split('(')[0] ?? med).trim(),
    medDosage: dosageMatch ? dosageMatch[1] : '',
    medTime: convertTimeMilitary(medTime),
    medNote,
  };
};

const parseActivityMedications = (activityStr, patientID, patientName) => {
  const activitySplit = activityStr.split(' | ');
  const medications = [];

  if (activitySplit.length > 1) {
    const medicationSplit = activitySplit[1].split(', ');
    for (let k = 0; k < medicationSplit.length; k++) {
      const medication = parseMedicationEntry(
        medicationSplit[k].trim(),
        patientID,
        patientName,
      );
      if (medication) medications.push(medication);
    }
  }

  return medications;
};

const applyTimeOnDate = (timeValue, scheduleDate) => {
  const [hours, minutes] = String(timeValue).split(':');
  const dateTime = new Date(scheduleDate);
  dateTime.setHours(Number(hours), Number(minutes), 0, 0);
  return dateTime;
};

const parseTimeRangeOnDate = (timeRange, scheduleDate) => {
  const [start, end] = String(timeRange).split('-');
  return {
    startTime: applyTimeOnDate(start, scheduleDate),
    endTime: applyTimeOnDate(end, scheduleDate),
  };
};

export const getScheduleDayValue = (sched, day) => {
  if (!sched || !day) return '';

  if (sched[day] != null && sched[day] !== '') return sched[day];

  const target = day.toLowerCase();
  for (const key of Object.keys(sched)) {
    if (key.toLowerCase() === target) return sched[key] ?? '';
  }

  return '';
};

export const parseScheduleString = (
  scheduleString,
  scheduleDate,
  patientID,
  patientName,
) => {
  const normalized = scheduleString == null ? '' : String(scheduleString).trim();
  if (!normalized || normalized === '[object Object]') return [];

  const scheduleData = [];
  let startTime = new Date(scheduleDate);
  startTime.setHours(8, 0, 0, 0);
  let endTime = new Date(scheduleDate);
  endTime.setHours(9, 0, 0, 0);

  const timeslotSplit = normalized.split('--');
  for (let i = 0; i < timeslotSplit.length; i++) {
    const slot = timeslotSplit[i].trim();
    if (!slot) continue;

    const activitySplit = slot.split(' | ');
    const activityTitle = (activitySplit[0] ?? '').trim();
    const medications = parseActivityMedications(slot, patientID, patientName);

    scheduleData.push({
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      activityTitle,
      medications,
    });

    startTime = new Date(startTime.setHours(startTime.getHours() + 1));
    endTime = new Date(endTime.setHours(endTime.getHours() + 1));
  }

  return scheduleData;
};

const parseScheduleObjectDay = (dayObject, scheduleDate, patientID, patientName) => {
  const scheduleData = [];

  Object.entries(dayObject).forEach(([timeRange, activityRaw]) => {
    const activityStr = String(activityRaw ?? '').trim();
    if (!activityStr) return;

    const { startTime, endTime } = parseTimeRangeOnDate(timeRange, scheduleDate);
    const activityTitle = (activityStr.split(' | ')[0] ?? activityStr).trim();
    const medications = parseActivityMedications(activityStr, patientID, patientName);

    scheduleData.push({
      startTime,
      endTime,
      activityTitle,
      medications,
    });
  });

  return scheduleData.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
};

export const parseScheduleDay = (
  dayValue,
  scheduleDate,
  patientID,
  patientName,
) => {
  if (dayValue == null || dayValue === '') return [];

  if (typeof dayValue === 'object' && !Array.isArray(dayValue)) {
    return parseScheduleObjectDay(dayValue, scheduleDate, patientID, patientName);
  }

  return parseScheduleString(dayValue, scheduleDate, patientID, patientName);
};
