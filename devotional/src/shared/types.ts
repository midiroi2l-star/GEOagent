export interface Verse {
  v: number
  text: string
}

export interface VideoInfo {
  videoId: string
  title: string
  channel: string
  views?: number
  thumbnail: string
  url: string
}

export interface SongPick {
  /** 새찬송가 장 번호(찬송가일 때) */
  number?: number
  title: string
  artist?: string
  reason: string
  /** 검색어(조회수순 YouTube 검색용) */
  query: string
  video: VideoInfo | null
  searchUrl: string
}

export interface ExpositionSection {
  heading: string
  body: string
}

export interface Devotional {
  date: string
  reference: string
  occasion?: string
  season: string
  passage: {
    verses: Verse[]
    /** 'krv' = 개역한글(성경 API), 'ai' = 성경 API 실패 시 AI가 인용한 본문 */
    source: 'krv' | 'ai'
  }
  title: string
  summary: string
  keyVerse: { ref: string; text: string }
  background: string
  exposition: {
    intro: string
    sections: ExpositionSection[]
    christ: string
  }
  application: string[]
  questions: string[]
  prayer: string
  hymn: SongPick
  ccm: SongPick
  generatedAt: string
}

export interface DevotionalResponse {
  /** missing = 아직 생성 전(peek 요청), generating = 다른 요청이 생성 중 */
  status: 'ready' | 'missing' | 'generating' | 'unavailable'
  date: string
  reference: string
  occasion?: string
  season: string
  devotional?: Devotional
  /** 강해가 아직 없을 때 미리 보여줄 본문 */
  verses?: Verse[]
  message?: string
  stats?: { views: number; amens: number }
}
