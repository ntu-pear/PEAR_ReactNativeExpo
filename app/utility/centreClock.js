// PEAR scheduler staging deployment TZ=Asia/Singapore (UTC+08:00, no DST).
export const CENTRE_TIMEZONE = 'Asia/Singapore';
const OFFSET_MS = 8 * 60 * 60 * 1000;
export const centreDay = (instant = new Date()) =>
  new Date(instant.getTime() + OFFSET_MS).toISOString().slice(0, 10);
export const nextCentreDay = (day) =>
  new Date(Date.parse(`${day}T00:00:00Z`) + 86400000)
    .toISOString()
    .slice(0, 10);
export const centreInstant = (day, hhmm = '0000') =>
  new Date(`${day}T${hhmm.slice(0, 2)}:${hhmm.slice(2)}:00+08:00`);
