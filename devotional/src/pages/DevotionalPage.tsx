import { type ReactNode, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addDays, formatKoreanDate, todayLocal } from '../shared/dates'
import { readingFor } from '../shared/plan'
import type { Devotional, DevotionalResponse, Verse } from '../shared/types'
import CardNewsModal from '../components/CardNewsModal'
import Header from '../components/Header'
import {
  IconBookmark, IconCheck, IconChevronLeft, IconChevronRight, IconCopy, IconHeart, IconImage, IconPrint, IconShare, IconSpeaker, IconStop,
} from '../components/Icons'
import SongCard from '../components/SongCard'
import { useToast } from '../components/Toast'
import { cached, loadDevotional, prefetch, sendAmen } from '../lib/api'
import { copyText, shareOrCopy } from '../lib/open'
import { speak, speechSupported, stopSpeaking, useSpeaking } from '../lib/speech'
import { markAmened, rememberTitle, setNote, toggleBookmark, toggleDone, usePersonal } from '../lib/store'
import { devotionalToSpeech, devotionalToText } from '../lib/text'

function Paragraphs({ text, className = '' }: { text: string; className?: string }) {
  return (
    <>
      {text
        .split(/\n+/)
        .filter((p) => p.trim())
        .map((p, i) => (
          <p key={i} className={`mb-4 leading-[1.9] last:mb-0 ${className}`}>
            {p}
          </p>
        ))}
    </>
  )
}

function Section({ label, children, action }: { label: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="mt-10">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-bold tracking-wider text-gold">
          <span className="h-0.5 w-5 bg-gold" />
          {label}
        </h2>
        {action}
      </div>
      {children}
    </section>
  )
}

function ListenButton({ id, text, label }: { id: string; text: string; label: string }) {
  const speaking = useSpeaking()
  if (!speechSupported) return null
  const on = speaking === id
  return (
    <button onClick={() => speak(id, text)} className={`no-print flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${on ? 'bg-moss-600 text-white' : 'bg-moss-50 text-moss-700 hover:bg-moss-100 dark:bg-white/10 dark:text-moss-100'}`}>
      {on ? <IconStop width={14} height={14} /> : <IconSpeaker width={14} height={14} />}
      {on ? '멈춤' : label}
    </button>
  )
}

function PassageCard({ verses, reference, source }: { verses: Verse[]; reference: string; source?: 'krv' | 'ai' }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-night-card">
      <div className="mb-3 font-bold text-moss-700 dark:text-moss-100">{reference}</div>
      <div className="font-serif text-[1.05rem] leading-[2]">
        {verses.map((v) => (
          <p key={v.v} className="mb-1.5">
            <sup className="mr-1.5 font-sans text-xs font-bold text-gold">{v.v}</sup>
            {v.text}
          </p>
        ))}
      </div>
      <div className="mt-3 text-right text-[11px] text-neutral-400">
        {source === 'ai' ? '※ 성경 본문 서버 연결 실패로 AI가 인용한 본문입니다. 성경에서 확인해 주세요.' : '개역한글'}
      </div>
    </div>
  )
}

function Loading({ status, startedAt }: { status: DevotionalResponse['status'] | 'loading'; startedAt: number }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const sec = Math.floor((now - startedAt) / 1000)
  const steps = ['본문의 배경과 문맥을 살피는 중', '원어와 구조를 따라 강해를 쓰는 중', '오늘의 적용과 기도를 준비하는 중', '말씀에 어울리는 찬양을 고르는 중']
  return (
    <div className="mt-8 rounded-2xl border border-moss-600/15 bg-moss-50/70 p-6 text-center dark:border-white/10 dark:bg-white/5">
      <span className="mx-auto mb-4 block h-9 w-9 animate-spin rounded-full border-[3px] border-moss-600 border-t-transparent" />
      <p className="font-bold text-moss-800 dark:text-moss-100">
        {status === 'loading' ? '말씀을 불러오는 중…' : '오늘의 묵상을 준비하고 있습니다'}
      </p>
      {status !== 'loading' && (
        <>
          <p className="mt-1 text-sm text-moss-700/80 dark:text-moss-100/70">{steps[Math.min(steps.length - 1, Math.floor(sec / 15))]}… ({sec}초)</p>
          <p className="mt-3 text-xs text-neutral-500">처음 여는 날짜는 1~2분 정도 걸릴 수 있어요. 그동안 본문을 먼저 읽어 보세요.</p>
          <div className="mx-auto mt-6 max-w-sm space-y-2.5 text-left">
            <div className="skeleton h-4 w-2/3" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-5/6" />
          </div>
        </>
      )}
    </div>
  )
}

