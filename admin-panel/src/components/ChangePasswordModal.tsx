import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { t } from '../i18n'
import { api } from '../services/api'
import { parseApiError } from '../utils/format'
import { Button, ErrorBox, Modal } from './ui'

const makeSchema = () => z.object({ old_password: z.string().min(1, t('Required')), new_password: z.string().min(10, t('At least 10 characters')), confirm: z.string() })
  .refine((v) => v.new_password === v.confirm, { path: ['confirm'], message: t('Passwords do not match') })

export default function ChangePasswordModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState(false)
  const schema = useMemo(makeSchema, [])
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) })
  const close = () => { reset(); setOk(false); setError(null); onClose() }
  const Field = ({ name, label }: { name: 'old_password' | 'new_password' | 'confirm'; label: string }) => (
    <div><label htmlFor={name} className="mb-1 block text-sm font-semibold">{label}</label>
      <input id={name} type="password" className="input" autoComplete={name === 'old_password' ? 'current-password' : 'new-password'} {...register(name)} />
      {errors[name] && <p role="alert" className="mt-1 text-xs text-red-600">{errors[name]?.message}</p>}</div>
  )
  return (
    <Modal open={open} title={t('Change password')} onClose={close}>
      {ok ? <div><p className="text-sm">{t('Your password has been changed.')}</p><div className="mt-4 text-right"><Button onClick={close}>{t('Close')}</Button></div></div> : (
        <form noValidate className="space-y-4" onSubmit={handleSubmit(async (v) => {
          setError(null)
          try { await api.post('/auth/change-password/', { old_password: v.old_password, new_password: v.new_password }); setOk(true) }
          catch (e) { const p = parseApiError(e); setError(p.message) }
        })}>
          {error && <ErrorBox message={error} />}
          <Field name="old_password" label={t('Current password')} />
          <Field name="new_password" label={t('New password')} />
          <Field name="confirm" label={t('Confirm new password')} />
          <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={close}>{t('Cancel')}</Button><Button type="submit" loading={isSubmitting}>{t('Change password')}</Button></div>
        </form>
      )}
    </Modal>
  )
}
