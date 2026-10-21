import Anthropic from '@anthropic-ai/sdk'
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod'
import { z } from 'zod'
import { readingFor } from '../../src/shared/plan'
import { formatKoreanDate } from '../../src/shared/dates'
import type { Devotional, SongPick, Verse } from '../../src/shared/types'
import { getVerses } from './bible'
import type { Env } from './env'
import { findMostViewed, youtubeSearchUrl } from './youtube'

export const DEFAULT_MODEL = 'claude-opus-5-5'

const DevotionalSchema = z.object({
  title: z.string().describe('오늘 묵상의 제목(20자 이내, 본문의 핵심 메시지를 담은 한 문장)'),
  summary: z.string().describe('본문 요약 2~3문장'),
  key_verse_ref: z.string().describe('오늘의 핵심 구절 위치, 예: "로마서 8:38"'),
  key_verse_text: z.string().describe('핵심 구절 본문(제공된 개역한글 본문에서 그대로 인용)'),
  background: z.string().describe('역사적·문학적 배경과 문맥(앞뒤 흐름, 저자, 수신자, 시대 상황) 2~3문단'),
  intro: z.string().describe('강해 도입 1문단'),
  sections: z
    .array(z.object({ heading: z.string().describe('대지 제목(절 범위 포함 가능)'), body: z.string().describe('강해 본문 2~4문단') }))
    .describe('본문 흐름을 따른 3~4개의 대지 강해'),
  christ: z.string().describe('이 본문이 그리스도와 복음을 어떻게 가리키는지 1~2문단'),
  application: z.array(z.string()).describe('오늘의 적용 3가지(구체적이고 실천 가능한 행동)'),
  questions: z.array(z.string()).describe('개인/소그룹 묵상 질문 3가지'),
  prayer: z.string().describe('본문과 적용을 담은 1인칭 기도문(5~8문장, "예수님의 이름으로 기도합니다. 아멘."으로 마무리)'),
  hymn: z.object({
    number: z.number().int().describe('새찬송가(2006) 장 번호'),
    title: z.string().describe('새찬송가에 실린 정확한 제목'),
    reason: z.string().describe('이 찬송을 추천하는 이유 1~2문장'),
  }),
  ccm: z.object({
    title: z.string().describe('한국 교회에서 널리 불리는 CCM/워십곡의 정확한 제목'),
    artist: z.string().describe('대표 아티스트/찬양팀'),
    reason: z.string().describe('추천 이유 1~2문장'),
  }),
  passage_verses: z
    .array(z.object({ v: z.number().int(), text: z.string() }))
    .describe('본문이 제공되지 않은 경우에만 개역한글 본문을 절별로 기록. 본문이 제공되었다면 빈 배열'),
})

const SYSTEM = `당신은 한국 교회 성도들을 위한 매일 묵상(Daily Devotional)을 집필하는 성경 강해 설교자입니다.
- 복음주의·개혁주의 전통의 건전한 신학 위에서, 본문이 실제로 말하는 바를 문맥에 따라 풀어내는 강해(expository) 방식으로 씁니다. 본문에 없는 내용을 끼워 넣거나 우의적으로 과도하게 해석하지 않습니다.
- 강해에는 역사적·문학적 배경, 핵심 단어의 원어(히브리어/헬라어) 의미(한글 음역과 뜻), 구약과 신약의 연결, 그리스도 중심적 해석을 균형 있게 담습니다.
- 문체는 따뜻하고 명료한 경어체(~합니다)로, 오늘을 사는 성도가 삶에 적용할 수 있도록 구체적으로 씁니다.
- 성경 인용은 개역한글 표현을 따르며, 제공된 본문을 그대로 인용합니다.
- 찬송가는 새찬송가(2006, 645장 체계)에 실제로 수록된 곡만, 장 번호와 제목을 정확히 적습니다. 확실하지 않으면 널리 알려진 곡을 고르세요.
- CCM은 실존하고 한국 교회에서 널리 불리는 곡만 추천합니다(예: 마커스워십, 어노인팅, 제이어스, 예수전도단, 위러브, 김윤진, 히즈윌 등).
- 정치적으로 편향된 주장이나 특정 교단 비방은 피합니다.`

function versesText(verses: Verse[]): string {
  return verses.map((v) => `${v.v} ${v.text}`).join('\n')
}

async function songPick(env: Env, base: Omit<SongPick, 'video' | 'searchUrl'>): Promise<SongPick> {
  const video = await findMostViewed(env, base.query)
  return { ...base, video, searchUrl: youtubeSearchUrl(base.query) }
}

export async function generateDevotional(env: Env, date: string): Promise<{ devotional: Devotional; model: string }> {
  if (!env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY가 설정되지 않았습니다.')
  const reading = readingFor(date)
  const verses = await getVerses(env, reading.ref)
  const model = env.CLAUDE_MODEL || DEFAULT_MODEL

  const prompt = [
    `날짜: ${formatKoreanDate(date)}`,
    `교회력 절기: ${reading.season}`,
    reading.occasion ? `오늘의 절기/기념일: ${reading.occasion} — 이 의미를 강해와 적용에 자연스럽게 반영하세요.` : '',
    `본문: ${reading.reference}`,
    verses
      ? `본문(개역한글):\n${versesText(verses)}`
      : '본문 텍스트를 불러오지 못했습니다. passage_verses에 개역한글 본문을 절별로 정확히 기록하세요.',
    '',
    '위 본문으로 오늘의 묵상을 작성하세요. 강해는 각 대지를 충분히 깊이 있게(대지당 2~4문단) 써 주세요.',
  ]
    .filter(Boolean)
    .join('\n')

  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, baseURL: env.ANTHROPIC_BASE_URL || undefined })
  const stream = client.beta.messages.stream({
    model,
    max_tokens: 32000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'medium', format: betaZodOutputFormat(DevotionalSchema) },
    system: SYSTEM,
    messages: [{ role: 'user', content: prompt }],
  })
  const message = await stream.finalMessage()
  if (message.stop_reason === 'refusal') throw new Error('모델이 요청을 처리하지 못했습니다(refusal).')
  if (message.stop_reason === 'max_tokens') throw new Error('응답이 길이 제한으로 잘렸습니다.')
  const out = message.parsed_output
  if (!out) throw new Error('구조화된 응답을 해석하지 못했습니다.')

  const [hymn, ccm] = await Promise.all([
    songPick(env, {
      number: out.hymn.number,
      title: out.hymn.title,
      reason: out.hymn.reason,
      query: `새찬송가 ${out.hymn.number}장 ${out.hymn.title}`,
    }),
    songPick(env, {
      title: out.ccm.title,
      artist: out.ccm.artist,
      reason: out.ccm.reason,
      query: `${out.ccm.title} ${out.ccm.artist}`,
    }),
  ])

  const devotional: Devotional = {
    date,
    reference: reading.reference,
    occasion: reading.occasion,
    season: reading.season,
    passage: verses ? { verses, source: 'krv' } : { verses: out.passage_verses, source: 'ai' },
    title: out.title,
    summary: out.summary,
    keyVerse: { ref: out.key_verse_ref, text: out.key_verse_text },
    background: out.background,
    exposition: { intro: out.intro, sections: out.sections, christ: out.christ },
    application: out.application,
    questions: out.questions,
    prayer: out.prayer,
    hymn,
    ccm,
    generatedAt: new Date().toISOString(),
  }
  return { devotional, model: message.model }
}
