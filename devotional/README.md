# 📖 매일 묵상 (Daily Devotional)

날짜마다 다른 성경 본문을 보여주고, 그 본문에 맞춘 **자세한 강해 · 오늘의 적용 · 기도 · 찬송가 1곡 · CCM 1곡**을 제공하는 웹앱입니다. 추천곡은 YouTube에서 **조회수가 가장 많은 영상**을 찾아 연결하며, YouTube 앱이나 외부 브라우저에서 바로 재생합니다.
GitHub → Cloudflare Pages(Functions) → Cloudflare D1으로 배포되어 어디서나 접속할 수 있습니다.

## 주요 기능

| 구분 | 내용 |
|---|---|
| 시작 화면 | 접속하면 오늘 날짜의 묵상 페이지(`/d/YYYY-MM-DD`)로 바로 이동 |
| 이번 주 네비게이션 | 상단에 주일~토요일 7일 바, 날짜를 누르면 그날 묵상으로 이동 · 지난 주/다음 주 이동 |
| 달력 | 월 달력에서 특정일로 이동, 날짜 직접 입력, 완료/노트/북마크 표시 |
| 날짜별 본문 | 1년 366일 통독형 본문표(1월 창세기 → 12월 요한계시록) + **교회력·기념일 자동 반영**(신년, 주현절, 설날, 재의 수요일, 종려주일, 고난주간 매일, 부활주일, 승천일, 성령강림주일, 맥추·추수감사주일, 종교개혁기념일, 대림절 4주, 성탄 전야/성탄절, 송구영신, 삼일절, 광복절, 어버이날 등) |
| 성경 본문 | 개역한글(공개 저작물)을 성경 API에서 가져와 D1에 캐시 |
| AI 강해 | Claude가 배경·문맥 → 대지별 강해(원어 풀이 포함) → 그리스도와 복음 → 적용 3가지 → 묵상 질문 3가지 → 기도문 작성. 날짜별로 한 번 생성 후 D1에 저장 |
| 찬양 추천 | 새찬송가 1곡 + CCM 1곡, YouTube 관련 상위 영상 중 조회수 최다 영상 연결. **YouTube 앱에서 재생 / 외부 브라우저로 열기** (카카오톡·라인 인앱 브라우저 탈출 지원) |
| 카드뉴스 이미지 | 오늘의 묵상 **모든 내용을 세로형 한 장 PNG**로 생성(요약 카드 모드도 제공) → 저장 / 공유 |

### 추가로 넣은 기능

- **묵상 완료 체크 & 연속 묵상(스트릭)**, 최장 연속·이번 달·전체 완료 통계
- **나의 묵상 노트**(날짜별 자동 저장) · 노트 텍스트 내보내기 · 전체 백업/복원(JSON)
- **북마크**, 월별 **본문표** 보기
- **본문/기도/묵상 전체 듣기**(브라우저 음성 합성 TTS)
- **아멘(공감) 수 · 함께 읽은 횟수** (D1 집계)
- 공유(Web Share / 링크 복사), **카톡용 전체 텍스트 복사**, 인쇄/PDF 저장
- **다크 모드 · 글자 크기 조절**
- 좌우 **스와이프 / ← → 키**로 이전·다음 날 이동
- **PWA**: 홈 화면에 설치, 한 번 본 묵상은 **오프라인**에서도 열람
- 동시 접속 시 **중복 생성 방지 잠금**(D1), 실패 시 자동 재시도 대기
- GitHub Actions **예약 작업으로 매일 7일치 미리 생성** → 사용자는 기다릴 필요 없음
- 관리자 API로 특정 날짜 **재생성**

## 구조

```
devotional/
  src/shared/      프론트·백엔드 공용: 성경 66권 표, 366일 본문표·교회력(plan.ts), 날짜 유틸, 타입
  src/components/  상단 주간 바(Header), 달력, 찬양 카드, 카드뉴스 모달 등
  src/pages/       DevotionalPage(날짜별 묵상), MyPage(나의 묵상)
  src/lib/         API 클라이언트, 로컬 저장소, 카드 이미지(Canvas) 렌더러, 외부 앱 열기, TTS
  functions/api/devotional/[date]/index.ts   GET  묵상 조회/생성
  functions/api/devotional/[date]/amen.ts    POST 아멘 +1
  functions/api/admin/generate.ts            POST 미리 생성/재생성(ADMIN_TOKEN)
  functions/api/health.ts                    GET  설정 상태 확인
  functions/_lib/   generate.ts(Claude) · bible.ts(성경 본문) · youtube.ts · store.ts(D1)
  migrations/       D1 스키마
  public/           PWA manifest · service worker · 아이콘
```

