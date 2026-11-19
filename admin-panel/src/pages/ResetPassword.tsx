import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { Button, ErrorBox } from '../components/ui'
import { api } from '../services/api'
import { parseApiError } from '../utils/format'
import { AuthShell } from './Login'

const schema = z.object({ new_password: z.string().min(10, 'At least 10 characters'), confirm: z.string() })
  .refine((v) => v.new_password === v.confirm, { path: ['confirm'], message: 'Passwords do not match' })

export default function ResetPassword() {
  const [params] = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) })
  return (
    <AuthShell title="Choose a new password">
      {done ? <p className="text-sm">Password updated. <Link to="/login" className="font-semibold text-brand">Sign in</Link></p> : (
        <form noValidate className="space-y-4" onSubmit={handleSubmit(async (v) => {
          setError(null)
          try { await api.post('/auth/password-reset/confirm/', { uid: params.get('uid'), token: params.get('token'), new_password: v.new_password }); setDone(true) }
          catch (e) { setError(parseApiError(e).message) }
        })}>
          {error && <ErrorBox message={error} />}
          <div><label htmlFor="np" className="mb-1 block text-sm font-semibold">New password</label>
            <input id="np" type="password" autoComplete="new-password" className="input" {...register('new_password')} />
            {errors.new_password && <p role="alert" className="mt-1 text-xs text-red-600">{errors.new_password.message}</p>}</div>
          <div><label htmlFor="cp" className="mb-1 block text-sm font-semibold">Confirm password</label>
            <input id="cp" type="password" autoComplete="new-password" className="input" {...register('confirm')} />
            {errors.confirm && <p role="alert" className="mt-1 text-xs text-red-600">{errors.confirm.message}</p>}</div>
          <Button type="submit" className="w-full" loading={isSubmitting}>Update password</Button>
        </form>
      )}
    </AuthShell>
  )
}
