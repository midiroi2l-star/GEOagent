import { formatKoreanDate } from '../shared/dates'
import type { Devotional } from '../shared/types'

// Canvas 2D로 직접 그리는 세로형 카드뉴스 이미지.
// (DOM 캡처 방식은 폰트·색상 함수 호환성 문제가 잦아, 줄바꿈까지 직접 계산해 그립니다.)

const SERIF = '"Noto Serif KR", "Nanum Myeongjo", serif'
const SANS = '"Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif'

const C = {
  paper: '#faf7f0',
  ink: '#1f2a26',
  sub: '#5b6661',
  accent: '#2f5d50',
  accentDark: '#1d3d34',
  gold: '#b8893b',
  soft: '#ebe4d3',
  rule: '#ddd4c0',
  white: '#ffffff',
}

const WIDTH = 1080
/** iOS Safari의 캔버스 최대 면적(약 1,670만 px)을 넘지 않도록 높이를 제한 */
const MAX_HEIGHT = 15000

interface TextOpts {
  size: number
  weight?: number
  family?: string
  color?: string
  lh?: number
  x?: number
  maxW?: number
  align?: 'left' | 'center'
  tracking?: number
}

class Painter {
  y = 0
  readonly ctx: CanvasRenderingContext2D
  draw: boolean
  readonly s: number

  constructor(ctx: CanvasRenderingContext2D, draw: boolean, s: number) {
    this.ctx = ctx
    this.draw = draw
    this.s = s
  }

  get pad() {
    return 72 * this.s
  }

  get inner() {
    return WIDTH - this.pad * 2
  }

  setFont(o: TextOpts) {
    this.ctx.font = `${o.weight ?? 400} ${o.size * this.s}px ${o.family ?? SANS}`
  }

  /** 어절(공백) 단위 줄바꿈, 한 어절이 너무 길면 글자 단위로 자릅니다. */
  wrap(text: string, maxW: number): string[] {
    const out: string[] = []
    for (const para of text.split('\n')) {
      let line = ''
      for (const word of para.split(/\s+/).filter(Boolean)) {
        const cand = line ? `${line} ${word}` : word
        if (this.ctx.measureText(cand).width <= maxW) {
          line = cand
          continue
        }
        if (line) out.push(line)
        line = ''
        let chunk = ''
        for (const ch of word) {
          if (this.ctx.measureText(chunk + ch).width > maxW && chunk) {
            out.push(chunk)
            chunk = ''
          }
          chunk += ch
        }
        line = chunk
      }
      out.push(line)
    }
    return out
  }

  text(text: string, o: TextOpts) {
    this.setFont(o)
    const x = o.x ?? this.pad
    const maxW = o.maxW ?? this.inner
    const lh = o.size * this.s * (o.lh ?? 1.7)
    const lines = this.wrap(text, maxW)
    if (this.draw) {
      this.ctx.fillStyle = o.color ?? C.ink
      this.ctx.textBaseline = 'alphabetic'
      this.ctx.textAlign = o.align ?? 'left'
      if ('letterSpacing' in this.ctx) (this.ctx as { letterSpacing: string }).letterSpacing = `${(o.tracking ?? 0) * this.s}px`
      lines.forEach((ln, i) => {
        const tx = o.align === 'center' ? x + maxW / 2 : x
        this.ctx.fillText(ln, tx, this.y + lh * i + o.size * this.s * 1.05)
      })
      if ('letterSpacing' in this.ctx) (this.ctx as { letterSpacing: string }).letterSpacing = '0px'
    }
    this.y += lh * lines.length
  }

  gap(n: number) {
    this.y += n * this.s
  }

  rect(x: number, y: number, w: number, h: number, color: string, r = 0) {
    if (!this.draw) return
    this.ctx.fillStyle = color
    this.ctx.beginPath()
    this.ctx.roundRect(x, y, w, h, r * this.s)
    this.ctx.fill()
  }

  /** 내용 높이를 먼저 잰 뒤 배경 상자를 그리고 내용을 그립니다. */
  boxed(fill: string, body: () => void, opts: { padY?: number; bar?: string } = {}) {
    const padY = (opts.padY ?? 40) * this.s
    const top = this.y
    const wasDrawing = this.draw
    this.draw = false
    this.y += padY
    body()
    const h = this.y - top + padY
    this.draw = wasDrawing
    this.y = top
    this.rect(this.pad, top, this.inner, h, fill, 24)
    if (opts.bar) this.rect(this.pad, top, 8 * this.s, h, opts.bar, 4)
    this.y += padY
    body()
    this.y = top + h
  }

