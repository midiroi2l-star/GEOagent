import { type Settings, setSettings, usePersonal } from '../lib/store'
import Modal from './Modal'

const THEMES: { value: Settings['theme']; label: string }[] = [
  { value: 'system', label: '시스템' },
  { value: 'light', label: '밝게' },
  { value: 'dark', label: '어둡게' },
]

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const { settings } = usePersonal()
  return (
    <Modal title="보기 설정" onClose={onClose}>
      <div className="space-y-6">
        <div>
          <div className="mb-2 text-sm font-bold">화면 모드</div>
          <div className="grid grid-cols-3 gap-2">
            {THEMES.map((t) => (
              <button
                key={t.value}
                onClick={() => setSettings({ theme: t.value })}
                className={`rounded-xl border py-2.5 text-sm ${settings.theme === t.value ? 'border-moss-600 bg-moss-600 font-bold text-white' : 'border-black/10 dark:border-white/15'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between text-sm font-bold">
            <span>글자 크기</span>
            <span className="font-normal text-neutral-500">{Math.round(settings.fontScale * 100)}%</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setSettings({ fontScale: Math.max(0.85, +(settings.fontScale - 0.05).toFixed(2)) })} className="h-10 w-10 rounded-full border border-black/10 text-sm dark:border-white/15" aria-label="글자 작게">가</button>
            <input
              type="range"
              min={0.85}
              max={1.4}
              step={0.05}
              value={settings.fontScale}
              onChange={(e) => setSettings({ fontScale: Number(e.target.value) })}
              className="flex-1 accent-[#2f5d50]"
              aria-label="글자 크기"
            />
            <button onClick={() => setSettings({ fontScale: Math.min(1.4, +(settings.fontScale + 0.05).toFixed(2)) })} className="h-10 w-10 rounded-full border border-black/10 text-lg font-bold dark:border-white/15" aria-label="글자 크게">가</button>
          </div>
        </div>
        <p className="rounded-xl bg-moss-50 p-3 text-xs leading-relaxed text-moss-800 dark:bg-white/5 dark:text-moss-100">
          💡 홈 화면에 추가하면 앱처럼 사용할 수 있어요. (iPhone: 공유 → 홈 화면에 추가 / Android: 메뉴 → 앱 설치)
        </p>
      </div>
    </Modal>
  )
}
