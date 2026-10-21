import { isValidDate } from '../../../../src/shared/dates'
import { type Env, json } from '../../../_lib/env'
import { bump, getStats } from '../../../_lib/store'

// POST /api/devotional/:date/amen — '아멘'(공감) 1 증가
export const onRequestPost: PagesFunction<Env> = async ({ params, env }) => {
  const date = String(params.date)
  if (!isValidDate(date)) return json({ error: 'invalid date' }, { status: 400 })
  await bump(env, date, 'amens')
  return json(await getStats(env, date))
}
