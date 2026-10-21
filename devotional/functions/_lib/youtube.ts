import type { VideoInfo } from '../../src/shared/types'
import type { Env } from './env'

/** 키가 없거나 API가 실패해도 항상 동작하는 '조회수순' YouTube 검색 링크 */
export function youtubeSearchUrl(query: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=CAM%253D`
}

interface SearchItem {
  id?: { videoId?: string }
  snippet?: { title?: string; channelTitle?: string; thumbnails?: Record<string, { url?: string }> }
}

function decodeEntities(s: string): string {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

/**
 * 관련도 상위 10개 영상 중 조회수가 가장 많은 영상을 고릅니다.
 * (order=viewCount 단독 정렬은 검색어와 무관한 인기 영상이 섞이는 경우가 많아, 관련도 상위권 안에서 조회수 최댓값을 선택)
 */
export async function findMostViewed(env: Env, query: string): Promise<VideoInfo | null> {
  if (!env.YOUTUBE_API_KEY) return null
  try {
    const search = new URL('https://www.googleapis.com/youtube/v3/search')
    search.search = new URLSearchParams({
      part: 'snippet',
      type: 'video',
      maxResults: '10',
      q: query,
      regionCode: 'KR',
      relevanceLanguage: 'ko',
      videoEmbeddable: 'any',
      key: env.YOUTUBE_API_KEY,
    }).toString()
    const sres = await fetch(search)
    if (!sres.ok) throw new Error(`search ${sres.status}`)
    const items = ((await sres.json()) as { items?: SearchItem[] }).items ?? []
    const ids = items.map((it) => it.id?.videoId).filter((id): id is string => !!id)
    if (!ids.length) return null

    const stats = new URL('https://www.googleapis.com/youtube/v3/videos')
    stats.search = new URLSearchParams({ part: 'statistics', id: ids.join(','), key: env.YOUTUBE_API_KEY }).toString()
    const vres = await fetch(stats)
    const views = new Map<string, number>()
    if (vres.ok) {
      const data = (await vres.json()) as { items?: { id: string; statistics?: { viewCount?: string } }[] }
      for (const it of data.items ?? []) views.set(it.id, Number(it.statistics?.viewCount ?? 0))
    }

    let best = items.find((it) => it.id?.videoId)!
    for (const it of items) {
      const id = it.id?.videoId
      if (id && (views.get(id) ?? 0) > (views.get(best.id!.videoId!) ?? 0)) best = it
    }
    const videoId = best.id!.videoId!
    return {
      videoId,
      title: decodeEntities(best.snippet?.title ?? ''),
      channel: decodeEntities(best.snippet?.channelTitle ?? ''),
      views: views.get(videoId),
      thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      url: `https://www.youtube.com/watch?v=${videoId}`,
    }
  } catch (err) {
    console.error('youtube lookup failed', query, err)
    return null
  }
}
