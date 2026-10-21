import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { WEEKDAYS, addDays, parseISO, todayLocal, weekOf } from '../shared/dates'
import { usePersonal } from '../lib/store'
import CalendarModal from './CalendarModal'
import { IconBook, IconCalendar, IconChevronLeft, IconChevronRight, IconSettings, IconUser } from './Icons'
import SettingsModal from './SettingsModal'

/** 상단 앱 바 + 이번 주 네비게이션 바 */
export default function Header({ date }: { date?: string }) {
  const navigate = useNavigate()
  const today = todayLocal()
  const selected = date ?? today
  const [calendar, setCalendar] = useState(false)
  const [settings, setSettings] = useState(false)
  const { done } = usePersonal()
  const week = weekOf(selected)
  const d = parseISO(selected)
  const weekNo = Math.ceil((d.getUTCDate() + new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).getUTCDay()) / 7)
  const go = (to: string) => navigate(`/d/${to}`)

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-paper/90 pt-[env(safe-area-inset-top)] backdrop-blur-md dark:border-white/10 dark:bg-night/90">
      <div className="mx-auto flex max-w-2xl items-center gap-1 px-3 py-2">
        <Link to={`/d/${today}`} className="flex items-center gap-2 rounded-xl px-2 py-1.5 font-serif text-lg font-bold text-moss-700 dark:text-moss-100">
          <IconBook className="text-gold" />
          매일 묵상
        </Link>
        <div className="flex-1" />
        {date && date !== today && (
          <button onClick={() => go(today)} className="rounded-full border border-moss-600/30 px-3 py-1 text-xs font-bold text-moss-700 hover:bg-moss-50 dark:text-moss-100 dark:hover:bg-white/10">
            오늘
          </button>
        )}
        <button onClick={() => setCalendar(true)} className="rounded-full p-2 hover:bg-black/5 dark:hover:bg-white/10" aria-label="달력 열기">
          <IconCalendar />
        </button>
        <Link to="/my" className="rounded-full p-2 hover:bg-black/5 dark:hover:bg-white/10" aria-label="나의 묵상">
          <IconUser />
        </Link>
        <button onClick={() => setSettings(true)} className="rounded-full p-2 hover:bg-black/5 dark:hover:bg-white/10" aria-label="보기 설정">
          <IconSettings />
        </button>
      </div>

      {date && (
        <nav className="mx-auto max-w-2xl px-2 pb-2" aria-label="이번 주">
          <div className="mb-1 flex items-center justify-between px-1 text-xs text-neutral-500">
            <button onClick={() => go(addDays(selected, -7))} className="flex items-center rounded-full py-1 pr-2 hover:text-moss-600" aria-label="지난 주">
              <IconChevronLeft width={16} height={16} /> 지난 주
            </button>
            <button onClick={() => setCalendar(true)} className="font-semibold text-neutral-600 hover:text-moss-600 dark:text-neutral-300">
              {d.getUTCFullYear()}년 {d.getUTCMonth() + 1}월 {weekNo}주
            </button>
            <button onClick={() => go(addDays(selected, 7))} className="flex items-center rounded-full py-1 pl-2 hover:text-moss-600" aria-label="다음 주">
              다음 주 <IconChevronRight width={16} height={16} />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {week.map((w, i) => {
              const isSel = w === selected
              const isToday = w === today
              return (
                <button
                  key={w}
                  onClick={() => go(w)}
                  aria-current={isSel ? 'date' : undefined}
                  className={`relative flex flex-col items-center rounded-2xl py-1.5 transition
                    ${isSel ? 'bg-moss-600 text-white shadow-md shadow-moss-600/25' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
                >
                  <span className={`text-[11px] ${isSel ? 'text-white/80' : i === 0 ? 'text-rose-500' : 'text-neutral-500'}`}>{WEEKDAYS[i]}</span>
                  <span className={`text-base font-bold leading-6 ${isToday && !isSel ? 'text-gold' : ''}`}>{Number(w.slice(8))}</span>
                  <span className={`mt-0.5 h-1.5 w-1.5 rounded-full ${done[w] ? (isSel ? 'bg-white' : 'bg-moss-500') : isToday ? (isSel ? 'bg-gold-soft' : 'bg-gold') : 'bg-transparent'}`} />
                </button>
              )
            })}
          </div>
        </nav>
      )}

      {calendar && (
        <CalendarModal
          selected={selected}
          onClose={() => setCalendar(false)}
          onPick={(p) => {
            setCalendar(false)
            go(p)
          }}
        />
      )}
      {settings && <SettingsModal onClose={() => setSettings(false)} />}
    </header>
  )
}
