import { Mail, Search, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Badge, Button, Card, ConfirmDialog, ErrorBox, Modal, PageHeader, Pager, Spinner, Toast } from '../components/ui'
import { useToast } from '../hooks/useToast'
import { t } from '../i18n'
import { api } from '../services/api'
import type { ContactMessage, Paginated } from '../types'
import { fmtDate, parseApiError } from '../utils/format'

const STATUS: Record<ContactMessage['status'], { label: string; tone: 'blue' | 'amber' | 'green' | 'red' }> = {
  NEW: { label: 'New', tone: 'blue' }, IN_PROGRESS: { label: 'In progress', tone: 'amber' }, COMPLETED: { label: 'Completed', tone: 'green' }, SPAM: { label: 'Spam', tone: 'red' },
}

export default function MessagesPage() {
  const { toast, show } = useToast()
  const [data, setData] = useState<Paginated<ContactMessage> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [q, setQ] = useState('')
  const [open, setOpen] = useState<ContactMessage | null>(null)
  const [del, setDel] = useState<ContactMessage | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => { const t = setTimeout(() => { setQ(search); setPage(1) }, 300); return () => clearTimeout(t) }, [search])
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get<Paginated<ContactMessage>>('/contacts/', { params: { page, page_size: 15, status: status || undefined, search: q || undefined } })
      setData(data); setError(null)
    } catch (e) { setError(parseApiError(e).message) } finally { setLoading(false) }
  }, [page, status, q])
  useEffect(() => { load() }, [load])

  const setMsgStatus = async (m: ContactMessage, s: ContactMessage['status']) => {
    try {
      const { data: upd } = await api.patch<ContactMessage>(`/contacts/${m.id}/`, { status: s })
      setOpen(upd); show(t('Status updated')); load(); window.dispatchEvent(new Event('messages-changed'))
    } catch (e) { show(parseApiError(e).message, 'error') }
  }
  const remove = async () => {
    if (!del) return
    setBusy(true)
    try { await api.delete(`/contacts/${del.id}/`); show(t('Message deleted')); setDel(null); setOpen(null); load(); window.dispatchEvent(new Event('messages-changed')) }
    catch (e) { show(parseApiError(e).message, 'error'); setDel(null) } finally { setBusy(false) }
  }

  return (
    <div>
      <PageHeader title="Contact messages" subtitle="Messages sent through the website contact form." />
      <Card className="!p-0">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
          <div className="relative min-w-[220px] flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden />
            <input className="input !pl-9" aria-label={t('Search messages')} placeholder={t('Search name, email, subject…')} value={search} onChange={(e) => setSearch(e.target.value)} /></div>
          <select aria-label={t('Status')} className="input !w-auto" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}>
            <option value="">{t('Status: all')}</option>{Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{t(v.label)}</option>)}
          </select>
        </div>
        {error ? <div className="p-4"><ErrorBox message={error} onRetry={load} /></div> : loading && !data ? <Spinner /> : !data?.results.length ? (
          <p className="py-16 text-center text-sm text-slate-500"><Mail className="mx-auto mb-2 text-slate-300" aria-hidden />{t('No messages.')}</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {data.results.map((m) => (
              <li key={m.id}>
                <button onClick={() => setOpen(m)} className="flex w-full items-center gap-4 px-4 py-3 text-left hover:bg-slate-50">
                  <div className="min-w-0 flex-1">
                    <div className={`truncate text-sm ${m.status === 'NEW' ? 'font-bold' : 'font-medium'}`}>{m.full_name} — {m.subject}</div>
                    <div className="truncate text-xs text-slate-500">{m.message}</div>
                  </div>
                  <Badge tone={STATUS[m.status].tone}>{t(STATUS[m.status].label)}</Badge>
                  <time className="hidden w-40 text-right text-xs text-slate-500 sm:block">{fmtDate(m.created_at)}</time>
                </button>
              </li>
            ))}
          </ul>
        )}
        {data && <div className="px-4 pb-4"><Pager page={page} count={data.count} pageSize={15} onPage={setPage} /></div>}
      </Card>

      <Modal open={!!open} title={open?.subject ?? ''} wide onClose={() => setOpen(null)}>
        {open && (
          <div className="space-y-4 text-sm">
            <dl className="grid gap-3 sm:grid-cols-2">
              <div><dt className="text-xs font-bold uppercase text-slate-500">{t('From')}</dt><dd>{open.full_name}</dd></div>
              <div><dt className="text-xs font-bold uppercase text-slate-500">{t('Received')}</dt><dd>{fmtDate(open.created_at)}</dd></div>
              {open.email && <div><dt className="text-xs font-bold uppercase text-slate-500">{t('Email')}</dt><dd><a className="text-brand" href={`mailto:${open.email}`}>{open.email}</a></dd></div>}
              {open.phone && <div><dt className="text-xs font-bold uppercase text-slate-500">{t('Phone')}</dt><dd>{open.phone}</dd></div>}
              {open.telegram_username && <div><dt className="text-xs font-bold uppercase text-slate-500">{t('Telegram')}</dt><dd>{open.telegram_username}</dd></div>}
              <div><dt className="text-xs font-bold uppercase text-slate-500">{t('Status')}</dt><dd><Badge tone={STATUS[open.status].tone}>{t(STATUS[open.status].label)}</Badge></dd></div>
            </dl>
            <p className="whitespace-pre-wrap rounded-xl bg-slate-50 p-4">{open.message}</p>
            <div className="flex flex-wrap justify-between gap-2 border-t border-slate-100 pt-4">
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" disabled={open.status === 'IN_PROGRESS'} onClick={() => setMsgStatus(open, 'IN_PROGRESS')}>{t('Mark in progress')}</Button>
                <Button variant="secondary" disabled={open.status === 'COMPLETED'} onClick={() => setMsgStatus(open, 'COMPLETED')}>{t('Mark completed')}</Button>
                <Button variant="secondary" disabled={open.status === 'SPAM'} onClick={() => setMsgStatus(open, 'SPAM')}>{t('Mark spam')}</Button>
              </div>
              <Button variant="danger" onClick={() => setDel(open)}><Trash2 size={15} aria-hidden /> {t('Delete')}</Button>
            </div>
          </div>
        )}
      </Modal>
      <ConfirmDialog open={!!del} title={t('Delete message?')} text="This cannot be undone." busy={busy} onConfirm={remove} onCancel={() => setDel(null)} />
      <Toast message={toast?.message ?? null} tone={toast?.tone} />
    </div>
  )
}
