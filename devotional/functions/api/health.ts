import { todayKST } from '../../src/shared/dates'
import { readingFor } from '../../src/shared/plan'
import { type Env, json } from '../_lib/env'

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const today = todayKST()
  return json({
    ok: true,
    today,
    reading: readingFor(today).reference,
    anthropic: !!env.ANTHROPIC_API_KEY,
    youtube: !!env.YOUTUBE_API_KEY,
    db: !!env.DB,
  })
}
