-- 날짜별 묵상 콘텐츠(생성 결과 캐시)
CREATE TABLE IF NOT EXISTS devotionals (
  date        TEXT PRIMARY KEY,            -- 'YYYY-MM-DD'
  status      TEXT NOT NULL,               -- 'generating' | 'ready' | 'error'
  reference   TEXT NOT NULL,
  data        TEXT,                        -- Devotional JSON
  model       TEXT,
  error       TEXT,
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL
);

-- 성경 장 단위 본문 캐시(외부 성경 API 호출 최소화)
CREATE TABLE IF NOT EXISTS chapters (
  key         TEXT PRIMARY KEY,            -- '{translation}/{book}/{chapter}'
  verses      TEXT NOT NULL,               -- [{v, text}] JSON
  fetched_at  INTEGER NOT NULL
);

-- 날짜별 조회수 / 아멘(공감) 수
CREATE TABLE IF NOT EXISTS stats (
  date        TEXT PRIMARY KEY,
  views       INTEGER NOT NULL DEFAULT 0,
  amens       INTEGER NOT NULL DEFAULT 0
);
