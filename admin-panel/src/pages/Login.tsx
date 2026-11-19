import { zodResolver } from '@hookform/resolvers/zod'
import { LockKeyhole } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Button, ErrorBox } from '../components/ui'
import { useAuth } from '../contexts/AuthContext'
import { LanguageSwitcher, t } from '../i18n'
import { api } from '../services/api'
import { parseApiError } from '../utils/format'

const makeSchema = () => z.object({ username: z.string().min(1, t('Username is required')), password: z.string().min(1, t('Password is required')) })
const makeForgotSchema = () => z.object({ email: z.string().email(t('Enter a valid email')) })

export function AuthShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-navy p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-7 shadow-2xl">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white"><LockKeyhole size={20} aria-hidden /></span>
          <div><h1 className="text-lg font-bold leading-tight">{title}</h1><p className="text-xs text-slate-500">{t('Portfolio administration')}</p></div>
          <LanguageSwitcher light className="ml-auto" />
        </div>
        {children}
      </div>
    </div>
  )
}

export default function Login() {
  const { user, login } = useAuth()
  const nav = useNavigate()
  const loc = useLocation() as { state?: { from?: string } }
  const [error, setError] = useState<string | null>(null)
  const [forgot, setForgot] = useState(false)
  const [sent, setSent] = useState(false)
  const schema = useMemo(makeSchema, [])
  const forgotSchema = useMemo(makeForgotSchema, [])
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) })
  const f = useForm({ resolver: zodResolver(forgotSchema) })

  if (user) return <Navigate to={loc.state?.from || '/'} replace />

  const submit = handleSubmit(async (v) => {
    setError(null)
    try { await login(v.username, v.password); nav(loc.state?.from || '/', { replace: true }) }
    catch (e) {
      const r = (e as { response?: { status?: number } }).response?.status
      setError(r === 401 ? t('Incorrect username or password.') : parseApiError(e).message)
    }
  })

  if (forgot) {
    return (
      <AuthShell title={t('Reset password')}>
        {sent ? <p className="text-sm text-slate-600">{t('If that email belongs to an account, a reset link has been sent.')}</p> : (
          <form className="space-y-4" noValidate onSubmit={f.handleSubmit(async (v) => {
            setError(null)
            try { await api.post('/auth/password-reset/', v); setSent(true) } catch (e) { setError(parseApiError(e).message) }
          })}>
            {error && <ErrorBox message={error} />}
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-semibold">{t('Email')}</label>
              <input id="email" type="email" className="input" aria-invalid={!!f.formState.errors.email} {...f.register('email')} />
              {f.formState.errors.email && <p role="alert" className="mt-1 text-xs text-red-600">{f.formState.errors.email.message}</p>}
            </div>
            <Button type="submit" className="w-full" loading={f.formState.isSubmitting}>{t('Send reset link')}</Button>
          </form>
        )}
        <button onClick={() => { setForgot(false); setSent(false); setError(null) }} className="mt-4 text-sm font-semibold text-brand hover:underline">{t('Back to sign in')}</button>
      </AuthShell>
    )
  }

  return (
    <AuthShell title={t('Sign in')}>
      <form onSubmit={submit} noValidate className="space-y-4">
        {error && <ErrorBox message={error} />}
        <div>
          <label htmlFor="username" className="mb-1 block text-sm font-semibold">{t('Username')}</label>
          <input id="username" autoComplete="username" className="input" aria-invalid={!!errors.username} {...register('username')} />
          {errors.username && <p role="alert" className="mt-1 text-xs text-red-600">{errors.username.message}</p>}
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-semibold">{t('Password')}</label>
          <input id="password" type="password" autoComplete="current-password" className="input" aria-invalid={!!errors.password} {...register('password')} />
          {errors.password && <p role="alert" className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
        </div>
        <Button type="submit" className="w-full" loading={isSubmitting}>{t('Sign in')}</Button>
        <button type="button" onClick={() => setForgot(true)} className="text-sm font-semibold text-brand hover:underline">{t('Forgot password?')}</button>
      </form>
    </AuthShell>
  )
}
