import { isValidDate } from '../../../src/shared/dates'
import { type Env, json } from '../../_lib/env'
import { loadDevotional } from '../../_lib/store'

/**
 * POST /api/admin/generate?date=YYYY-MM-DD[&force=1]
 * Authorization: Bearer <ADMIN_TOKEN>
 * 미리 생성(GitHub Actions 예약 작업) 또는 강제 재생성에 사용합니다. 날짜 범위 제한이 없습니다.
 */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.ADMIN_TOKEN || request.headers.get('authorization') !== `Bearer ${env.ADMIN_TOKEN}`) {
    return json({ error: 'unauthorized' }, { status: 401 })
  }
  const url = new URL(request.url)
  const date = url.searchParams.get('date') ?? ''
  if (!isValidDate(date)) return json({ error: 'invalid date' }, { status: 400 })
  const result = await loadDevotional(env, date, { allowGenerate: true, force: url.searchParams.get('force') === '1' })
  return json(
    { date, status: result.status, reference: result.reference, title: result.devotional?.title, message: result.message },
    { status: result.status === 'ready' ? 200 : result.status === 'generating' ? 202 : 500 },
  )
}
