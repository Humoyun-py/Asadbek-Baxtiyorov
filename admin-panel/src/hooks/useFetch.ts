import { useCallback, useEffect, useState } from 'react'
import { api } from '../services/api'
import { parseApiError } from '../utils/format'

/** GET helper with loading + error state. Re-runs when url changes; `reload` refetches. */
export function useFetch<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(!!url)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!url) return
    let alive = true
    setLoading(true)
    api.get<T>(url)
      .then((r) => { if (alive) { setData(r.data); setError(null) } })
      .catch((e) => { if (alive) setError(parseApiError(e).message) })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [url, tick])

  const reload = useCallback(() => setTick((t) => t + 1), [])
  return { data, loading, error, reload, setData }
}
