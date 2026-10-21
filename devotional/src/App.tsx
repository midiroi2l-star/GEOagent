import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import { isValidDate, todayLocal } from './shared/dates'
import { usePersonal } from './lib/store'
import DevotionalPage from './pages/DevotionalPage'
import MyPage from './pages/MyPage'

function ThemeSync() {
  const { settings } = usePersonal()
  useEffect(() => {
    const mq = matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const dark = settings.theme === 'dark' || (settings.theme === 'system' && mq.matches)
      document.documentElement.classList.toggle('dark', dark)
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#121614' : '#2f5d50')
    }
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [settings.theme])
  useEffect(() => {
    document.documentElement.style.fontSize = `${settings.fontScale * 100}%`
  }, [settings.fontScale])
  return null
}

function DateRoute() {
  const { date = '' } = useParams()
  if (!isValidDate(date)) return <Navigate to={`/d/${todayLocal()}`} replace />
  return <DevotionalPage key={date} date={date} />
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeSync />
      <Routes>
        <Route path="/d/:date" element={<DateRoute />} />
        <Route path="/my" element={<MyPage />} />
        <Route path="/today" element={<Navigate to={`/d/${todayLocal()}`} replace />} />
        <Route path="*" element={<Navigate to={`/d/${todayLocal()}`} replace />} />
      </Routes>
    </BrowserRouter>
  )
}
