import { ImagePlus, Star, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { t } from '../i18n'
import { api } from '../services/api'
import type { GalleryImage } from '../types'
import { parseApiError } from '../utils/format'
import { ErrorBox } from './ui'

/** Multi-upload gallery for projects/campaigns. `resource` = 'projects' | 'campaigns'. */
export default function Gallery({ resource, id, images, coverName, canCover, onChange }: {
  resource: string; id: number; images: GalleryImage[]; coverName?: string | null; canCover?: boolean; onChange: () => void
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true); setError(null)
    try { await fn(); onChange() } catch (e) { setError(parseApiError(e).message) } finally { setBusy(false) }
  }
  const upload = (files: FileList | null) => {
    if (!files?.length) return
    const fd = new FormData()
    Array.from(files).forEach((f) => fd.append('images', f))
    run(() => api.post(`/${resource}/${id}/images/`, fd))
  }

  return (
    <section className="rounded-xl border border-slate-200 p-4" aria-label={t('Gallery')}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold">{t('Gallery ({n})', { n: images.length })}</h3>
        <label className={`inline-flex cursor-pointer items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-sm font-semibold ring-1 ring-slate-300 hover:bg-slate-50 ${busy ? 'opacity-50' : ''}`}>
          <ImagePlus size={16} aria-hidden /> {t('Upload images')}
          <input type="file" multiple accept="image/png,image/jpeg,image/webp" className="sr-only" aria-label={t('Upload gallery images')} disabled={busy}
            onChange={(e) => { upload(e.target.files); e.target.value = '' }} />
        </label>
      </div>
      {error && <div className="mb-3"><ErrorBox message={error} /></div>}
      {!images.length ? <p className="text-sm text-slate-500">{t('No gallery images yet.')}</p> : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((img) => {
            const isCover = !!coverName && img.image.endsWith(coverName.split('/').pop() ?? '#')
            return (
              <li key={img.id} className="group relative overflow-hidden rounded-lg ring-1 ring-slate-200">
                <img src={img.image} alt={img.caption || t('Gallery image')} className="aspect-[4/3] w-full object-cover" />
                {isCover && <span className="absolute left-1 top-1 rounded bg-brand px-1.5 py-0.5 text-[10px] font-bold text-white">{t('COVER')}</span>}
                <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-gradient-to-t from-black/60 p-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                  {canCover && <button type="button" aria-label={t('Set as cover')} disabled={busy} onClick={() => run(() => api.post(`/${resource}/${id}/set-cover/`, { image_id: img.id }))} className="rounded bg-white/90 p-1.5 text-slate-700 hover:bg-white"><Star size={14} /></button>}
                  <button type="button" aria-label={t('Delete image')} disabled={busy} onClick={() => run(() => api.delete(`/${resource}/${id}/images/${img.id}/`))} className="rounded bg-white/90 p-1.5 text-red-600 hover:bg-white"><Trash2 size={14} /></button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
