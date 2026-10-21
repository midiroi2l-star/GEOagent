import { useCallback, useEffect, useState } from 'react'

export function useToast() {
  const [msg, setMsg] = useState<string | null>(null)
  useEffect(() => {
    if (!msg) return
    const t = setTimeout(() => setMsg(null), 2200)
    return () => clearTimeout(t)
  }, [msg])
  const show = useCallback((m: string) => setMsg(m), [])
  const node = msg ? (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center px-4" role="status">
      <div className="rounded-full bg-neutral-900/90 px-5 py-2.5 text-sm text-white shadow-lg">{msg}</div>
    </div>
  ) : null
  return { show, node }
}
