# 동호회 월간 일정표 웹앱

GitHub + Cloudflare(Pages Functions, D1, R2)로 만든 동호회용 월간 일정 관리 웹앱입니다.
- 일반 사용자: 배포 링크로 접속하면 **오늘 날짜 기준으로 "해당월"과 "전월"만** 캘린더로 조회할 수 있습니다. 로그인 UI는 전혀 노출되지 않습니다.
- 관리자: 화면 어디에도 링크가 없는 숨김 경로 `/admin/` 로 접속해 `ffadmin` / `freedom` 계정으로 로그인하면 모든 월의 일정을 등록·수정·삭제할 수 있습니다.

## 폴더 구조

```
public/                # 정적 프론트엔드 (Cloudflare Pages가 그대로 서빙)
  index.html            # 일반 사용자용 캘린더
  admin/index.html       # 관리자 전용(숨김) 페이지
  css/style.css
  js/{api,calendar,main,admin}.js
functions/              # Cloudflare Pages Functions (서버리스 API)
  api/login.js, logout.js, session.js, meta.js
  api/events/index.js    # GET(목록) / POST(등록)
  api/events/[id].js     # GET(상세) / PUT(수정) / DELETE(삭제)
  api/images/[key].js    # 이미지 조회 / 다운로드
  _utils/                # 공용 로직(인증, 날짜, 검증) — 라우팅 제외(_ 접두사)
schema.sql               # D1 테이블 정의
wrangler.toml             # Pages/D1/R2 바인딩 설정
.github/workflows/deploy.yml  # GitHub → Cloudflare Pages 자동 배포
```

## 동작 개요

- **캘린더**: 요일별 그리드. 각 날짜 칸에는 등록된 일정이 `시작시간 · 강사명 · 제목` 형식으로 표시됩니다.
- **상세 모달**: 관리자가 "내용"(텍스트) 또는 "이미지"를 등록한 일정만 클릭 가능하며, 클릭하면 모달로 상세 프로그램과 이미지를 보여주고 이미지 다운로드 버튼을 제공합니다. 내용이 없는 일정은 클릭할 수 없고 시간/강사/제목만 표시됩니다.
- **등록(관리자)**: 캘린더에서 날짜 칸의 `+` 버튼을 누르면 등록 폼이 열립니다. 시작시간, 종료시간, 강사, 제목은 필수이며 내용(텍스트)과 이미지는 선택입니다.
- **수정/삭제(관리자)**: 이미 등록된 일정을 클릭하면 같은 폼이 값이 채워진 채로 열리고, 저장 또는 삭제할 수 있습니다.
- **조회 범위 제한**: 일반 사용자의 월 조회 제한은 프론트엔드뿐 아니라 서버(API)에서도 강제합니다. 관리자로 로그인하지 않은 상태로 허용되지 않은 월을 요청하면 403이 반환됩니다.

## 처음 고려사항 외에 추가로 반영한 사항

- 서버 기준(KST, UTC+9) 날짜로 "이번 달/전월"을 계산해 사용자 기기 시간대와 무관하게 동일한 기준을 적용 (`/api/meta`).
- 관리자 세션은 `HttpOnly` + 서명된 쿠키(HMAC-SHA256)로 관리되어 JS로 탈취 불가, 만료(12시간) 처리.
- 이미지 업로드 크기 제한(5MB)과 형식 제한(jpg/png/gif/webp)으로 저장소 남용 방지.
- 이미지 파일은 R2에 임의의 UUID 키로 저장하고 원본 파일명은 별도로 보관해 다운로드 시 원래 이름으로 내려받도록 처리.
- 하루에 여러 일정이 있을 수 있는 동호회 특성을 고려해 한 날짜에 여러 건 등록 가능, 시작시간 순 정렬.
- 오늘 날짜 칸 강조 표시, 일요일/토요일 색상 구분.
- 관리자 페이지는 `<meta name="robots" content="noindex, nofollow">` 로 검색엔진 노출 방지(공개 페이지 어디에도 링크하지 않음 — URL을 아는 사람만 접근).
- 종료시간이 시작시간보다 빠르면 저장 거부 등 최소한의 입력 검증.
- 모바일 환경(동호회원 대부분 스마트폰 사용 가정)을 고려한 반응형 레이아웃.

