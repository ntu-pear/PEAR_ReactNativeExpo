import { centreDay } from 'app/utility/centreClock';

// Match ActivityCard's 180dp width and 1dp margin on each side.
export const DASHBOARD_CARD_PITCH = 182;
export const calendarDay = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(date.getDate()).padStart(2, '0')}`;
export const calendarDate = (day) => {
  const [year, month, date] = day.slice(0, 10).split('-').map(Number);
  return new Date(year, month - 1, date, 12);
};
const displayMinutes = (value) => {
  const date = new Date(value);
  return date.getHours() * 60 + date.getMinutes();
};
export const dashboardTimeline = (activities, day, now = new Date()) => {
  if (day !== centreDay(now) || !activities.length) return null;
  const shifted = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  const minute = shifted.getUTCHours() * 60 + shifted.getUTCMinutes();
  for (let index = 0; index < activities.length; index += 1) {
    const start = displayMinutes(activities[index].startTime);
    const end = displayMinutes(activities[index].endTime);
    if (end <= start) continue;
    if (minute >= start && minute < end) {
      return (index + (minute - start) / (end - start)) * DASHBOARD_CARD_PITCH;
    }
  }
  return null;
};
export const dashboardScrollOffset = (position, count, viewport) => {
  if (position == null || viewport <= 0) return 0;
  return Math.max(
    0,
    Math.min(position - viewport / 3, count * DASHBOARD_CARD_PITCH - viewport),
  );
};
