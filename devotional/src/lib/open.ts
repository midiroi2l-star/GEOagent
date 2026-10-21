// 외부 앱/브라우저로 여는 도우미 — 카카오톡·라인 등 인앱 브라우저에서도 바깥으로 빠져나갈 수 있게 처리합니다.

const ua = typeof navigator === 'undefined' ? '' : navigator.userAgent

export const isAndroid = /Android/i.test(ua)
export const isIOS = /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && typeof document !== 'undefined' && 'ontouchend' in document)
export const isKakao = /KAKAOTALK/i.test(ua)
export const isLine = /\bLine\//i.test(ua)
export const isInApp = isKakao || isLine || /FBAN|FBAV|Instagram|NAVER\(inapp|DaumApps|wv\)/i.test(ua)

/** 외부(기본) 브라우저로 열기 */
export function openInBrowser(url: string) {
  if (isKakao) {
    location.href = `kakaotalk://web/openExternal?url=${encodeURIComponent(url)}`
    return
  }
  if (isLine) {
    const u = new URL(url)
    u.searchParams.set('openExternalBrowser', '1')
    location.href = u.toString()
    return
  }
  if (isAndroid && isInApp) {
    const u = new URL(url)
    location.href = `intent://${u.host}${u.pathname}${u.search}#Intent;scheme=https;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;S.browser_fallback_url=${encodeURIComponent(url)};end`
    return
  }
  window.open(url, '_blank', 'noopener,noreferrer')
}

/** YouTube 앱으로 열기(앱이 없으면 브라우저로) */
export function openInYouTubeApp(url: string) {
  const u = new URL(url)
  if (isAndroid) {
    location.href = `intent://${u.host}${u.pathname}${u.search}#Intent;scheme=https;package=com.google.android.youtube;S.browser_fallback_url=${encodeURIComponent(url)};end`
    return
  }
  if (isIOS) {
    const fallback = setTimeout(() => {
      if (document.visibilityState === 'visible') openInBrowser(url)
    }, 1600)
    document.addEventListener('visibilitychange', () => clearTimeout(fallback), { once: true })
    location.href = `youtube://${u.host}${u.pathname}${u.search}`
    return
  }
  // 데스크톱: 새 탭(설치형 YouTube 앱/PWA가 있으면 브라우저가 연결해 줌)
  window.open(url, '_blank', 'noopener,noreferrer')
}

export async function shareOrCopy(data: { title: string; text: string; url: string }): Promise<'shared' | 'copied' | 'failed'> {
  if (navigator.share) {
    try {
      await navigator.share(data)
      return 'shared'
    } catch (err) {
      if ((err as DOMException).name === 'AbortError') return 'failed'
    }
  }
  return (await copyText(`${data.title}\n${data.url}`)) ? 'copied' : 'failed'
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    ta.remove()
    return ok
  }
}
