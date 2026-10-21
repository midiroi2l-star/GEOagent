export interface Env {
  DB: D1Database
  ANTHROPIC_API_KEY?: string
  YOUTUBE_API_KEY?: string
  ADMIN_TOKEN?: string
  CLAUDE_MODEL?: string
  /** 선택: Cloudflare AI Gateway 등 프록시를 거칠 때 */
  ANTHROPIC_BASE_URL?: string
  /** 기본값: https://api.getbible.net/v2/korean (개역한글) */
  BIBLE_API_BASE?: string
  MAX_FUTURE_DAYS?: string
  MIN_DATE?: string
}

export function json(data: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers)
  headers.set('content-type', 'application/json; charset=utf-8')
  if (!headers.has('cache-control')) headers.set('cache-control', 'no-store')
  return new Response(JSON.stringify(data), { ...init, headers })
}
