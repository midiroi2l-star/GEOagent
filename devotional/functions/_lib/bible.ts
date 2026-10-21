import type { PassageRef } from '../../src/shared/books'
import type { Verse } from '../../src/shared/types'
import type { Env } from './env'

const DEFAULT_BASE = 'https://api.getbible.net/v2/korean'

interface GetBibleVerse {
  verse?: number | string
  text?: string
}

function normalize(raw: unknown): Verse[] {
  const list = (raw as { verses?: unknown })?.verses
  const items: GetBibleVerse[] = Array.isArray(list)
    ? list
    : list && typeof list === 'object'
      ? Object.values(list as Record<string, GetBibleVerse>)
      : []
  return items
    .map((it) => ({ v: Number(it.verse), text: String(it.text ?? '').replace(/\s+/g, ' ').trim() }))
    .filter((it) => Number.isFinite(it.v) && it.text)
}

/** 장 단위로 개역한글 본문을 가져와 D1에 캐시하고, 요청한 절 범위만 돌려줍니다. 실패 시 null. */
export async function getVerses(env: Env, ref: PassageRef): Promise<Verse[] | null> {
  const base = (env.BIBLE_API_BASE || DEFAULT_BASE).replace(/\/$/, '')
  const key = `${base.split('/').pop()}/${ref.book}/${ref.chapter}`
  let verses: Verse[] | null = null

  const cached = await env.DB.prepare('SELECT verses FROM chapters WHERE key = ?').bind(key).first<{ verses: string }>()
  if (cached) {
    verses = JSON.parse(cached.verses) as Verse[]
  } else {
    try {
      const res = await fetch(`${base}/${ref.book}/${ref.chapter}.json`, { headers: { accept: 'application/json' } })
      if (res.ok) {
        verses = normalize(await res.json())
        if (verses.length) {
          await env.DB.prepare('INSERT OR REPLACE INTO chapters (key, verses, fetched_at) VALUES (?, ?, ?)')
            .bind(key, JSON.stringify(verses), Date.now())
            .run()
        }
      }
    } catch (err) {
      console.error('bible fetch failed', err)
    }
  }
  const picked = verses?.filter((v) => v.v >= ref.from && v.v <= ref.to) ?? []
  return picked.length ? picked : null
}
