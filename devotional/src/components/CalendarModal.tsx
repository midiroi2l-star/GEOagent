import { useState } from 'react'
import { addDays, todayLocal } from '../shared/dates'
import { usePersonal } from '../lib/store'
import { IconChevronLeft, IconChevronRight } from './Icons'
import Modal from './Modal'

const DOW = ['일', '월', '화', '수', '목', '금', '토']

function monthDays(year: number, month: number): (string | null)[] {
  const first = new Date(Date.UTC(year, month - 1, 1))
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate()
  const cells: (string | null)[] = Array(first.getUTCDay()).fill(null)
  const mm = String(month).padStart(2, '0')
  for (let d = 1; d <= days; d++) cells.push(`${year}-${mm}-${String(d).padStart(2, '0')}`)
  while (cells.length % 7) cells.push(null)
  return cells
}

export default function CalendarModal({ selected, onPick, onClose }: { selected: string; onPick: (d: string) => void; onClose: () => void }) {
  const [ym, setYm] = useState(() => ({ y: Number(selected.slice(0, 4)), m: Number(selected.slice(5, 7)) }))
  const { done, notes, bookmarks } = usePersonal()
  const today = todayLocal()
  const cells = monthDays(ym.y, ym.m)
  const shift = (n: number) =>
    setYm(({ y, m }) => {
      const t = y * 12 + (m - 1) + n
      return { y: Math.floor(t / 12), m: (t % 12) + 1 }
    })
  const monthDone = cells.filter((c) => c && done[c]).length

  return (
    <Modal title="날짜로 이동" onClose={onClose}>
      <div className="mb-4 flex items-center justify-between">
        <button onClick={() => shift(-1)} className="rounded-full p-2 hover:bg-black/5 dark:hover:bg-white/10" aria-label="이전 달">
          <IconChevronLeft />
        </button>
        <div className="text-center">
          <div className="text-lg font-bold">
            {ym.y}년 {ym.m}월
          </div>
          <div className="text-xs text-neutral-500">이번 달 묵상 완료 {monthDone}일</div>
        </div>
        <button onClick={() => shift(1)} className="rounded-full p-2 hover:bg-black/5 dark:hover:bg-white/10" aria-label="다음 달">
          <IconChevronRight />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-neutral-500">
        {DOW.map((d, i) => (
          <div key={d} className={`py-1 ${i === 0 ? 'text-rose-500' : ''}`}>
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((c, i) =>
          c ? (
            <button
              key={c}
              onClick={() => onPick(c)}
              className={`relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm transition
                ${c === selected ? 'bg-moss-600 font-bold text-white' : 'hover:bg-moss-50 dark:hover:bg-white/10'}
                ${c === today && c !== selected ? 'ring-2 ring-gold ring-inset font-bold' : ''}
                ${i % 7 === 0 && c !== selected ? 'text-rose-500' : ''}`}
            >
              {Number(c.slice(8))}
              <span className="absolute bottom-1 flex gap-0.5">
                {done[c] && <span className={`h-1.5 w-1.5 rounded-full ${c === selected ? 'bg-white' : 'bg-moss-500'}`} title="묵상 완료" />}
                {notes[c] && <span className="h-1.5 w-1.5 rounded-full bg-gold" title="노트" />}
                {bookmarks[c] && <span className="h-1.5 w-1.5 rounded-full bg-rose-400" title="북마크" />}
              </span>
            </button>
          ) : (
            <div key={`e${i}`} />
          ),
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-neutral-500">
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-moss-500" />완료</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-gold" />노트</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-400" />북마크</span>
      </div>

      <div className="mt-5 flex gap-2">
        <input
          type="date"
          defaultValue={selected}
          max={addDays(today, 365)}
          onChange={(e) => e.target.value && onPick(e.target.value)}
          className="min-w-0 flex-1 rounded-xl border border-black/10 bg-transparent px-3 py-2.5 text-sm dark:border-white/15"
          aria-label="날짜 직접 선택"
        />
        <button onClick={() => onPick(today)} className="rounded-xl bg-moss-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-moss-700">
          오늘
        </button>
      </div>
    </Modal>
  )
}
