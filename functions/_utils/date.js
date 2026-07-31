// 동호회 기준 시간대(KST, UTC+9)로 "오늘"을 계산한다.
export function getKstNow() {
  const now = new Date();
  return new Date(now.getTime() + 9 * 60 * 60 * 1000);
}

export function getAllowedMonths() {
  const kst = getKstNow();
  const year = kst.getUTCFullYear();
  const month = kst.getUTCMonth() + 1; // 1-12
  let prevYear = year;
  let prevMonth = month - 1;
  if (prevMonth === 0) {
    prevMonth = 12;
    prevYear -= 1;
  }
  return [
    { year, month },
    { year: prevYear, month: prevMonth },
  ];
}

export function isMonthAllowed(year, month) {
  return getAllowedMonths().some((m) => m.year === year && m.month === month);
}
