import { useSyncExternalStore } from 'react'

// 개인 기록(완료·노트·북마크·설정)은 브라우저(localStorage)에만 저장됩니다 — 로그인 없이 바로 사용.

export interface Settings {
  theme: 'system' | 'light' | 'dark'
  fontScale: number
}

export interface Bookmark {
  title: string
  reference: string
  savedAt: number
}

export interface PersonalData {
  done: Record<string, number>
  notes: Record<string, string>
  bookmarks: Record<string, Bookmark>
  /** 아멘을 이미 누른 날짜(중복 방지) */
  amened: Record<string, true>
  /** 카드/노트 목록 표시용 날짜별 제목 캐시 */
  titles: Record<string, { title: string; reference: string }>
  settings: Settings
}

const KEY = 'daily-devotional:v1'

const EMPTY: PersonalData = {
  done: {},
  notes: {},
  bookmarks: {},
  amened: {},
  titles: {},
  settings: { theme: 'system', fontScale: 1 },
}

function load(): PersonalData {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PersonalData>
      return { ...EMPTY, ...parsed, settings: { ...EMPTY.settings, ...parsed.settings } }
    }
  } catch {
    /* 비공개 모드 등에서 저장소 접근이 막힌 경우 */
  }
  return EMPTY
}

let state = load()
const listeners = new Set<() => void>()

export function update(fn: (s: PersonalData) => PersonalData) {
  state = fn(state)
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* 저장 실패는 무시(메모리 상태는 유지) */
  }
  listeners.forEach((l) => l())
}

export function getState() {
  return state
}

export function replaceAll(next: PersonalData) {
  update(() => ({ ...EMPTY, ...next, settings: { ...EMPTY.settings, ...next.settings } }))
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function usePersonal(): PersonalData {
  return useSyncExternalStore(subscribe, getState, getState)
}

export function toggleDone(date: string) {
  update((s) => {
    const done = { ...s.done }
    if (done[date]) delete done[date]
    else done[date] = Date.now()
    return { ...s, done }
  })
}

export function setNote(date: string, text: string) {
  update((s) => {
    const notes = { ...s.notes }
    if (text.trim()) notes[date] = text
    else delete notes[date]
    return { ...s, notes }
  })
}

export function toggleBookmark(date: string, info: { title: string; reference: string }) {
  update((s) => {
    const bookmarks = { ...s.bookmarks }
    if (bookmarks[date]) delete bookmarks[date]
    else bookmarks[date] = { ...info, savedAt: Date.now() }
    return { ...s, bookmarks }
  })
}

export function rememberTitle(date: string, title: string, reference: string) {
  if (state.titles[date]?.title === title) return
  update((s) => ({ ...s, titles: { ...s.titles, [date]: { title, reference } } }))
}

export function markAmened(date: string) {
  update((s) => ({ ...s, amened: { ...s.amened, [date]: true } }))
}

export function setSettings(patch: Partial<Settings>) {
  update((s) => ({ ...s, settings: { ...s.settings, ...patch } }))
}

/** 오늘(또는 오늘 아직 안 했으면 어제)부터 거꾸로 이어진 연속 묵상 일수 */
export function streak(done: Record<string, number>, today: string, addDays: (d: string, n: number) => string): number {
  let d = done[today] ? today : addDays(today, -1)
  let n = 0
  while (done[d]) {
    n++
    d = addDays(d, -1)
  }
  return n
}
