import { Plus, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { api, unwrap } from '../services/api'
import type { GalleryImage, Project } from '../types'
import { parseApiError } from '../utils/format'
import Gallery from './Gallery'
import { Button, ErrorBox } from './ui'

/** Re-fetches the project so the gallery reflects uploads/deletes immediately. */
export function ProjectGallery({ project, onChange }: { project: { id: number }; onChange: () => void }) {
  const [p, setP] = useState<Project | null>(null)
  const load = useCallback(() => { api.get<Project>(`/projects/${project.id}/`).then((r) => setP(r.data)) }, [project.id])
  useEffect(load, [load])
  if (!p) return null
  return <Gallery resource="projects" id={p.id} images={p.gallery as GalleryImage[]} coverName={p.cover_image} canCover onChange={() => { load(); onChange() }} />
}

interface CStat { id: number; title: string; value: string; prefix: string; suffix: string; is_active: boolean }

/** Campaign-specific statistics (CampaignStatistic rows) managed inline. */
export function CampaignStats({ campaignId }: { campaignId: number }) {
  const [rows, setRows] = useState<CStat[]>([])
  const [error, setError] = useState<string | null>(null)
  const [draft, setDraft] = useState({ title: '', value: '', prefix: '', suffix: '' })

  const load = useCallback(() => {
    api.get(`/campaign-statistics/`, { params: { campaign: campaignId } }).then((r) => setRows(unwrap<CStat>(r.data)))
  }, [campaignId])
  useEffect(load, [load])

  const run = async (fn: () => Promise<unknown>) => { setError(null); try { await fn(); load() } catch (e) { setError(parseApiError(e).message) } }
  const patch = (id: number, data: Partial<CStat>) => run(() => api.patch(`/campaign-statistics/${id}/`, data))

  return (
    <section className="rounded-xl border border-slate-200 p-4" aria-label="Campaign statistics">
      <h3 className="mb-3 text-sm font-bold">Campaign statistics</h3>
      {error && <div className="mb-3"><ErrorBox message={error} /></div>}
      <ul className="space-y-2">
        {rows.map((r) => (
          <li key={r.id} className="grid grid-cols-[1fr_90px_60px_60px_auto_auto] items-center gap-2 text-sm">
            <input className="input" aria-label="Label" defaultValue={r.title} onBlur={(e) => e.target.value !== r.title && patch(r.id, { title: e.target.value })} />
            <input className="input" aria-label="Value" defaultValue={Number(r.value)} onBlur={(e) => e.target.value !== String(Number(r.value)) && patch(r.id, { value: e.target.value })} />
            <input className="input" aria-label="Prefix" defaultValue={r.prefix} onBlur={(e) => e.target.value !== r.prefix && patch(r.id, { prefix: e.target.value })} />
            <input className="input" aria-label="Suffix" defaultValue={r.suffix} onBlur={(e) => e.target.value !== r.suffix && patch(r.id, { suffix: e.target.value })} />
            <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={r.is_active} onChange={(e) => patch(r.id, { is_active: e.target.checked })} /> Active</label>
            <button type="button" aria-label="Delete statistic" onClick={() => run(() => api.delete(`/campaign-statistics/${r.id}/`))} className="rounded p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600"><Trash2 size={15} /></button>
          </li>
        ))}
        {!rows.length && <li className="text-sm text-slate-500">No statistics for this campaign yet.</li>}
      </ul>
      <div className="mt-3 grid grid-cols-[1fr_90px_60px_60px_auto] items-end gap-2">
        <input className="input" aria-label="New label" placeholder="Label" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
        <input className="input" aria-label="New value" placeholder="Value" value={draft.value} onChange={(e) => setDraft({ ...draft, value: e.target.value })} />
        <input className="input" aria-label="New prefix" placeholder="$" value={draft.prefix} onChange={(e) => setDraft({ ...draft, prefix: e.target.value })} />
        <input className="input" aria-label="New suffix" placeholder="+" value={draft.suffix} onChange={(e) => setDraft({ ...draft, suffix: e.target.value })} />
        <Button type="button" variant="secondary" disabled={!draft.title || !/^-?\d+(\.\d+)?$/.test(draft.value)}
          onClick={() => run(async () => { await api.post('/campaign-statistics/', { campaign: campaignId, ...draft }); setDraft({ title: '', value: '', prefix: '', suffix: '' }) })}>
          <Plus size={15} aria-hidden /> Add
        </Button>
      </div>
    </section>
  )
}

export function CampaignGallery({ campaignId, onChange }: { campaignId: number; onChange: () => void }) {
  const [images, setImages] = useState<GalleryImage[]>([])
  const load = useCallback(() => { api.get(`/campaigns/${campaignId}/`).then((r) => setImages(r.data.gallery)) }, [campaignId])
  useEffect(load, [load])
  return <Gallery resource="campaigns" id={campaignId} images={images} onChange={() => { load(); onChange() }} />
}
