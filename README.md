# 🧭 강점나침반 (Strength Compass)

강점 발견 워크숍용 웹앱입니다. 참가자는 상황(암웨이 사업자·직장인·자영업자·주부·취준생·학생)을 선택하고 이름을 입력한 뒤 48문항 설문에 응답하면, VIA 성격강점 분류체계 기반 24개 강점 · 6개 핵심덕목 레이더 차트, 대표강점 TOP5 분석, 성장 영역, GROW 모델 기반 90일 액션플랜이 담긴 A4 PDF 컨설팅 리포트를 받습니다. 코치를 위한 별도의 상세 코칭 매뉴얼(PDF)도 제공하며, 관리자 페이지에서는 전체 참여 현황과 개인별 결과를 조회할 수 있습니다.

## 스택

- **프론트엔드**: React 19 + TypeScript + Vite + Tailwind CSS v4 + React Router + Recharts(레이더/막대 차트) + jsPDF/html2canvas(PDF 생성)
- **백엔드**: Cloudflare Pages Functions (`/functions/api/**`)
- **DB**: Cloudflare D1 (SQLite 기반 서버리스 DB)
- **배포**: Cloudflare Pages (GitHub 연동 또는 GitHub Actions)

## 폴더 구조

```
src/
  data/         강점·덕목·페르소나·설문문항·코칭노트·방법론 콘텐츠
  shared/       프론트/백엔드 공용 타입, 채점(scoring), 액션플랜 생성 로직
  components/   RadarChartView, ReportDocument(리포트 본문), 설문 UI 등
  pages/        랜딩/설문/리포트/코치가이드/관리자 페이지
  context/      진행 중인 설문 세션 상태(SessionContext)
functions/
  api/submit.ts               설문 제출 → 채점 → D1 저장
  api/admin/login.ts …         관리자 인증(쿠키 세션) 및 조회 API
  _lib/                        인증 헬퍼(라우팅에서 제외되는 접두사 `_`)
migrations/0001_init.sql       D1 스키마
wrangler.toml                  Cloudflare Pages/D1 설정
.github/workflows/deploy.yml   main 브랜치 push 시 Cloudflare Pages 자동 배포
```

## 로컬 개발

```bash
npm install
npm run dev          # UI만 빠르게 볼 때 (백엔드 API는 동작하지 않음)
npm run pages:dev     # 빌드 후 wrangler로 Functions+D1까지 포함해 로컬 풀스택 실행
```

`npm run dev`로 실행할 때는 참가자 플로우(진단→채점→리포트→PDF)는 전부 클라이언트에서 계산되므로 정상 동작하지만, `/api/submit` 저장과 관리자 페이지는 Pages Functions + D1이 필요하므로 `npm run pages:dev`로 확인하세요.

## Cloudflare 배포 — 최초 1회 설정

이 저장소에는 Cloudflare Pages/D1/GitHub Actions 배포 코드가 모두 준비되어 있지만, **Cloudflare 계정 자격 증명은 이 세션에서 접근할 수 없어 실제 프로젝트 생성/배포는 저장소 소유자가 아래 순서로 한 번 진행해야 합니다.**

### 1) D1 데이터베이스 생성

```bash
npx wrangler login
npx wrangler d1 create strength-compass-db
```

출력된 `database_id` 값을 `wrangler.toml`의 `database_id = "REPLACE_WITH_YOUR_D1_DATABASE_ID"` 부분에 붙여넣고 커밋하세요.

### 2) 스키마 적용

```bash
npm run db:migrate:remote
```

### 3) Cloudflare Pages 프로젝트 생성 & 첫 배포

```bash
npm run build
npx wrangler pages deploy dist --project-name=strength-compass
```

배포가 끝나면 `https://strength-compass.pages.dev` 형태의 URL이 출력됩니다. 이후 GitHub과 연결해 자동 배포하려면 Cloudflare 대시보드 → Workers & Pages → strength-compass → Settings → Builds에서 저장소를 연결하거나, 아래 GitHub Actions 방식을 사용하세요.

### 4) GitHub Actions 자동 배포(선택)

리포지토리 Settings → Secrets and variables → Actions에 아래 값을 등록하면 `main` 브랜치에 push할 때마다 자동 배포됩니다(`.github/workflows/deploy.yml`).

- `CLOUDFLARE_API_TOKEN` (Edit Cloudflare Workers 권한 포함 토큰)
- `CLOUDFLARE_ACCOUNT_ID`

### 5) 환경변수(관리자 인증)

기본값은 `admin` / `admin1004` 입니다(하드코딩된 폴백). 운영 환경에서는 Cloudflare Pages 대시보드 → Settings → Environment variables에서 아래 값을 **암호화(Encrypt)** 로 등록해 재정의하는 것을 권장합니다.

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET` (임의의 긴 문자열 — 세션 쿠키 서명용, 운영 환경에서는 필수)

## 관리자 페이지

- URL: `/admin/login` (사이트 내 어디에도 링크되어 있지 않습니다)
- 계정: `admin` / `admin1004`
- 기능: 전체 참여 현황 대시보드(대상군 분포, 평균 강점 점수, 대표강점 랭킹), 개인별 설문·컨설팅 결과 조회, 코칭 매뉴얼 PDF 다운로드 링크

## 분석·컨설팅 기법

- **분석**: VIA(Values in Action) 성격강점 분류체계(Peterson & Seligman, 2004) — 24개 성격강점 · 6개 핵심덕목, 5점 리커트 48문항, 개인 내 상대순위(ipsative) 방식
- **컨설팅**: GROW 코칭모델(Whitmore, 1992), 강점기반 코칭(Linley & Harrington, 2006), 목표설정이론(Locke & Latham, 1990)

리포트 하단과 코치 매뉴얼 마지막 페이지에 출처가 표기되어 있습니다.
