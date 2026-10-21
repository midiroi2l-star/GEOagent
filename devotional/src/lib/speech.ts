import { useEffect, useState } from 'react'

// 브라우저 내장 음성 합성(Web Speech API)으로 본문·묵상을 읽어 줍니다.

let currentId: string | null = null
const listeners = new Set<(id: string | null) => void>()

function emit(id: string | null) {
  currentId = id
  listeners.forEach((l) => l(id))
}

export const speechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

export function speak(id: string, text: string) {
  if (!speechSupported) return
  window.speechSynthesis.cancel()
  if (currentId === id) {
    emit(null)
    return
  }
  // 긴 글은 일부 브라우저에서 중간에 끊기므로 문장 단위로 나눠 순서대로 읽습니다.
  const chunks = text.match(/[^.!?。\n]+[.!?。]?/g)?.map((s) => s.trim()).filter(Boolean) ?? [text]
  const voice = window.speechSynthesis.getVoices().find((v) => v.lang.startsWith('ko'))
  chunks.forEach((chunk, i) => {
    const u = new SpeechSynthesisUtterance(chunk)
    u.lang = 'ko-KR'
    u.rate = 0.95
    if (voice) u.voice = voice
    if (i === chunks.length - 1) u.onend = () => currentId === id && emit(null)
    window.speechSynthesis.speak(u)
  })
  emit(id)
}

export function stopSpeaking() {
  if (speechSupported) window.speechSynthesis.cancel()
  emit(null)
}

export function useSpeaking(): string | null {
  const [id, setId] = useState(currentId)
  useEffect(() => {
    listeners.add(setId)
    return () => {
      listeners.delete(setId)
    }
  }, [])
  return id
}
