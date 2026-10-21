// 날짜는 모두 'YYYY-MM-DD' 문자열로 다룹니다(시간대 문제를 피하기 위해 UTC 자정 기준으로 계산).

export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export function isValidDate(s: string): boolean {
  if (!DATE_RE.test(s)) return false
  const d = new Date(`${s}T00:00:00Z`)
  return !Number.isNaN(d.getTime()) && toISO(d) === s
}

export function toISO(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export function parseISO(s: string): Date {
  return new Date(`${s}T00:00:00Z`)
}

export function addDays(s: string, n: number): string {
  const d = parseISO(s)
  d.setUTCDate(d.getUTCDate() + n)
  return toISO(d)
}

export function diffDays(a: string, b: string): number {
  return Math.round((parseISO(a).getTime() - parseISO(b).getTime()) / 86400000)
}

/** 한국 시간(KST, UTC+9) 기준 오늘 */
export function todayKST(now = Date.now()): string {
  return toISO(new Date(now + 9 * 3600 * 1000))
}

/** 브라우저 로컬 시간 기준 오늘 */
export function todayLocal(): string {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

/** 주일(일요일)부터 시작하는 그 주의 7일 */
export function weekOf(s: string): string[] {
  const start = addDays(s, -parseISO(s).getUTCDay())
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

export const WEEKDAYS = ['주일', '월', '화', '수', '목', '금', '토']

export function weekday(s: string): number {
  return parseISO(s).getUTCDay()
}

export function formatKoreanDate(s: string): string {
  const d = parseISO(s)
  return `${d.getUTCFullYear()}년 ${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일 ${WEEKDAYS[d.getUTCDay()]}${d.getUTCDay() === 0 ? '' : '요일'}`
}

/** 부활절(그레고리력, Anonymous Gregorian algorithm) */
export function easter(year: number): string {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/** 해당 월의 n번째 일요일 */
export function nthSunday(year: number, month: number, n: number): string {
  const first = `${year}-${String(month).padStart(2, '0')}-01`
  const offset = (7 - weekday(first)) % 7
  return addDays(first, offset + (n - 1) * 7)
}
