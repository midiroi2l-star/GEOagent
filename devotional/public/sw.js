// 매일 묵상 서비스 워커 — 앱 셸과 한 번 열어 본 묵상을 오프라인에서도 볼 수 있게 캐시합니다.
const VERSION = 'v1'
const SHELL = `shell-${VERSION}`
const DATA = `data-${VERSION}`

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL).then((c) => c.addAll(['/', '/icon.svg', '/manifest.webmanifest'])))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => ![SHELL, DATA].includes(k)).map((k) => caches.delete(k)))),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== location.origin) return

  // 묵상 API: 네트워크 우선, 실패하면 캐시(완성된 묵상만 저장)
  if (url.pathname.startsWith('/api/devotional/')) {
    const key = url.origin + url.pathname
    event.respondWith(
      fetch(req)
        .then(async (res) => {
          if (res.ok) {
            const body = await res.clone().json().catch(() => null)
            if (body && body.status === 'ready') (await caches.open(DATA)).put(key, res.clone())
          }
          return res
        })
        .catch(async () => (await caches.match(key)) || Response.error()),
    )
    return
  }
  if (url.pathname.startsWith('/api/')) return

  // 페이지 이동: 네트워크 우선, 오프라인이면 캐시된 앱 셸
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          caches.open(SHELL).then((c) => c.put('/', res.clone()))
          return res
        })
        .catch(async () => (await caches.match('/')) || Response.error()),
    )
    return
  }

  // 정적 파일(해시된 빌드 산출물): 캐시 우선
  event.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok && url.pathname.startsWith('/assets/')) caches.open(SHELL).then((c) => c.put(req, res.clone()))
          return res
        }),
    ),
  )
})
