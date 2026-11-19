import { AlertCircle, Loader2, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, type ButtonHTMLAttributes, type ReactNode } from 'react'

export function Spinner({ label = 'Loading…' }: { label?: string }) {
  return <div role="status" className="flex items-center justify-center gap-2 py-16 text-slate-500"><Loader2 className="animate-spin" size={18} aria-hidden /> {label}</div>
}

export function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
      <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden />
      <div className="flex-1">{message}</div>
      {onRetry && <button onClick={onRetry} className="font-semibold underline">Retry</button>}
    </div>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 ${className}`}>{children}</div>
}

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
const variants: Record<Variant, string> = {
  primary: 'bg-brand text-white hover:bg-blue-700',
  secondary: 'bg-white text-slate-800 ring-1 ring-slate-300 hover:bg-slate-50',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'text-slate-600 hover:bg-slate-100',
}
export function Button({ variant = 'primary', loading, className = '', children, ...rest }:
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; loading?: boolean }) {
  return (
    <button {...rest} disabled={rest.disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition disabled:opacity-50 ${variants[variant]} ${className}`}>
      {loading && <Loader2 size={15} className="animate-spin" aria-hidden />}{children}
    </button>
  )
}

export function Badge({ children, tone = 'slate' }: { children: ReactNode; tone?: 'slate' | 'green' | 'blue' | 'amber' | 'red' }) {
  const t = { slate: 'bg-slate-100 text-slate-700', green: 'bg-emerald-100 text-emerald-800', blue: 'bg-blue-100 text-blue-800',
    amber: 'bg-amber-100 text-amber-800', red: 'bg-red-100 text-red-800' }[tone]
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${t}`}>{children}</span>
}

export function Modal({ open, title, onClose, children, wide }: { open: boolean; title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [open, onClose])
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-navy/60 p-4 sm:p-8"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
          <motion.div role="dialog" aria-modal="true" aria-label={title} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }}
            className={`w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} rounded-2xl bg-white shadow-2xl`}>
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h2 className="text-lg font-bold">{title}</h2>
              <button onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"><X size={18} /></button>
            </div>
            <div className="p-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function ConfirmDialog({ open, title, text, confirmLabel = 'Delete', busy, onConfirm, onCancel }:
  { open: boolean; title: string; text: string; confirmLabel?: string; busy?: boolean; onConfirm: () => void; onCancel: () => void }) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <p className="text-sm text-slate-600">{text}</p>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button variant="danger" loading={busy} onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </Modal>
  )
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div><h1 className="text-2xl font-bold tracking-tight">{title}</h1>{subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}</div>
      <div className="flex flex-wrap gap-2">{actions}</div>
    </div>
  )
}

export function Pager({ page, count, pageSize, onPage }: { page: number; count: number; pageSize: number; onPage: (p: number) => void }) {
  const pages = Math.max(1, Math.ceil(count / pageSize))
  if (pages <= 1) return null
  return (
    <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
      <span>{count} total</span>
      <div className="flex items-center gap-2">
        <Button variant="secondary" disabled={page <= 1} onClick={() => onPage(page - 1)}>Previous</Button>
        <span>Page {page} / {pages}</span>
        <Button variant="secondary" disabled={page >= pages} onClick={() => onPage(page + 1)}>Next</Button>
      </div>
    </div>
  )
}

export function Toast({ message, tone = 'success' }: { message: string | null; tone?: 'success' | 'error' }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div role="status" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}
          className={`fixed bottom-5 right-5 z-[60] rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg ${tone === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
