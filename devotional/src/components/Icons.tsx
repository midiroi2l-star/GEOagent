// 가벼운 인라인 SVG 아이콘 모음(외부 아이콘 라이브러리 없이)
import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement>

const base = (p: P) => ({
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  ...p,
})

export const IconCalendar = (p: P) => (
  <svg {...base(p)}><rect x="3" y="4.5" width="18" height="16.5" rx="2.5" /><path d="M3 9.5h18M8 3v3M16 3v3" /></svg>
)
export const IconChevronLeft = (p: P) => <svg {...base(p)}><path d="M15 18l-6-6 6-6" /></svg>
export const IconChevronRight = (p: P) => <svg {...base(p)}><path d="M9 6l6 6-6 6" /></svg>
export const IconUser = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></svg>
)
export const IconSettings = (p: P) => (
  <svg {...base(p)}><path d="M4 7h10M18 7h2M4 17h4M12 17h8" /><circle cx="16" cy="7" r="2" /><circle cx="10" cy="17" r="2" /></svg>
)
export const IconCheck = (p: P) => <svg {...base(p)}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
export const IconHeart = (p: P) => (
  <svg {...base(p)}><path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0112 7.3a4.3 4.3 0 017.5 2.5C19.5 15.4 12 20 12 20z" /></svg>
)
export const IconBookmark = (p: P) => <svg {...base(p)}><path d="M6.5 3.5h11v17l-5.5-4-5.5 4z" /></svg>
export const IconShare = (p: P) => (
  <svg {...base(p)}><path d="M12 15V3.5M7.5 8L12 3.5 16.5 8" /><path d="M5 12.5V19a1.5 1.5 0 001.5 1.5h11A1.5 1.5 0 0019 19v-6.5" /></svg>
)
export const IconImage = (p: P) => (
  <svg {...base(p)}><rect x="3.5" y="3.5" width="17" height="17" rx="2.5" /><circle cx="9" cy="9" r="1.8" /><path d="M20.5 15.5l-5-5-9 9" /></svg>
)
export const IconSpeaker = (p: P) => (
  <svg {...base(p)}><path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z" /><path d="M15.5 9a4.2 4.2 0 010 6M18 6.5a7.8 7.8 0 010 11" /></svg>
)
export const IconStop = (p: P) => <svg {...base(p)}><rect x="6.5" y="6.5" width="11" height="11" rx="1.5" /></svg>
export const IconCopy = (p: P) => (
  <svg {...base(p)}><rect x="8.5" y="8.5" width="12" height="12" rx="2" /><path d="M15.5 8.5V5A1.5 1.5 0 0014 3.5H5A1.5 1.5 0 003.5 5v9A1.5 1.5 0 005 15.5h3.5" /></svg>
)
export const IconPlay = (p: P) => <svg {...base(p)}><path d="M8 5.5v13l10.5-6.5z" fill="currentColor" /></svg>
export const IconExternal = (p: P) => (
  <svg {...base(p)}><path d="M14 4.5h5.5V10M19.5 4.5L11 13" /><path d="M18 14v4.5A1.5 1.5 0 0116.5 20h-11A1.5 1.5 0 014 18.5v-11A1.5 1.5 0 015.5 6H10" /></svg>
)
export const IconSearch = (p: P) => <svg {...base(p)}><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4.2-4.2" /></svg>
export const IconClose = (p: P) => <svg {...base(p)}><path d="M6 6l12 12M18 6L6 18" /></svg>
export const IconPrint = (p: P) => (
  <svg {...base(p)}><path d="M7 8.5V3.5h10v5" /><rect x="3.5" y="8.5" width="17" height="8" rx="2" /><path d="M7 14h10v6.5H7z" /></svg>
)
export const IconBook = (p: P) => (
  <svg {...base(p)}><path d="M12 6.5C10 5 7 4.5 3.5 5v13.5c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5zM12 6.5V20" /></svg>
)
