import { zodResolver } from '@hookform/resolvers/zod'
import { ImagePlus, Plus, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { api, unwrap } from '../services/api'
import { Button } from './ui'

export type FieldType = 'text' | 'textarea' | 'number' | 'select' | 'checkbox' | 'image' | 'date' | 'strings'
  | 'color' | 'email' | 'url' | 'password' | 'json'

export interface FieldDef {
  name: string
  label: string
  type: FieldType
  required?: boolean
  requiredOnCreate?: boolean
  help?: string
  full?: boolean
  integer?: boolean
  options?: { value: string; label: string }[]
  optionsFrom?: { resource: string; label: string }   // loads options from an API list
  hideOnCreate?: boolean
}

type Values = Record<string, unknown>
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function fieldSchema(f: FieldDef, isEdit: boolean): z.ZodTypeAny {
  const required = f.required || (f.requiredOnCreate && !isEdit)
  switch (f.type) {
    case 'checkbox': return z.boolean()
    case 'image': return z.any()
    case 'strings': return z.array(z.string())
    default: break
  }
  let s = z.string()
  if (required) s = s.trim().min(1, `${f.label} is required`)
  return s.refine((v) => {
    if (!v) return true
    if (f.type === 'email') return EMAIL.test(v)
    if (f.type === 'url') return /^https?:\/\/\S+$/i.test(v)
    if (f.type === 'number') return /^-?\d+(\.\d+)?$/.test(v) && (!f.integer || /^-?\d+$/.test(v))
    if (f.type === 'color') return /^#[0-9a-fA-F]{6}$/.test(v)
    if (f.type === 'json') { try { return Array.isArray(JSON.parse(v)) } catch { return false } }
    return true
  }, { message: {
    email: 'Enter a valid email', url: 'Enter a full URL starting with http(s)://', number: f.integer ? 'Enter a whole number' : 'Enter a number',
    color: 'Use a hex colour like #2f5bff', json: 'Must be a valid JSON list',
  }[f.type as string] ?? 'Invalid value' })
}

export function buildSchema(fields: FieldDef[], isEdit: boolean) {
  return z.object(Object.fromEntries(fields.map((f) => [f.name, fieldSchema(f, isEdit)])))
}

export function initialValues(fields: FieldDef[], item: Record<string, unknown> | null): Values {
  const out: Values = {}
  for (const f of fields) {
    const v = item?.[f.name]
    if (f.type === 'checkbox') out[f.name] = item ? !!v : f.name === 'is_active' || f.name === 'is_published'
    else if (f.type === 'strings') out[f.name] = Array.isArray(v) ? v : []
    else if (f.type === 'image') out[f.name] = (v as string | null) ?? null
    else if (f.type === 'json') out[f.name] = item && v != null ? JSON.stringify(v, null, 2) : '[]'
    else if (f.type === 'password') out[f.name] = ''
    else out[f.name] = v == null ? '' : String(v)
  }
  return out
}

/** Convert form values to a request body. Uses multipart when an image changed (or always if `multipart`). */
export function buildBody(fields: FieldDef[], values: Values, opts: { multipart: boolean }) {
  const hasNewFile = fields.some((f) => f.type === 'image' && values[f.name] instanceof File)
  const useForm = opts.multipart && (hasNewFile || fields.some((f) => f.type === 'image' && values[f.name] === ''))
  const json: Record<string, unknown> = {}
  const fd = new FormData()
  for (const f of fields) {
    const v = values[f.name]
    if (f.type === 'image') {
      if (v instanceof File) fd.append(f.name, v)
      else if (v === '') fd.append(f.name, '')          // cleared
      continue
    }
    if (f.type === 'password' && !v) continue
    let out: unknown = v
    if (f.type === 'number') out = v === '' ? null : v
    else if (f.type === 'json') out = JSON.parse(String(v || '[]'))
    else if (f.type === 'date' && v === '') out = null
    json[f.name] = out
    if (useForm) {
      if (f.type === 'checkbox') fd.append(f.name, out ? 'true' : 'false')
      else if (f.type === 'strings' || f.type === 'json') fd.append(f.name, JSON.stringify(out))
      else fd.append(f.name, out == null ? '' : String(out))
    }
  }
  return useForm ? fd : json
}

export function ImageInput({ value, onChange, label }: { value: unknown; onChange: (v: File | string | null) => void; label: string }) {
  const preview = useMemo(() => (value instanceof File ? URL.createObjectURL(value) : typeof value === 'string' && value ? value : null), [value])
  useEffect(() => () => { if (value instanceof File && preview) URL.revokeObjectURL(preview) }, [value, preview])
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-24 w-32 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200">
        {preview ? <img src={preview} alt={`${label} preview`} className="h-full w-full object-cover" /> : <ImagePlus className="text-slate-400" aria-hidden />}
      </div>
      <div className="space-y-2">
        <label className="inline-block cursor-pointer rounded-lg bg-white px-3 py-1.5 text-sm font-semibold ring-1 ring-slate-300 hover:bg-slate-50">
          {preview ? 'Replace image' : 'Choose image'}
          <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" aria-label={label}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) onChange(f); e.target.value = '' }} />
        </label>
        {preview && <button type="button" onClick={() => onChange('')} className="ml-2 text-sm font-medium text-red-600 hover:underline">Remove</button>}
        <p className="text-xs text-slate-500">JPG, PNG or WEBP, up to 5 MB.</p>
      </div>
    </div>
  )
}

