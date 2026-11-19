import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useFetch } from '../hooks/useFetch'
import { useToast } from '../hooks/useToast'
import { api } from '../services/api'
import type { Role } from '../types'
import { parseApiError } from '../utils/format'
import { ResourceForm, type FieldDef } from './forms'
import { Card, ErrorBox, PageHeader, Spinner, Toast } from './ui'

/** Edit a single-record resource (profile, website settings). */
export default function SingletonForm({ title, subtitle, endpoint, fields, writeRole = 'ADMIN' }: {
  title: string; subtitle?: string; endpoint: string; fields: FieldDef[]; writeRole?: Role
}) {
  const { can } = useAuth()
  const { data, loading, error, reload } = useFetch<Record<string, unknown>>(endpoint)
  const { toast, show } = useToast()
  const [saving, setSaving] = useState(false)
  const [errs, setErrs] = useState<Record<string, string>>({})
  const [msg, setMsg] = useState<string | null>(null)
  const writable = can(writeRole)

  const save = async (body: FormData | Record<string, unknown>) => {
    setSaving(true); setErrs({}); setMsg(null)
    try { await api.patch(endpoint, body); show('Saved'); reload() }
    catch (e) { const p = parseApiError(e); setErrs(p.fields); setMsg(p.message) } finally { setSaving(false) }
  }

  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />
      <Card>
        {loading && !data ? <Spinner /> : error ? <ErrorBox message={error} onRetry={reload} /> : data && (
          <>
            {!writable && <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Your role can view but not change these values.</p>}
            {msg && <div className="mb-4"><ErrorBox message={msg} /></div>}
            <fieldset disabled={!writable}>
              <ResourceForm fields={fields} item={data} submitting={saving} serverErrors={errs} onSubmit={save} />
            </fieldset>
          </>
        )}
      </Card>
      <Toast message={toast?.message ?? null} tone={toast?.tone} />
    </div>
  )
}
