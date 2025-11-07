// utils/date.js
export function toYMD(date = new Date()) {
  return date.toISOString().slice(0, 10);
}
