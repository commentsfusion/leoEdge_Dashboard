// utils/payCycle.js
export function getPayCycleForDate(date = new Date()) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth(); // 0-based
  const day = d.getDate();

  let cycleStart;
  let cycleEnd;

  if (day >= 18) {
    // current month 18 → next month 17
    cycleStart = new Date(year, month, 18, 0, 0, 0, 0);
    cycleEnd = new Date(year, month + 1, 17, 23, 59, 59, 999);
  } else {
    // previous month 18 → current month 17
    cycleStart = new Date(year, month - 1, 18, 0, 0, 0, 0);
    cycleEnd = new Date(year, month, 17, 23, 59, 59, 999);
  }

  const cycle_key =
    cycleStart.toISOString().slice(0, 10) +
    "_" +
    cycleEnd.toISOString().slice(0, 10);

  return { cycleStart, cycleEnd, cycle_key };
}
