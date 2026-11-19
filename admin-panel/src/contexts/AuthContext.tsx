import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api, setAuthFailureHandler, tokens } from '../services/api'
import { ROLE_RANK, type Role, type User } from '../types'

interface AuthState {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  can: (min: Role) => boolean
}

const Ctx = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setAuthFailureHandler(() => setUser(null))
    if (!tokens.access && !tokens.refresh) { setLoading(false); return }
    api.get<User>('/auth/profile/').then((r) => setUser(r.data)).catch(() => tokens.clear()).finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    const { data } = await api.post('/auth/login/', { username, password })
    tokens.set(data.access, data.refresh)
    setUser(data.user as User)
  }, [])

  const logout = useCallback(async () => {
    try { if (tokens.refresh) await api.post('/auth/logout/', { refresh: tokens.refresh }) } catch { /* token may already be invalid */ }
    tokens.clear()
    setUser(null)
  }, [])

  const can = useCallback((min: Role) => !!user && ROLE_RANK[user.role] >= ROLE_RANK[min], [user])
  const value = useMemo(() => ({ user, loading, login, logout, can }), [user, loading, login, logout, can])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useAuth outside AuthProvider')
  return v
}