## 로컬 개발

```bash
cd devotional
npm install
cp .dev.vars.example .dev.vars        # ANTHROPIC_API_KEY 등 입력
npm run db:migrate:local
npm run pages:dev                     # http://localhost:8788 (Functions + 로컬 D1)
```

UI만 수정할 때는 `npm run pages:dev`를 띄워 둔 채 다른 터미널에서 `npm run dev`(Vite, `/api`는 8788로 프록시)를 쓰면 빠릅니다.

## Cloudflare 배포 — 최초 1회

> Cloudflare 계정 자격 증명은 저장소 소유자만 가지고 있으므로 아래 단계는 직접 한 번 진행해야 합니다.

1. **D1 생성**
   ```bash
   cd devotional
   npx wrangler login
   npx wrangler d1 create daily-devotional-db
   ```
   출력된 `database_id`를 `devotional/wrangler.toml`의 `REPLACE_WITH_YOUR_D1_DATABASE_ID`에 붙여넣고 커밋합니다.
2. **스키마 적용**: `npm run db:migrate:remote`
3. **Pages 프로젝트 생성 & 첫 배포**: `npm run deploy` → `https://daily-devotional.pages.dev`
4. **비밀값 등록**(대시보드 Workers & Pages → daily-devotional → Settings → Variables and Secrets, 또는 CLI)
   ```bash
   npx wrangler pages secret put ANTHROPIC_API_KEY --project-name=daily-devotional   # 필수
   npx wrangler pages secret put YOUTUBE_API_KEY   --project-name=daily-devotional   # 권장
   npx wrangler pages secret put ADMIN_TOKEN       --project-name=daily-devotional   # 권장(임의의 긴 문자열)
   ```
   - `ANTHROPIC_API_KEY`: [Claude Console](https://console.anthropic.com/)에서 발급. 기본 모델은 `claude-opus-5-5`(`CLAUDE_MODEL`로 변경 가능). 거절 응답 시 서버 측 대체 모델(`fallbacks: "default"`)로 자동 재시도합니다.
   - `YOUTUBE_API_KEY`: Google Cloud Console → YouTube Data API v3 사용 설정 후 API 키 발급. 없으면 조회수순 YouTube 검색 링크로 대신 연결합니다. (하루 2곡 × 검색 = 약 200 유닛, 무료 할당량 10,000 유닛)
   - 비밀값을 바꾼 뒤에는 한 번 다시 배포해야 반영됩니다.
5. **GitHub Actions 자동 배포** — 저장소 Settings → Secrets and variables → Actions
   - `CLOUDFLARE_API_TOKEN`(Cloudflare Pages: Edit, D1: Edit 권한), `CLOUDFLARE_ACCOUNT_ID`
   - `main`에 `devotional/**` 변경이 push되면 `.github/workflows/deploy-devotional.yml`이 마이그레이션 + 배포
6. **매일 미리 생성(선택, 권장)** — 같은 곳에 `DEVOTIONAL_URL`(예: `https://daily-devotional.pages.dev`), `DEVOTIONAL_ADMIN_TOKEN`(= `ADMIN_TOKEN`) 등록 → `.github/workflows/devotional-prefetch.yml`이 매일 00:10(KST)에 7일치 생성. Actions 탭에서 수동 실행도 가능.

## 운영 메모

- 일반 사용자 요청으로는 `MIN_DATE`(기본 2020-01-01) ~ 오늘+`MAX_FUTURE_DAYS`(기본 14일) 범위만 생성됩니다(비용 보호). 범위 밖 날짜는 본문만 보여 줍니다.
- 특정 날짜 다시 만들기: `curl -X POST -H "Authorization: Bearer $ADMIN_TOKEN" "https://<도메인>/api/admin/generate?date=2026-12-25&force=1"`
- 설정 확인: `GET /api/health`
- 성경 본문은 [getbible.net](https://getbible.net) API의 개역한글(`korean`)을 사용합니다. 다른 소스를 쓰려면 `BIBLE_API_BASE`를 지정하세요(`{base}/{책번호}/{장}.json`, `verses[].verse/text` 형식). 연결에 실패하면 AI가 인용한 본문을 쓰고 화면에 그 사실을 표시합니다.
- AI가 쓴 강해와 찬송가 장 번호는 드물게 틀릴 수 있습니다. 공적으로 사용하기 전에 확인하고, 필요하면 `force=1`로 재생성하세요.
- 설날·추석 날짜는 `src/shared/plan.ts`의 `LUNAR` 표(2024~2030)에 있으며, 이후 연도는 추가해 주세요.
- 개인 기록(완료·노트·북마크·설정)은 로그인 없이 각자의 브라우저에만 저장됩니다.