## Cloudflare 설정 및 배포 방법

### 0. 사전 준비
```bash
npm install
npx wrangler login
```

### 1. D1 데이터베이스 생성
```bash
npx wrangler d1 create geoagent-schedule-db
```
출력된 `database_id` 값을 `wrangler.toml` 의 `database_id = "REPLACE_WITH_YOUR_D1_DATABASE_ID"` 부분에 채워 넣으세요.

### 2. R2 버킷 생성
```bash
npx wrangler r2 bucket create geoagent-schedule-images
```

### 3. 스키마 적용
```bash
npm run db:migrate:remote   # 운영(D1 원격)
npm run db:migrate:local    # 로컬 개발용(선택)
```

### 4. 관리자 계정 / 세션 비밀키 설정 (필수, 보안)
`wrangler.toml` 의 `ADMIN_USERNAME` 은 기본값(`ffadmin`)이 들어 있지만, **비밀번호와 세션 서명키는 반드시 시크릿으로 등록**하세요. 등록하지 않으면 코드에 내장된 기본값(`freedom`)이 사용되므로 실제 운영 전에는 꼭 아래 명령을 실행하세요.
```bash
npx wrangler pages secret put ADMIN_PASSWORD --project-name=geoagent-schedule
npx wrangler pages secret put SESSION_SECRET --project-name=geoagent-schedule
# SESSION_SECRET 은 임의의 긴 랜덤 문자열(예: openssl rand -hex 32 결과)을 사용하세요.
```

### 5. 로컬 개발
```bash
npm run dev
# http://localhost:8788 에서 확인 (일반: /, 관리자: /admin/)
```

### 6. 배포 (GitHub → Cloudflare Pages)
두 가지 방법 중 하나를 사용하면 됩니다.

**A) GitHub Actions로 자동 배포 (이 저장소에 포함된 `.github/workflows/deploy.yml` 사용)**
1. Cloudflare 대시보드에서 API 토큰(Pages/D1/R2 편집 권한)과 계정 ID를 발급받습니다.
2. GitHub 저장소 Settings → Secrets and variables → Actions 에 다음을 등록합니다.
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
3. `main` 브랜치에 push 하면 자동으로 스키마 적용 + Pages 배포가 실행됩니다.

**B) Cloudflare 대시보드에서 Git 연동 (Actions 없이)**
1. Cloudflare 대시보드 → Workers & Pages → Create → Pages → "Connect to Git" 에서 이 저장소를 선택합니다.
2. Build output directory: `public` (빌드 명령 없음)
3. 프로젝트 Settings → Functions 에서 D1 바인딩(`DB`)과 R2 바인딩(`IMAGES`)을 추가합니다.
4. Settings → Environment variables 에서 `ADMIN_PASSWORD`, `SESSION_SECRET` 을 암호화된 값으로 추가합니다.
5. `main` 브랜치에 push 될 때마다 자동 배포됩니다.

### 7. 접속
- 일반 사용자: 배포된 URL을 그대로 공유하면 됩니다. (예: `https://geoagent-schedule.pages.dev/`)
- 관리자: 같은 도메인의 `/admin/` 경로로 접속해 로그인합니다. (예: `https://geoagent-schedule.pages.dev/admin/`) 이 링크는 공개 페이지 어디에도 노출되지 않습니다.

## 보안 유의사항
- 운영 배포 전 `ADMIN_PASSWORD`, `SESSION_SECRET` 시크릿을 반드시 별도로 설정하세요(코드에 내장된 기본값 `freedom` 을 그대로 쓰지 마세요).
- `/admin/` 경로는 링크로 노출하지 않지만 URL 자체가 비밀은 아니므로, 최종 보안은 관리자 비밀번호와 세션 서명키에 의존합니다.
