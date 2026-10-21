import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { addDays, formatKoreanDate, todayLocal } from '../shared/dates'
import { readingFor } from '../shared/plan'
import Header from '../components/Header'
import { useToast } from '../components/Toast'
import { type PersonalData, replaceAll, streak, usePersonal } from '../lib/store'

type Tab = 'notes' | 'bookmarks' | 'plan'

function download(name: string, text: string, type = 'text/plain') {
  const url = URL.createObjectURL(new Blob([text], { type: `${type};charset=utf-8` }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export default function MyPage() {
  const data = usePersonal()
  const today = todayLocal()
  const [tab, setTab] = useState<Tab>('notes')
  const [planMonth, setPlanMonth] = useState(today.slice(0, 7))
  const fileRef = useRef<HTMLInputElement>(null)
  const toast = useToast()

  useEffect(() => {
    document.title = '나의 묵상 | 매일 묵상'
  }, [])

  const doneDates = Object.keys(data.done)
  const thisMonth = doneDates.filter((d) => d.startsWith(today.slice(0, 7))).length
  const current = streak(data.done, today, addDays)
  let best = 0
  for (const d of doneDates) {
    if (data.done[addDays(d, -1)]) continue
    let n = 0
    while (data.done[addDays(d, n)]) n++
    best = Math.max(best, n)
  }

  const notes = Object.entries(data.notes).sort(([a], [b]) => b.localeCompare(a))
  const bookmarks = Object.entries(data.bookmarks).sort(([a], [b]) => b.localeCompare(a))
  const titleOf = (d: string) => data.titles[d]?.title ?? readingFor(d).reference

  const [py, pm] = planMonth.split('-').map(Number)
  const daysInMonth = new Date(Date.UTC(py, pm, 0)).getUTCDate()
  const planDays = Array.from({ length: daysInMonth }, (_, i) => `${planMonth}-${String(i + 1).padStart(2, '0')}`)

  const exportNotes = () => {
    const text = notes
      .map(([d, n]) => `■ ${formatKoreanDate(d)} — ${titleOf(d)} (${readingFor(d).reference})\n${n}\n`)
      .join('\n')
    download(`나의묵상노트_${today}.txt`, text || '아직 작성한 노트가 없습니다.')
  }

  const backup = () => download(`매일묵상_백업_${today}.json`, JSON.stringify(data, null, 2), 'application/json')

  const restore = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text()) as PersonalData
      if (typeof parsed !== 'object' || !parsed.done) throw new Error()
      replaceAll(parsed)
      toast.show('백업을 복원했어요')
    } catch {
      toast.show('올바른 백업 파일이 아니에요')
    }
  }

  return (
    <div className="min-h-dvh pb-16">
      <Header />
      <main className="mx-auto max-w-2xl px-5 pt-6">
        <h1 className="font-serif text-2xl font-bold text-moss-800 dark:text-white">나의 묵상</h1>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ['연속 묵상', `${current}일`, current ? '🔥' : '🌱'],
            ['최장 연속', `${best}일`, '🏆'],
            ['이번 달', `${thisMonth}일`, '📅'],
            ['전체 완료', `${doneDates.length}일`, '✅'],
          ].map(([label, value, emoji]) => (
            <div key={label} className="rounded-2xl bg-white p-4 shadow-sm dark:bg-night-card">
              <div className="text-xs text-neutral-500">
                {emoji} {label}
              </div>
              <div className="mt-1 text-2xl font-bold text-moss-700 dark:text-moss-100">{value}</div>
            </div>
          ))}
        </div>

        {!data.done[today] && (
          <Link to={`/d/${today}`} className="mt-4 block rounded-2xl bg-moss-600 p-4 text-center font-bold text-white hover:bg-moss-700">
            오늘의 묵상 하러 가기 →
          </Link>
        )}

        <div className="mt-8 grid grid-cols-3 gap-1 rounded-2xl bg-black/5 p-1 text-sm dark:bg-white/5">
          {([
            ['notes', `노트 ${notes.length}`],
            ['bookmarks', `북마크 ${bookmarks.length}`],
            ['plan', '본문표'],
          ] as [Tab, string][]).map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)} className={`rounded-xl py-2 ${tab === t ? 'bg-white font-bold shadow dark:bg-night' : 'text-neutral-500'}`}>
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4">
          {tab === 'notes' &&
            (notes.length ? (
              <ul className="space-y-3">
                {notes.map(([d, n]) => (
                  <li key={d}>
                    <Link to={`/d/${d}`} className="block rounded-2xl bg-white p-4 shadow-sm hover:shadow dark:bg-night-card">
                      <div className="text-xs text-neutral-500">{formatKoreanDate(d)} · {readingFor(d).reference}</div>
                      <div className="mt-0.5 font-bold">{titleOf(d)}</div>
                      <p className="mt-2 line-clamp-3 whitespace-pre-line text-sm text-neutral-600 dark:text-neutral-300">{n}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-10 text-center text-sm text-neutral-500">아직 작성한 묵상 노트가 없어요.</p>
            ))}

          {tab === 'bookmarks' &&
            (bookmarks.length ? (
              <ul className="space-y-2">
                {bookmarks.map(([d, b]) => (
                  <li key={d}>
                    <Link to={`/d/${d}`} className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm hover:shadow dark:bg-night-card">
                      <span>
                        <span className="block text-xs text-neutral-500">{formatKoreanDate(d)}</span>
                        <span className="block font-bold">{data.titles[d]?.title ?? b.title}</span>
                      </span>
                      <span className="text-sm text-moss-600 dark:text-moss-100">{b.reference}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-10 text-center text-sm text-neutral-500">북마크한 묵상이 없어요. 하단의 북마크 버튼으로 저장해 보세요.</p>
            ))}

          {tab === 'plan' && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <input type="month" value={planMonth} onChange={(e) => e.target.value && setPlanMonth(e.target.value)} className="rounded-xl border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/15" aria-label="월 선택" />
                <span className="text-xs text-neutral-500">1년 동안 성경 전체를 따라가는 본문표</span>
              </div>
              <ul className="divide-y divide-black/5 overflow-hidden rounded-2xl bg-white shadow-sm dark:divide-white/10 dark:bg-night-card">
                {planDays.map((d) => {
                  const r = readingFor(d)
                  return (
                    <li key={d}>
                      <Link to={`/d/${d}`} className={`flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-moss-50 dark:hover:bg-white/5 ${d === today ? 'bg-gold-soft/50 dark:bg-gold/10' : ''}`}>
                        <span className="w-14 shrink-0 text-neutral-500">{Number(d.slice(5, 7))}/{Number(d.slice(8))}</span>
                        <span className="flex-1 font-medium">{r.reference}</span>
                        {r.occasion && <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-white">{r.occasion}</span>}
                        {data.done[d] && <span className="text-moss-600">✓</span>}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-10 rounded-2xl border border-black/5 p-4 text-sm dark:border-white/10">
          <div className="font-bold">기록 관리</div>
          <p className="mt-1 text-xs text-neutral-500">개인 기록은 이 기기의 브라우저에만 저장됩니다. 기기를 바꾸기 전에 백업하세요.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={exportNotes} className="rounded-full border border-black/10 px-4 py-2 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10">노트 텍스트로 내보내기</button>
            <button onClick={backup} className="rounded-full border border-black/10 px-4 py-2 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10">전체 백업(JSON)</button>
            <button onClick={() => fileRef.current?.click()} className="rounded-full border border-black/10 px-4 py-2 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10">백업 복원</button>
            <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && restore(e.target.files[0])} />
          </div>
        </div>
      </main>
      {toast.node}
    </div>
  )
}
