import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

export const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || 'http://localhost:8000/api/v1'

const ACCESS = 'portfolio_admin_access'
const REFRESH = 'portfolio_admin_refresh'

export const tokens = {
  get access() { return localStorage.getItem(ACCESS) },
  get refresh() { return localStorage.getItem(REFRESH) },
  set(access: string, refresh?: string) {
    localStorage.setItem(ACCESS, access)
    if (refresh) localStorage.setItem(REFRESH, refresh)
  },
  clear() { localStorage.removeItem(ACCESS); localStorage.removeItem(REFRESH) },
}

export const api = axios.create({ baseURL: API_URL })

api.interceptors.request.use((config) => {
  const t = tokens.access
  if (t) config.headers.Authorization = `Bearer ${t}`
  return config
})

let refreshing: Promise<string> | null = null
let onAuthFailure: () => void = () => {}
export const setAuthFailureHandler = (fn: () => void) => { onAuthFailure = fn }

async function refreshAccess(): Promise<string> {
  const refresh = tokens.refresh
  if (!refresh) throw new Error('no refresh token')
  const { data } = await axios.post(`${API_URL}/auth/refresh/`, { refresh })
  tokens.set(data.access, data.refresh)
  return data.access as string
}

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined
    const isAuthCall = original?.url?.includes('/auth/login') || original?.url?.includes('/auth/refresh')
    if (error.response?.status === 401 && original && !original._retry && !isAuthCall) {
      original._retry = true
      try {
        refreshing = refreshing ?? refreshAccess().finally(() => { refreshing = null })
        const access = await refreshing
        original.headers.Authorization = `Bearer ${access}`
        return api(original)
      } catch {
        tokens.clear()
        onAuthFailure()
      }
    }
    return Promise.reject(error)
  },
)

/** DRF list endpoints are either paginated ({results}) or plain arrays. */
export function unwrap<T>(data: unknown): T[] {
  return Array.isArray(data) ? (data as T[]) : ((data as { results: T[] }).results ?? [])
}