  section(label: string) {
    this.gap(64)
    this.text(label, { size: 26, weight: 700, color: C.gold, tracking: 3 })
    this.gap(10)
    this.rect(this.pad, this.y, 72 * this.s, 4 * this.s, C.gold)
    this.gap(30)
  }

  para(text: string, size = 30) {
    this.text(text, { size, color: C.ink, lh: 1.8 })
    this.gap(18)
  }
}

function songLine(label: string, title: string, reason: string, video: Devotional['hymn']['video']) {
  return (p: Painter) => {
    p.text(label, { size: 24, weight: 700, color: C.accent, x: p.pad + 40 * p.s, maxW: p.inner - 80 * p.s })
    p.gap(4)
    p.text(title, { size: 34, weight: 700, family: SERIF, color: C.ink, x: p.pad + 40 * p.s, maxW: p.inner - 80 * p.s, lh: 1.45 })
    p.gap(8)
    p.text(reason, { size: 26, color: C.sub, x: p.pad + 40 * p.s, maxW: p.inner - 80 * p.s })
    if (video) {
      p.gap(6)
      const views = video.views ? ` · 조회수 ${video.views.toLocaleString('ko-KR')}회` : ''
      p.text(`▶ YouTube: ${video.title}${views}`, { size: 22, color: C.gold, x: p.pad + 40 * p.s, maxW: p.inner - 80 * p.s, lh: 1.5 })
    }
  }
}

