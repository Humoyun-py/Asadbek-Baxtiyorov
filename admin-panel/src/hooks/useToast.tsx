import { useCallback, useRef, useState } from 'react'

export function useToast() {
  const [toast, setToast] = useState<{ message: string; tone: 'success' | 'error' } | null>(null)
  const timer = useRef<number>(0)
  const show = useCallback((message: string, tone: 'success' | 'error' = 'success') => {
    setToast({ message, tone })
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setToast(null), 3500)
  }, [])
  return { toast, show }
}
