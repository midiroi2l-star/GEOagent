import type { DevotionalResponse } from '../shared/types'

const memory = new Map<string, DevotionalResponse>()

async function get(date: string, query: Record<string, string>, signal?: AbortSignal): Promise<DevotionalResponse> {
  const qs = new URLSearchParams(query).toString()
  const res = await fetch(`/api/devotional/${date}${qs ? `?${qs}` : ''}`, { signal })
  if (!res.ok) throw new Error(`서버 오류 (${res.status})`)
  const data = (await res.json()) as DevotionalResponse
  if (data.status === 'ready') memory.set(date, data)
  return data
}

export function cached(date: string): DevotionalResponse | undefined {
  return memory.get(date)
}

/**
 * 묵상을 불러옵니다.
 * 1) peek 요청으로 본문을 즉시 받아 onUpdate로 먼저 보여주고
 * 2) 아직 없으면 생성 요청(최대 1~2분) → 다른 사용자가 생성 중이면 5초 간격으로 다시 확인합니다.
 */
export async function loadDevotional(
  date: string,
  onUpdate: (r: DevotionalResponse) => void,
  signal: AbortSignal,
): Promise<DevotionalResponse> {
  const hit = memory.get(date)
  if (hit) {
    onUpdate(hit)
    return hit
  }
  let r = await get(date, { peek: '1', view: '1' }, signal)
  onUpdate(r)
  if (r.status === 'ready' || r.status === 'unavailable') return r

  if (r.status === 'missing') {
    r = await get(date, { view: '1' }, signal)
    onUpdate(r)
  }
  for (let i = 0; r.status === 'generating' && i < 60; i++) {
    await new Promise((ok) => setTimeout(ok, 5000))
    if (signal.aborted) throw new DOMException('aborted', 'AbortError')
    r = await get(date, { peek: '1', view: '1' }, signal)
    if (r.status === 'missing') r = await get(date, { view: '1' }, signal)
    onUpdate(r)
  }
  return r
}

/** 다음 날 묵상을 미리 받아 둡니다(생성은 하지 않음 — 이미 생성된 경우에만 캐시) */
export function prefetch(date: string) {
  if (memory.has(date)) return
  get(date, { peek: '1' }).catch(() => {})
}

export async function sendAmen(date: string): Promise<{ views: number; amens: number }> {
  const res = await fetch(`/api/devotional/${date}/amen`, { method: 'POST' })
  if (!res.ok) throw new Error('failed')
  const stats = (await res.json()) as { views: number; amens: number }
  const hit = memory.get(date)
  if (hit) memory.set(date, { ...hit, stats })
  return stats
}
