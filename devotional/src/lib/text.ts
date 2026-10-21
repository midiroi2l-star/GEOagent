import { formatKoreanDate } from '../shared/dates'
import type { Devotional } from '../shared/types'

/** 카카오톡 등에 붙여넣기 좋은 텍스트 버전 */
export function devotionalToText(d: Devotional, url: string): string {
  const lines = [
    `📖 매일 묵상 | ${formatKoreanDate(d.date)}${d.occasion ? ` (${d.occasion})` : ''}`,
    '',
    `■ ${d.title}`,
    `본문: ${d.reference}`,
    '',
    ...d.passage.verses.map((v) => `${v.v} ${v.text}`),
    '',
    `✦ 핵심 구절: "${d.keyVerse.text}" (${d.keyVerse.ref})`,
    '',
    '[본문 요약]',
    d.summary,
    '',
    '[배경과 문맥]',
    d.background,
    '',
    '[말씀 강해]',
    d.exposition.intro,
    ...d.exposition.sections.flatMap((s, i) => ['', `${i + 1}. ${s.heading}`, s.body]),
    '',
    '그리스도와 복음',
    d.exposition.christ,
    '',
    '[오늘의 적용]',
    ...d.application.map((a, i) => `${i + 1}. ${a}`),
    '',
    '[묵상 질문]',
    ...d.questions.map((q, i) => `Q${i + 1}. ${q}`),
    '',
    '[오늘의 기도]',
    d.prayer,
    '',
    '[오늘의 찬양]',
    `🎵 찬송가: 새찬송가 ${d.hymn.number}장 ${d.hymn.title}`,
    d.hymn.video?.url ?? d.hymn.searchUrl,
    `🎧 CCM: ${d.ccm.title} - ${d.ccm.artist}`,
    d.ccm.video?.url ?? d.ccm.searchUrl,
    '',
    url,
  ]
  return lines.join('\n')
}

/** 음성으로 읽어 줄 묵상 전체 */
export function devotionalToSpeech(d: Devotional): string {
  return [
    d.title,
    `오늘의 본문은 ${d.reference} 말씀입니다.`,
    d.passage.verses.map((v) => v.text).join(' '),
    d.exposition.intro,
    ...d.exposition.sections.flatMap((s) => [s.heading, s.body]),
    d.exposition.christ,
    '오늘의 적용.',
    ...d.application,
    '함께 기도하겠습니다.',
    d.prayer,
  ].join('\n')
}