export default function DevotionalPage({ date }: { date: string }) {
  const navigate = useNavigate()
  const reading = readingFor(date)
  const [resp, setResp] = useState<DevotionalResponse | null>(() => cached(date) ?? null)
  const [error, setError] = useState<string | null>(null)
  const [startedAt, setStartedAt] = useState(() => Date.now())
  const [reload, setReload] = useState(0)
  const [cardOpen, setCardOpen] = useState(false)
  const personal = usePersonal()
  const toast = useToast()
  const d: Devotional | undefined = resp?.date === date ? resp.devotional : undefined

  useEffect(() => {
    const ac = new AbortController()
    loadDevotional(date, setResp, ac.signal)
      .then((r) => {
        if (r.status === 'ready') prefetch(addDays(date, 1))
      })
      .catch((e: Error) => {
        if (e.name !== 'AbortError') setError(navigator.onLine ? e.message : '오프라인 상태입니다. 한 번 열어 본 날짜는 오프라인에서도 볼 수 있어요.')
      })
    return () => ac.abort()
  }, [date, reload])

  // 날짜가 바뀌면 컴포넌트가 key로 새로 만들어지므로, 여기서는 화면 정리만 합니다.
  useEffect(() => {
    stopSpeaking()
    window.scrollTo({ top: 0 })
  }, [])

  const retry = () => {
    setError(null)
    setResp(null)
    setStartedAt(Date.now())
    setReload((n) => n + 1)
  }

  useEffect(() => {
    document.title = d ? `${d.title} | 매일 묵상 ${date}` : `매일 묵상 | ${date}`
    if (d) rememberTitle(date, d.title, d.reference)
  }, [d, date])

  // ← → 키 / 좌우 스와이프로 이전·다음 날
  const touch = useRef<{ x: number; y: number } | null>(null)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest('input, textarea, [role="dialog"]')) return
      if (e.key === 'ArrowLeft') navigate(`/d/${addDays(date, -1)}`)
      if (e.key === 'ArrowRight') navigate(`/d/${addDays(date, 1)}`)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [date, navigate])

  const pageUrl = `${location.origin}/d/${date}`
  const isDone = !!personal.done[date]
  const amened = !!personal.amened[date]
  const bookmarked = !!personal.bookmarks[date]
  const verses = d?.passage.verses ?? resp?.verses
  const status = d ? 'ready' : (resp?.status ?? 'loading')

  const onAmen = async () => {
    if (amened) return toast.show('이미 아멘으로 함께하셨어요 🙏')
    markAmened(date)
    try {
      const stats = await sendAmen(date)
      setResp((r) => (r ? { ...r, stats } : r))
    } catch {
      /* 통계 실패는 조용히 무시 */
    }
    toast.show('아멘! 🙏')
  }

  const onShare = async () => {
    const r = await shareOrCopy({ title: d ? `[매일 묵상] ${d.title} (${d.reference})` : `[매일 묵상] ${reading.reference}`, text: d?.keyVerse.text ?? '', url: pageUrl })
    if (r === 'copied') toast.show('링크를 복사했어요')
  }

  return (
    <div className="min-h-dvh pb-32">
      <Header date={date} />

      <main
        className="mx-auto max-w-2xl px-5"
        onTouchStart={(e) => (touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
        onTouchEnd={(e) => {
          const s = touch.current
          touch.current = null
          if (!s) return
          const dx = e.changedTouches[0].clientX - s.x
          const dy = e.changedTouches[0].clientY - s.y
          if (Math.abs(dx) > 80 && Math.abs(dx) > Math.abs(dy) * 2) navigate(`/d/${addDays(date, dx > 0 ? -1 : 1)}`)
        }}
      >
        {/* 제목 영역 */}
        <div className="pt-7">
          <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-500">
            <span>{formatKoreanDate(date)}</span>
            {reading.occasion ? (
              <span className="rounded-full bg-gold px-2.5 py-0.5 text-xs font-bold text-white">{reading.occasion}</span>
            ) : (
              <span className="rounded-full bg-moss-50 px-2.5 py-0.5 text-xs text-moss-700 dark:bg-white/10 dark:text-moss-100">{reading.season}</span>
            )}
            {date === todayLocal() && <span className="text-xs font-bold text-gold">TODAY</span>}
          </div>
          <h1 className="mt-3 font-serif text-[1.85rem] font-bold leading-tight text-moss-800 dark:text-white">
            {d?.title ?? reading.reference}
          </h1>
          {d && <div className="mt-2 font-medium text-moss-600 dark:text-moss-100">{d.reference}</div>}
          {d && <p className="mt-4 leading-relaxed text-neutral-600 dark:text-neutral-300">{d.summary}</p>}
        </div>

        {/* 본문 */}
        {verses?.length ? (
          <Section label="오늘의 본문" action={<ListenButton id={`passage-${date}`} text={`${reading.reference}. ${verses.map((v) => v.text).join(' ')}`} label="본문 듣기" />}>
            <PassageCard verses={verses} reference={reading.reference} source={d?.passage.source} />
          </Section>
        ) : null}

        {error && (
          <div className="mt-8 rounded-2xl bg-rose-50 p-5 text-center text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">
            <p>{error}</p>
            <button onClick={retry} className="mt-3 rounded-full bg-rose-600 px-4 py-1.5 font-bold text-white">
              다시 시도
            </button>
          </div>
        )}

        {!d && !error && resp?.status === 'unavailable' && (
          <div className="mt-8 rounded-2xl bg-amber-50 p-5 text-center text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
            <p>{resp.message}</p>
            <button onClick={retry} className="mt-3 rounded-full bg-amber-600 px-4 py-1.5 font-bold text-white">
              다시 시도
            </button>
          </div>
        )}

        {!d && !error && status !== 'unavailable' && <Loading status={status} startedAt={startedAt} />}

        {d && (
          <>
            <Section label="핵심 구절">
              <blockquote className="relative rounded-2xl border-l-4 border-gold bg-gold-soft/60 p-5 pl-6 dark:bg-gold/10">
                <p className="font-serif text-lg font-semibold leading-relaxed text-moss-800 dark:text-gold-soft">“{d.keyVerse.text}”</p>
                <footer className="mt-2 text-sm text-neutral-500">— {d.keyVerse.ref}</footer>
              </blockquote>
            </Section>

            <Section label="배경과 문맥">
              <Paragraphs text={d.background} className="text-neutral-700 dark:text-neutral-300" />
            </Section>

            <Section label="말씀 강해" action={<ListenButton id={`all-${date}`} text={devotionalToSpeech(d)} label="묵상 전체 듣기" />}>
              <Paragraphs text={d.exposition.intro} />
              {d.exposition.sections.map((s, i) => (
                <div key={i} className="mt-7">
                  <h3 className="mb-3 flex gap-2 font-serif text-xl font-bold leading-snug text-moss-700 dark:text-moss-100">
                    <span className="text-gold">{i + 1}.</span>
                    <span>{s.heading}</span>
                  </h3>
                  <Paragraphs text={s.body} />
                </div>
              ))}
              <div className="mt-8 rounded-2xl bg-moss-600 p-5 text-white dark:bg-moss-800">
                <h3 className="mb-2 font-serif text-lg font-bold">✝ 그리스도와 복음</h3>
                <Paragraphs text={d.exposition.christ} className="text-white/90" />
              </div>
            </Section>

            <Section label="오늘의 적용">
              <ol className="space-y-3">
                {d.application.map((a, i) => (
                  <li key={i} className="flex gap-3 rounded-2xl bg-white p-4 shadow-sm dark:bg-night-card">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-moss-600 text-sm font-bold text-white">{i + 1}</span>
                    <span className="leading-relaxed">{a}</span>
                  </li>
                ))}
              </ol>
            </Section>

            <Section label="묵상 질문">
              <ul className="space-y-2.5">
                {d.questions.map((q, i) => (
                  <li key={i} className="flex gap-2 leading-relaxed">
                    <span className="font-bold text-gold">Q{i + 1}.</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </Section>

            <Section label="오늘의 기도" action={<ListenButton id={`prayer-${date}`} text={d.prayer} label="기도 듣기" />}>
              <div className="rounded-2xl border border-black/5 bg-white p-5 font-serif leading-[2] shadow-sm dark:border-white/10 dark:bg-night-card">
                <Paragraphs text={d.prayer} />
              </div>
            </Section>

            <Section label="오늘의 찬양">
              <div className="grid gap-4 sm:grid-cols-2">
                <SongCard kind="hymn" song={d.hymn} />
                <SongCard kind="ccm" song={d.ccm} />
              </div>
            </Section>
          </>
        )}

        {/* 개인 노트 — 강해 생성 여부와 상관없이 사용 가능 */}
        <Section label="나의 묵상 노트">
          <textarea
            value={personal.notes[date] ?? ''}
            onChange={(e) => setNote(date, e.target.value)}
            placeholder="오늘 말씀을 통해 받은 은혜, 결단, 기도 제목을 적어 보세요. (이 기기에만 저장됩니다)"
            rows={5}
            className="w-full resize-y rounded-2xl border border-black/10 bg-white p-4 leading-relaxed outline-none placeholder:text-neutral-400 focus:border-moss-500 dark:border-white/10 dark:bg-night-card"
          />
        </Section>

        {d && (
          <div className="no-print mt-6 flex flex-wrap justify-center gap-2 text-sm">
            <button
              onClick={async () => toast.show((await copyText(devotionalToText(d, pageUrl))) ? '전체 내용을 복사했어요' : '복사하지 못했어요')}
              className="flex items-center gap-1.5 rounded-full border border-black/10 px-4 py-2 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
            >
              <IconCopy width={16} height={16} /> 전체 텍스트 복사
            </button>
            <button onClick={() => window.print()} className="flex items-center gap-1.5 rounded-full border border-black/10 px-4 py-2 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10">
              <IconPrint width={16} height={16} /> 인쇄 / PDF
            </button>
          </div>
        )}

        {resp?.stats && (
          <p className="mt-6 text-center text-xs text-neutral-400">
            함께 읽은 횟수 {resp.stats.views.toLocaleString('ko-KR')} · 아멘 {resp.stats.amens.toLocaleString('ko-KR')}
          </p>
        )}

        {/* 이전 / 다음 날 */}
        <div className="no-print mt-8 grid grid-cols-2 gap-3">
          <button onClick={() => navigate(`/d/${addDays(date, -1)}`)} className="flex items-center gap-2 rounded-2xl bg-white p-4 text-left shadow-sm hover:shadow dark:bg-night-card">
            <IconChevronLeft className="shrink-0 text-gold" />
            <span className="min-w-0">
              <span className="block text-xs text-neutral-500">이전 날</span>
              <span className="block truncate text-sm font-bold">{readingFor(addDays(date, -1)).reference}</span>
            </span>
          </button>
          <button onClick={() => navigate(`/d/${addDays(date, 1)}`)} className="flex items-center justify-end gap-2 rounded-2xl bg-white p-4 text-right shadow-sm hover:shadow dark:bg-night-card">
            <span className="min-w-0">
              <span className="block text-xs text-neutral-500">다음 날</span>
              <span className="block truncate text-sm font-bold">{readingFor(addDays(date, 1)).reference}</span>
            </span>
            <IconChevronRight className="shrink-0 text-gold" />
          </button>
        </div>
      </main>

      {/* 하단 액션 바 */}
      <div className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-black/5 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur dark:border-white/10 dark:bg-night-card/95">
        <div className="mx-auto grid max-w-2xl grid-cols-5 px-2 py-1.5 text-[11px]">
          <button onClick={() => { toggleDone(date); if (!isDone) toast.show('오늘의 묵상을 완료했어요 ✨') }} className={`flex flex-col items-center gap-0.5 rounded-xl py-1.5 ${isDone ? 'text-moss-600 dark:text-moss-100' : 'text-neutral-500'}`}>
            <span className={`flex h-7 w-7 items-center justify-center rounded-full ${isDone ? 'bg-moss-600 text-white' : 'border border-current'}`}>
              <IconCheck width={16} height={16} />
            </span>
            {isDone ? '완료함' : '묵상 완료'}
          </button>
          <button onClick={onAmen} className={`flex flex-col items-center gap-0.5 rounded-xl py-1.5 ${amened ? 'text-rose-500' : 'text-neutral-500'}`}>
            <IconHeart width={26} height={26} fill={amened ? 'currentColor' : 'none'} />
            아멘{resp?.stats?.amens ? ` ${resp.stats.amens}` : ''}
          </button>
          <button
            onClick={() => {
              toggleBookmark(date, { title: d?.title ?? reading.reference, reference: reading.reference })
              toast.show(bookmarked ? '북마크를 해제했어요' : '북마크에 저장했어요')
            }}
            className={`flex flex-col items-center gap-0.5 rounded-xl py-1.5 ${bookmarked ? 'text-gold' : 'text-neutral-500'}`}
          >
            <IconBookmark width={26} height={26} fill={bookmarked ? 'currentColor' : 'none'} />
            북마크
          </button>
          <button onClick={onShare} className="flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-neutral-500">
            <IconShare width={26} height={26} />
            공유
          </button>
          <button onClick={() => (d ? setCardOpen(true) : toast.show('묵상이 준비되면 이미지를 만들 수 있어요'))} className="flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-neutral-500">
            <IconImage width={26} height={26} />
            카드 이미지
          </button>
        </div>
      </div>

      {cardOpen && d && <CardNewsModal devotional={d} onClose={() => setCardOpen(false)} />}
      {toast.node}
    </div>
  )
}
