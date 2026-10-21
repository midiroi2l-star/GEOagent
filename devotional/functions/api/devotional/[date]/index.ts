import { addDays, isValidDate, todayKST } from '../../../../src/shared/dates'
import { type Env, json } from '../../../_lib/env'
import { bump, getStats, loadDevotional } from '../../../_lib/store'

// GET /api/devotional/:date[?view=1][&peek=1]
// peek=1 이면 아직 생성 전이어도 생성하지 않고 본문만 즉시 돌려줍니다.
export const onRequestGet: PagesFunction<Env> = async ({ params, request, env }) => {
  const date = String(params.date)
  if (!isValidDate(date)) return json({ error: '날짜 형식이 올바르지 않습니다(YYYY-MM-DD).' }, { status: 400 })

  const maxDate = addDays(todayKST(), Number(env.MAX_FUTURE_DAYS ?? 14))
  const allowGenerate = date >= (env.MIN_DATE ?? '2020-01-01') && date <= maxDate

  const query = new URL(request.url).searchParams
  const result = await loadDevotional(env, date, { allowGenerate, peek: query.get('peek') === '1' })
  if (query.get('view') === '1' && result.status === 'ready') await bump(env, date, 'views')
  return json({ ...result, stats: await getStats(env, date) })
}
