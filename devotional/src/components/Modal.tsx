import { type ReactNode, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { IconClose } from './Icons'

export default function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  // body로 포털: 헤더의 backdrop-filter가 fixed 요소의 기준 박스를 바꾸는 문제를 피함
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 backdrop-blur-[2px] sm:items-center sm:p-6" onClick={onClose} role="dialog" aria-modal="true" aria-label={title}>
      <div
        className={`max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl bg-white pb-[env(safe-area-inset-bottom)] shadow-2xl sm:rounded-3xl dark:bg-night-card ${wide ? 'sm:max-w-2xl' : 'sm:max-w-md'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-black/5 bg-white/95 px-5 py-4 backdrop-blur dark:border-white/10 dark:bg-night-card/95">
          <h2 className="text-base font-bold">{title}</h2>
          <button onClick={onClose} className="-mr-2 rounded-full p-2 text-neutral-500 hover:bg-black/5 dark:hover:bg-white/10" aria-label="닫기">
            <IconClose />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