function StringsInput({ value, onChange, label }: { value: string[]; onChange: (v: string[]) => void; label: string }) {
  return (
    <div className="space-y-2">
      {value.map((s, i) => (
        <div key={i} className="flex gap-2">
          <input className="input" aria-label={`${label} ${i + 1}`} value={s} onChange={(e) => onChange(value.map((x, j) => (j === i ? e.target.value : x)))} />
          <button type="button" aria-label="Remove" onClick={() => onChange(value.filter((_, j) => j !== i))} className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"><Trash2 size={16} /></button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...value, ''])} className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline"><Plus size={15} /> Add item</button>
    </div>
  )
}

function useOptions(f: FieldDef) {
  const [opts, setOpts] = useState(f.options ?? [])
  useEffect(() => {
    if (!f.optionsFrom) return
    const { resource, label } = f.optionsFrom
    api.get(`/${resource}/`, { params: { page_size: 200 } }).then((r) =>
      setOpts(unwrap<Record<string, unknown>>(r.data).map((o) => ({ value: String(o.id), label: String(o[label]) }))))
  }, [f.optionsFrom])
  return opts
}

function SelectField({ f, id, invalid, reg }: { f: FieldDef; id: string; invalid: boolean; reg: object }) {
  const opts = useOptions(f)
  return (
    <select id={id} className="input" aria-invalid={invalid} {...reg}>
      {!f.required && <option value="">—</option>}
      {f.required && <option value="" disabled>Select…</option>}
      {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

export function ResourceForm({ fields, item, submitting, serverErrors, submitLabel = 'Save', multipart = true, onSubmit, onCancel, children }: {
  fields: FieldDef[]; item: Record<string, unknown> | null; submitting?: boolean; serverErrors?: Record<string, string>
  submitLabel?: string; multipart?: boolean; onSubmit: (body: FormData | Record<string, unknown>) => void; onCancel?: () => void; children?: React.ReactNode
}) {
  const isEdit = !!item
  const visible = fields.filter((f) => !(f.hideOnCreate && !isEdit))
  const schema = useMemo(() => buildSchema(visible, isEdit), [visible, isEdit])
  const { register, control, handleSubmit, formState: { errors }, reset } = useForm<Values>({
    resolver: zodResolver(schema) as never, defaultValues: initialValues(visible, item),
  })
  useEffect(() => { reset(initialValues(visible, item)) }, [item]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <form onSubmit={handleSubmit((v) => onSubmit(buildBody(visible, v, { multipart })))} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {visible.map((f) => {
          const id = `f-${f.name}`
          const err = (errors[f.name]?.message as string | undefined) || serverErrors?.[f.name]
          const wide = f.full || ['textarea', 'strings', 'image', 'json'].includes(f.type)
          return (
            <div key={f.name} className={wide ? 'sm:col-span-2' : ''}>
              {f.type === 'checkbox' ? (
                <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" className="h-4 w-4 rounded" {...register(f.name)} /> {f.label}</label>
              ) : (
                <label htmlFor={id} className="mb-1 block text-sm font-semibold text-slate-700">
                  {f.label}{(f.required || (f.requiredOnCreate && !isEdit)) && <span className="text-red-600"> *</span>}
                </label>
              )}
              {f.type === 'textarea' && <textarea id={id} rows={4} className="input" aria-invalid={!!err} {...register(f.name)} />}
              {f.type === 'json' && <textarea id={id} rows={5} className="input font-mono text-xs" aria-invalid={!!err} {...register(f.name)} />}
              {f.type === 'select' && <SelectField f={f} id={id} invalid={!!err} reg={register(f.name)} />}
              {f.type === 'image' && <Controller control={control} name={f.name} render={({ field }) => <ImageInput label={f.label} value={field.value} onChange={field.onChange} />} />}
              {f.type === 'strings' && <Controller control={control} name={f.name} render={({ field }) => <StringsInput label={f.label} value={(field.value as string[]) ?? []} onChange={field.onChange} />} />}
              {f.type === 'color' && (
                <div className="flex gap-2">
                  <Controller control={control} name={f.name} render={({ field }) => <input type="color" aria-label={`${f.label} picker`} className="h-10 w-12 rounded border border-slate-300" value={/^#[0-9a-f]{6}$/i.test(String(field.value)) ? String(field.value) : '#000000'} onChange={field.onChange} />} />
                  <input id={id} className="input" aria-invalid={!!err} {...register(f.name)} />
                </div>
              )}
              {['text', 'email', 'url', 'date', 'password'].includes(f.type) && (
                <input id={id} type={f.type === 'text' ? 'text' : f.type} autoComplete={f.type === 'password' ? 'new-password' : undefined}
                  className="input" aria-invalid={!!err} {...register(f.name)} />
              )}
              {f.type === 'number' && <input id={id} inputMode="decimal" className="input" aria-invalid={!!err} {...register(f.name)} />}
              {f.help && <p className="mt-1 text-xs text-slate-500">{f.help}</p>}
              {err && <p role="alert" className="mt-1 text-xs font-medium text-red-600">{err}</p>}
            </div>
          )
        })}
      </div>
      {children}
      <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" loading={submitting}>{submitLabel}</Button>
      </div>
    </form>
  )
}
