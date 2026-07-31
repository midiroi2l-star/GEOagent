CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_date TEXT NOT NULL,      -- YYYY-MM-DD
  start_time TEXT NOT NULL,      -- HH:MM
  end_time TEXT NOT NULL,        -- HH:MM
  instructor TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,                  -- 상세 내용(선택)
  image_key TEXT,                -- R2 오브젝트 키(선택)
  image_name TEXT,               -- 원본 파일명(다운로드용)
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE UNIQUE INDEX IF NOT EXISTS idx_events_image_key ON events(image_key) WHERE image_key IS NOT NULL;
