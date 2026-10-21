import { readingFor } from '../../src/shared/plan'
import type { Devotional, DevotionalResponse } from '../../src/shared/types'
import { getVerses } from './bible'
import type { Env } from './env'
import { generateDevotional } from './generate'

/** 이 시간보다 오래 'generating' 상태면 중단된 것으로 보고 다시 생성합니다. */
const STALE_MS = 4 * 60 * 1000
/** 실패 후 재시도까지 대기 시간 */
const ERROR_COOLDOWN_MS = 60 * 1000

interface Row {
  status: 'generating' | 'ready' | 'error'
  data: string | null
  error: string | null
}

export async function getStats(env: Env, date: string) {
  const row = await env.DB.prepare('SELECT views, amens FROM stats WHERE date = ?').bind(date).first<{ views: number; amens: number }>()
  return { views: row?.views ?? 0, amens: row?.amens ?? 0 }
}

export async function bump(env: Env, date: string, column: 'views' | 'amens') {
  await env.DB.prepare(
    `INSERT INTO stats (date, ${column}) VALUES (?, 1) ON CONFLICT(date) DO UPDATE SET ${column} = ${column} + 1`,
  )
    .bind(date)
    .run()
}

/** 동시에 여러 요청이 와도 한 번만 생성되도록 D1 행으로 잠금을 잡습니다. 잡았으면 true. */
async function claim(env: Env, date: string, reference: string, force: boolean): Promise<boolean> {
  const now = Date.now()
  const res = await env.DB.prepare(
    `INSERT INTO devotionals (date, status, reference, created_at, updated_at) VALUES (?1, 'generating', ?2, ?3, ?3)
     ON CONFLICT(date) DO UPDATE SET status = 'generating', reference = ?2, error = NULL, updated_at = ?3
     WHERE ?4 = 1
        OR (devotionals.status = 'error' AND devotionals.updated_at < ?3 - ?5)
        OR (devotionals.status = 'generating' AND devotionals.updated_at < ?3 - ?6)`,
  )
    .bind(date, reference, now, force ? 1 : 0, ERROR_COOLDOWN_MS, STALE_MS)
    .run()
  return (res.meta.changes ?? 0) > 0
}

async function runGeneration(env: Env, date: string): Promise<Devotional> {
  try {
    const { devotional, model } = await generateDevotional(env, date)
    await env.DB.prepare(`UPDATE devotionals SET status = 'ready', data = ?, model = ?, error = NULL, updated_at = ? WHERE date = ?`)
      .bind(JSON.stringify(devotional), model, Date.now(), date)
      .run()
    return devotional
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('generation failed', date, err)
    await env.DB.prepare(`UPDATE devotionals SET status = 'error', error = ?, updated_at = ? WHERE date = ?`)
      .bind(message.slice(0, 500), Date.now(), date)
      .run()
    throw err
  }
}

/**
 * 날짜의 묵상을 돌려줍니다. 아직 없으면(그리고 allowGenerate면) 이 요청 안에서 생성합니다.
 * 다른 요청이 생성 중이면 'generating'을 돌려주며, 클라이언트는 잠시 후 다시 요청합니다.
 */
export async function loadDevotional(
  env: Env,
  date: string,
  opts: { allowGenerate: boolean; force?: boolean; peek?: boolean },
): Promise<DevotionalResponse> {
  const reading = readingFor(date)
  const base = { date, reference: reading.reference, occasion: reading.occasion, season: reading.season }

  if (!opts.force) {
    const row = await env.DB.prepare('SELECT status, data, error FROM devotionals WHERE date = ?').bind(date).first<Row>()
    if (row?.status === 'ready' && row.data) {
      return { ...base, status: 'ready', devotional: JSON.parse(row.data) as Devotional }
    }
  }

  if (!env.ANTHROPIC_API_KEY || !opts.allowGenerate) {
    const verses = await getVerses(env, reading.ref)
    return {
      ...base,
      status: 'unavailable',
      verses: verses ?? undefined,
      message: !env.ANTHROPIC_API_KEY
        ? '서버에 ANTHROPIC_API_KEY가 설정되지 않아 강해를 생성할 수 없습니다. 본문만 표시합니다.'
        : '아직 공개되지 않은 날짜입니다. 본문만 미리 보여드립니다.',
    }
  }

  // peek: 생성하지 않고 본문만 빠르게 돌려줌(클라이언트가 기다리는 동안 본문을 먼저 보여주기 위함)
  if (opts.peek) {
    const verses = await getVerses(env, reading.ref)
    return { ...base, status: 'missing', verses: verses ?? undefined }
  }

  if (await claim(env, date, reading.reference, !!opts.force)) {
    try {
      const devotional = await runGeneration(env, date)
      return { ...base, status: 'ready', devotional }
    } catch (err) {
      return { ...base, status: 'unavailable', message: `묵상을 생성하지 못했습니다: ${err instanceof Error ? err.message : err}` }
    }
  }

  const row = await env.DB.prepare('SELECT status, data, error FROM devotionals WHERE date = ?').bind(date).first<Row>()
  if (row?.status === 'ready' && row.data) return { ...base, status: 'ready', devotional: JSON.parse(row.data) as Devotional }
  const verses = await getVerses(env, reading.ref)
  if (row?.status === 'error') {
    return { ...base, status: 'unavailable', verses: verses ?? undefined, message: `묵상 생성에 실패했습니다. 잠시 후 다시 시도해 주세요. (${row.error ?? ''})` }
  }
  return { ...base, status: 'generating', verses: verses ?? undefined }
}
