import type { SongPick } from '../shared/types'
import { isInApp, openInBrowser, openInYouTubeApp } from '../lib/open'
import { IconExternal, IconPlay, IconSearch } from './Icons'

function formatViews(n?: number) {
  if (!n) return ''
  if (n >= 1e8) return `조회수 ${(n / 1e8).toFixed(1)}억회`
  if (n >= 1e4) return `조회수 ${Math.round(n / 1e4).toLocaleString('ko-KR')}만회`
  return `조회수 ${n.toLocaleString('ko-KR')}회`
}

export default function SongCard({ kind, song }: { kind: 'hymn' | 'ccm'; song: SongPick }) {
  const url = song.video?.url ?? song.searchUrl
  const heading = kind === 'hymn' ? `새찬송가 ${song.number}장` : 'CCM'
  const title = kind === 'hymn' ? song.title : `${song.title}`

  return (
    <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm dark:border-white/10 dark:bg-night-card">
      {song.video ? (
        <button onClick={() => openInYouTubeApp(song.video!.url)} className="group relative block aspect-video w-full overflow-hidden bg-black" aria-label={`${song.title} YouTube에서 재생`}>
          <img src={song.video.thumbnail} alt="" loading="lazy" className="h-full w-full object-cover opacity-90 transition group-hover:scale-[1.02] group-hover:opacity-100" />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition group-hover:scale-110">
              <IconPlay width={26} height={26} />
            </span>
          </span>
          {song.video.views ? (
            <span className="absolute bottom-2 right-2 rounded-md bg-black/70 px-2 py-0.5 text-[11px] text-white">{formatViews(song.video.views)}</span>
          ) : null}
        </button>
      ) : null}
      <div className="p-4">
        <div className="text-xs font-bold tracking-wide text-gold">{heading}</div>
        <div className="mt-0.5 font-serif text-lg font-bold leading-snug">{title}</div>
        {song.artist && <div className="text-sm text-neutral-500">{song.artist}</div>}
        <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">{song.reason}</p>
        {song.video && (
          <p className="mt-2 line-clamp-1 text-xs text-neutral-500">
            ▶ {song.video.title} · {song.video.channel}
          </p>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          {song.video ? (
            <>
              <button onClick={() => openInYouTubeApp(url)} className="flex items-center gap-1.5 rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700">
                <IconPlay width={16} height={16} /> YouTube 앱에서 재생
              </button>
              <button onClick={() => openInBrowser(url)} className="flex items-center gap-1.5 rounded-full border border-black/10 px-4 py-2 text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10">
                <IconExternal width={16} height={16} /> {isInApp ? '외부 브라우저' : '브라우저로 열기'}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => openInYouTubeApp(song.searchUrl)} className="flex items-center gap-1.5 rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700">
                <IconSearch width={16} height={16} /> YouTube에서 찾기(조회수순)
              </button>
              <button onClick={() => openInBrowser(song.searchUrl)} className="flex items-center gap-1.5 rounded-full border border-black/10 px-4 py-2 text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10">
                <IconExternal width={16} height={16} /> 브라우저
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
