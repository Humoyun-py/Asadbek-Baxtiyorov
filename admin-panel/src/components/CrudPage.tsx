import { GripVertical, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'
import { api, unwrap } from '../services/api'
import type { Paginated, Role } from '../types'
import { parseApiError } from '../utils/format'
import { ResourceForm, type FieldDef } from './forms'
import { Badge, Button, Card, ConfirmDialog, ErrorBox, Modal, PageHeader, Pager, Spinner, Toast } from './ui'

type Row = Record<string, unknown> & { id: number }

export interface Column { key: string; label: string; render?: (row: Row) => ReactNode; className?: string }

export interface CrudConfig {
  title: string
  subtitle?: string
  resource: string                 // e.g. 'services'
  singular: string                 // e.g. 'service'
  columns: Column[]
  fields: FieldDef[]
  searchable?: boolean
  reorderable?: boolean            // drag-and-drop display_order
  filters?: { name: string; label: string; options?: { value: string; label: string }[]; optionsFrom?: { resource: string; label: string } }[]
  pageSize?: number
  multipart?: boolean
  writeRole?: Role                 // min role to create/edit (default ADMIN)
  deleteRole?: Role                // min role to delete (default ADMIN)
  togglePublish?: string           // boolean field with a quick toggle in the list (e.g. is_published)
  renderFormExtra?: (item: Row, reload: () => void) => ReactNode   // shown in edit modal (galleries, nested stats)
  wide?: boolean
}

function FilterSelect({ f, value, onChange }: { f: NonNullable<CrudConfig['filters']>[number]; value: string; onChange: (v: string) => void }) {
  const [opts, setOpts] = useState(f.options ?? [])
  useEffect(() => {
    if (!f.optionsFrom) return
    api.get(`/${f.optionsFrom.resource}/`, { params: { page_size: 200 } }).then((r) =>
      setOpts(unwrap<Record<string, unknown>>(r.data).map((o) => ({ value: String(o.id), label: String(o[f.optionsFrom!.label]) }))))
  }, [f.optionsFrom])
  return (
    <select aria-label={f.label} className="input !w-auto" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">{f.label}: all</option>
      {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

export default function CrudPage({ cfg }: { cfg: CrudConfig }) {
  const { can } = useAuth()
  const { toast, show } = useToast()
  const pageSize = cfg.reorderable ? 200 : cfg.pageSize ?? 20
  const [rows, setRows] = useState<Row[]>([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debounced, setDebounced] = useState('')
  const [filterVals, setFilterVals] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<Row | 'new' | null>(null)
  const [saving, setSaving] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [formMessage, setFormMessage] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<Row | null>(null)
  const [busy, setBusy] = useState(false)
  const dragId = useRef<number | null>(null)

  const canWrite = can(cfg.writeRole ?? 'ADMIN')
  const canDelete = can(cfg.deleteRole ?? 'ADMIN')
  const filtering = !!debounced || Object.values(filterVals).some(Boolean)

  useEffect(() => { const t = setTimeout(() => { setDebounced(search); setPage(1) }, 300); return () => clearTimeout(t) }, [search])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, unknown> = { page, page_size: pageSize }
      if (debounced) params.search = debounced
      for (const [k, v] of Object.entries(filterVals)) if (v) params[k] = v
      const { data } = await api.get<Paginated<Row> | Row[]>(`/${cfg.resource}/`, { params })
      const list = unwrap<Row>(data)
      setRows(list)
      setCount(Array.isArray(data) ? list.length : data.count)
      setError(null)
    } catch (e) { setError(parseApiError(e).message) } finally { setLoading(false) }
  }, [cfg.resource, page, pageSize, debounced, filterVals])
  useEffect(() => { load() }, [load])

  const close = () => { setEditing(null); setFormErrors({}); setFormMessage(null) }

  const save = async (body: FormData | Record<string, unknown>) => {
    setSaving(true); setFormErrors({}); setFormMessage(null)
    try {
      if (editing === 'new') await api.post(`/${cfg.resource}/`, body)
      else if (editing) await api.patch(`/${cfg.resource}/${editing.id}/`, body)
      show(editing === 'new' ? `${cfg.singular} created` : `${cfg.singular} saved`)
      close(); load()
    } catch (e) { const p = parseApiError(e); setFormErrors(p.fields); setFormMessage(p.message) } finally { setSaving(false) }
  }

  const remove = async () => {
    if (!deleting) return
    setBusy(true)
    try { await api.delete(`/${cfg.resource}/${deleting.id}/`); show(`${cfg.singular} deleted`); setDeleting(null); load() }
    catch (e) { show(parseApiError(e).message, 'error'); setDeleting(null) } finally { setBusy(false) }
  }

  const toggle = async (row: Row) => {
    const field = cfg.togglePublish!
    try { await api.patch(`/${cfg.resource}/${row.id}/`, { [field]: !row[field] }); load() }
    catch (e) { show(parseApiError(e).message, 'error') }
  }

  const reorder = async (targetId: number) => {
    const from = dragId.current
    dragId.current = null
    if (from == null || from === targetId) return
    const next = [...rows]
    const i = next.findIndex((r) => r.id === from)
    const j = next.findIndex((r) => r.id === targetId)
    next.splice(j, 0, next.splice(i, 1)[0])
    setRows(next)
    try { await api.post(`/${cfg.resource}/reorder/`, { ids: next.map((r) => r.id) }); show('Order saved') }
    catch (e) { show(parseApiError(e).message, 'error'); load() }
  }

  const dragEnabled = !!cfg.reorderable && canWrite && !filtering

  return (
    <div>
      <PageHeader title={cfg.title} subtitle={cfg.subtitle}
        actions={canWrite && <Button onClick={() => setEditing('new')}><Plus size={16} aria-hidden /> New {cfg.singular}</Button>} />
      <Card className="!p-0">
        {(cfg.searchable || cfg.filters) && (
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
            {cfg.searchable && (
              <div className="relative min-w-[220px] flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden />
                <input className="input !pl-9" placeholder={`Search ${cfg.title.toLowerCase()}…`} aria-label="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            )}
            {cfg.filters?.map((f) => <FilterSelect key={f.name} f={f} value={filterVals[f.name] ?? ''} onChange={(v) => { setFilterVals({ ...filterVals, [f.name]: v }); setPage(1) }} />)}
          </div>
        )}
        {error ? <div className="p-4"><ErrorBox message={error} onRetry={load} /></div>
          : loading && !rows.length ? <Spinner />
          : !rows.length ? <p className="py-16 text-center text-sm text-slate-500">{filtering ? 'Nothing matches your search.' : `No ${cfg.title.toLowerCase()} yet.`}</p>
          : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    {dragEnabled && <th className="w-8 px-2 py-3"><span className="sr-only">Reorder</span></th>}
                    {cfg.columns.map((c) => <th key={c.key} className="px-4 py-3 font-semibold">{c.label}</th>)}
                    <th className="px-4 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((row) => (
                    <tr key={row.id} draggable={dragEnabled} onDragStart={() => { dragId.current = row.id }}
                      onDragOver={(e) => dragEnabled && e.preventDefault()} onDrop={() => dragEnabled && reorder(row.id)} className="hover:bg-slate-50/70">
                      {dragEnabled && <td className="px-2 text-slate-400"><GripVertical size={16} className="cursor-grab" aria-label="Drag to reorder" /></td>}
                      {cfg.columns.map((c) => <td key={c.key} className={`px-4 py-3 ${c.className ?? ''}`}>{c.render ? c.render(row) : String(row[c.key] ?? '—')}</td>)}
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        {cfg.togglePublish && canWrite && (
                          <button onClick={() => toggle(row)} className="mr-2 text-xs font-semibold text-brand hover:underline">
                            {row[cfg.togglePublish] ? 'Unpublish' : 'Publish'}
                          </button>
                        )}
                        {canWrite && <button aria-label={`Edit ${cfg.singular}`} onClick={() => setEditing(row)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><Pencil size={16} /></button>}
                        {canDelete && <button aria-label={`Delete ${cfg.singular}`} onClick={() => setDeleting(row)} className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"><Trash2 size={16} /></button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        {!cfg.reorderable && <div className="px-4 pb-4"><Pager page={page} count={count} pageSize={pageSize} onPage={setPage} /></div>}
      </Card>
      {dragEnabled && rows.length > 1 && <p className="mt-2 text-xs text-slate-500">Drag the grip handle to change the display order.</p>}

      <Modal open={!!editing} wide={cfg.wide ?? true} title={editing === 'new' ? `New ${cfg.singular}` : `Edit ${cfg.singular}`} onClose={close}>
        {formMessage && <div className="mb-4"><ErrorBox message={formMessage} /></div>}
        {editing && (
          <ResourceForm fields={cfg.fields} item={editing === 'new' ? null : editing} submitting={saving} serverErrors={formErrors}
            multipart={cfg.multipart ?? true} onSubmit={save} onCancel={close}>
            {editing !== 'new' && cfg.renderFormExtra?.(editing, load)}
          </ResourceForm>
        )}
      </Modal>
      <ConfirmDialog open={!!deleting} title={`Delete ${cfg.singular}?`} text="This cannot be undone." busy={busy} onConfirm={remove} onCancel={() => setDeleting(null)} />
      <Toast message={toast?.message ?? null} tone={toast?.tone} />
    </div>
  )
}

export const yesNo = (v: unknown) => <Badge tone={v ? 'green' : 'slate'}>{v ? 'Yes' : 'No'}</Badge>
