export const fmtDate = (s?: string | null) =>
  s ? new Date(s).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—'
export const fmtNum = (n: number | string) => Number(n).toLocaleString('en-US')

/** Turn a DRF error payload into readable text + per-field messages. */
export function parseApiError(err: unknown): { message: string; fields: Record<string, string> } {
  const e = err as { response?: { status?: number; data?: unknown }; message?: string }
  const data = e?.response?.data as Record<string, unknown> | string[] | undefined
  const fields: Record<string, string> = {}
  let message = e?.message || 'Something went wrong.'
  if (e?.response?.status === 429) return { message: 'Too many requests. Please wait a moment and try again.', fields }
  if (e?.response?.status === 403) return { message: 'You do not have permission to do this.', fields }
  if (e?.response?.status && e.response.status >= 500) return { message: 'Server error. Please try again later.', fields }
  if (Array.isArray(data)) message = data.join(' ')
  else if (data && typeof data === 'object') {
    const parts: string[] = []
    for (const [k, v] of Object.entries(data)) {
      const text = Array.isArray(v) ? v.join(' ') : typeof v === 'string' ? v : JSON.stringify(v)
      if (k === 'detail' || k === 'non_field_errors') parts.push(text)
      else { fields[k] = text; parts.push(`${k}: ${text}`) }
    }
    if (parts.length) message = parts.join(' • ')
  }
  return { message, fields }
}
