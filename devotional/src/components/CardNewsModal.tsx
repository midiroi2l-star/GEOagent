import { useEffect, useState } from 'react'
import type { Devotional } from '../shared/types'
import { renderCardImage } from '../lib/cardImage'
import Modal from './Modal'

export default function CardNewsModal({ devotional, onClose }: { devotional: Devotional; onClose: () => void }) {
  const [mode, setMode] = useState<'full' | 'summary'>('full')
  const [result, setResult] = useState<{ mode: string; blob: Blob; url: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const ready = result?.mode === mode ? result : null

  useEffect(() => {
    let cancelled = false
    let made: string | null = null
    renderCardImage(devotional, mode, location.host)
      .then((blob) => {
        if (cancelled) return
        made = URL.createObjectURL(blob)
        setResult({ mode, blob, url: made })
        setError(null)
      })
      .catch((e: Error) => !cancelled && setError(e.message))
    return () => {
      cancelled = true
      if (made) URL.revokeObjectURL(made)
    }
  }, [devotional, mode])

  const fileName = `매일묵상_${devotional.date}${mode === 'summary' ? '_요약' : ''}.png`
  const file = ready ? new File([ready.blob], fileName, { type: 'image/png' }) : null
  const canShareFile = !!file && !!navigator.canShare?.({ files: [file] })

  return (
    <Modal title="카드뉴스 이미지" onClose={onClose} wide>
      <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl bg-black/5 p-1 dark:bg-white/5">
        {(['full', 'summary'] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)} className={`rounded-xl py-2 text-sm ${mode === m ? 'bg-white font-bold shadow dark:bg-night' : 'text-neutral-500'}`}>
            {m === 'full' ? '전체 내용(세로 한 장)' : '요약 카드'}
          </button>
        ))}
      </div>

      <div className="max-h-[55dvh] overflow-y-auto rounded-2xl border border-black/10 bg-neutral-100 dark:border-white/10 dark:bg-black/30">
        {error ? (
          <p className="p-6 text-center text-sm text-rose-600">{error}</p>
        ) : ready ? (
          <img src={ready.url} alt="오늘의 묵상 카드뉴스" className="block w-full" />
        ) : (
          <div className="flex h-72 flex-col items-center justify-center gap-3 text-sm text-neutral-500">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-moss-600 border-t-transparent" />
            이미지를 만드는 중…
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <a
          href={ready?.url}
          download={fileName}
          className={`flex-1 rounded-xl bg-moss-600 py-3 text-center text-sm font-bold text-white hover:bg-moss-700 ${ready ? '' : 'pointer-events-none opacity-50'}`}
        >
          이미지 저장
        </a>
        {canShareFile && (
          <button
            onClick={() => navigator.share({ files: [file!], title: devotional.title }).catch(() => {})}
            className="flex-1 rounded-xl border border-moss-600 py-3 text-sm font-bold text-moss-700 hover:bg-moss-50 dark:text-moss-100 dark:hover:bg-white/10"
          >
            공유하기
          </button>
        )}
      </div>
      <p className="mt-3 text-center text-xs text-neutral-500">저장이 안 되면 이미지를 길게 눌러 ‘사진에 저장’을 선택하세요.</p>
    </Modal>
  )
}