function layout(p: Painter, d: Devotional, mode: 'full' | 'summary', siteUrl: string) {
  // ── 헤더 ──
  const headerTop = p.y
  const drawHeader = () => {
    p.gap(84)
    p.text('매일 묵상  ·  DAILY DEVOTIONAL', { size: 24, weight: 700, color: C.gold, tracking: 4 })
    p.gap(18)
    p.text(formatKoreanDate(d.date) + (d.occasion ? `  ·  ${d.occasion}` : `  ·  ${d.season}`), { size: 28, color: '#d9e4df' })
    p.gap(26)
    p.text(d.title, { size: 66, weight: 700, family: SERIF, color: C.white, lh: 1.32 })
    p.gap(22)
    p.text(d.reference, { size: 32, weight: 500, color: '#cfe0d8' })
    p.gap(76)
  }
  const wasDrawing = p.draw
  p.draw = false
  drawHeader()
  const headerH = p.y - headerTop
  p.draw = wasDrawing
  p.y = headerTop
  if (p.draw) {
    const g = p.ctx.createLinearGradient(0, 0, WIDTH, headerH)
    g.addColorStop(0, C.accentDark)
    g.addColorStop(1, C.accent)
    p.ctx.fillStyle = g
    p.ctx.fillRect(0, headerTop, WIDTH, headerH)
    p.rect(WIDTH - 220 * p.s, headerTop + 60 * p.s, 140 * p.s, 6 * p.s, C.gold)
  }
  drawHeader()

  // ── 핵심 구절 ──
  p.gap(56)
  p.boxed(
    C.soft,
    () => {
      p.text(`“${d.keyVerse.text}”`, { size: 36, weight: 600, family: SERIF, color: C.accentDark, x: p.pad + 48 * p.s, maxW: p.inner - 96 * p.s, lh: 1.6 })
      p.gap(14)
      p.text(`— ${d.keyVerse.ref}`, { size: 26, weight: 500, color: C.sub, x: p.pad + 48 * p.s, maxW: p.inner - 96 * p.s })
    },
    { bar: C.gold, padY: 44 },
  )

  if (mode === 'full') {
    p.section(`오늘의 본문  ·  ${d.reference}`)
    for (const v of d.passage.verses) {
      p.setFont({ size: 22, weight: 700 })
      const numW = 52 * p.s
      const top = p.y
      p.text(String(v.v), { size: 22, weight: 700, color: C.gold, lh: 2.1 })
      p.y = top
      p.text(v.text, { size: 28, family: SERIF, color: C.ink, x: p.pad + numW, maxW: p.inner - numW, lh: 1.75 })
      p.gap(6)
    }

    p.section('본문 요약')
    p.para(d.summary)

    p.section('배경과 문맥')
    p.para(d.background)

    p.section('말씀 강해')
    p.para(d.exposition.intro)
    d.exposition.sections.forEach((sec, i) => {
      p.gap(16)
      p.text(`${i + 1}. ${sec.heading}`, { size: 34, weight: 700, family: SERIF, color: C.accent, lh: 1.45 })
      p.gap(14)
      p.para(sec.body)
    })
    p.gap(16)
    p.text('그리스도와 복음', { size: 34, weight: 700, family: SERIF, color: C.accent, lh: 1.45 })
    p.gap(14)
    p.para(d.exposition.christ)
  } else {
    p.section('본문 요약')
    p.para(d.summary)
  }

  p.section('오늘의 적용')
  d.application.forEach((a, i) => {
    const top = p.y
    const r = 22 * p.s
    if (p.draw) {
      p.ctx.fillStyle = C.accent
      p.ctx.beginPath()
      p.ctx.arc(p.pad + r, top + r + 4 * p.s, r, 0, Math.PI * 2)
      p.ctx.fill()
      p.ctx.fillStyle = C.white
      p.ctx.font = `700 ${24 * p.s}px ${SANS}`
      p.ctx.textAlign = 'center'
      p.ctx.fillText(String(i + 1), p.pad + r, top + r + 13 * p.s)
      p.ctx.textAlign = 'left'
    }
    p.text(a, { size: 30, x: p.pad + 64 * p.s, maxW: p.inner - 64 * p.s, lh: 1.7 })
    p.gap(16)
  })

  if (mode === 'full') {
    p.section('묵상 질문')
    d.questions.forEach((q, i) => {
      p.text(`Q${i + 1}. ${q}`, { size: 29, color: C.ink, lh: 1.7 })
      p.gap(14)
    })
  }

  p.section('오늘의 기도')
  p.boxed(C.white, () => {
    p.text(d.prayer, { size: 29, family: SERIF, color: C.ink, x: p.pad + 44 * p.s, maxW: p.inner - 88 * p.s, lh: 1.85 })
  })

  p.section('오늘의 찬양')
  p.boxed(C.white, () => {
    songLine('찬송가', `새찬송가 ${d.hymn.number}장 · ${d.hymn.title}`, d.hymn.reason, d.hymn.video)(p)
    p.gap(28)
    p.rect(p.pad + 40 * p.s, p.y, p.inner - 80 * p.s, 2 * p.s, C.rule)
    p.gap(28)
    songLine('CCM', `${d.ccm.title} — ${d.ccm.artist}`, d.ccm.reason, d.ccm.video)(p)
  })

  // ── 푸터 ──
  p.gap(72)
  p.rect(p.pad, p.y, p.inner, 2 * p.s, C.rule)
  p.gap(30)
  p.text(`${siteUrl}  ·  ${d.date}`, { size: 22, color: C.sub, align: 'center' })
  p.gap(70)
}

async function ensureFonts(text: string) {
  if (!document.fonts) return
  const sample = text.slice(0, 4000)
  await Promise.allSettled([
    document.fonts.load(`700 40px "Noto Serif KR"`, sample),
    document.fonts.load(`600 40px "Noto Serif KR"`, sample),
    document.fonts.load(`400 40px "Noto Serif KR"`, sample),
    document.fonts.load(`400 30px "Noto Sans KR"`, sample),
    document.fonts.load(`700 30px "Noto Sans KR"`, sample),
    document.fonts.load(`500 30px "Noto Sans KR"`, sample),
  ])
}

export async function renderCardImage(d: Devotional, mode: 'full' | 'summary', siteUrl: string): Promise<Blob> {
  const allText = JSON.stringify(d)
  await ensureFonts(allText)

  const measureCtx = document.createElement('canvas').getContext('2d')!
  let scale = 1
  let height = 0
  for (; scale >= 0.55; scale -= 0.05) {
    const p = new Painter(measureCtx, false, scale)
    layout(p, d, mode, siteUrl)
    height = Math.ceil(p.y)
    if (height <= MAX_HEIGHT) break
  }

  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = Math.min(height, MAX_HEIGHT)
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = C.paper
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  layout(new Painter(ctx, true, scale), d, mode, siteUrl)

  return new Promise((ok, fail) => canvas.toBlob((b) => (b ? ok(b) : fail(new Error('이미지 생성 실패'))), 'image/png'))
}
