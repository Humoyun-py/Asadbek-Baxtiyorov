import { Send } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { sendContact } from '../api/portfolio'

const field = 'w-full rounded-xl border border-line bg-white/5 px-4 py-3 text-base text-white placeholder:text-muted/70 focus:border-cyan focus:outline-none'

export default function ContactForm() {
  const [state, setState] = useState<{ ok: boolean; message: string } | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const fd = Object.fromEntries(new FormData(form).entries()) as Record<string, string>
    setBusy(true); setState(null)
    const res = await sendContact(fd)
    setBusy(false); setState(res)
    if (res.ok) form.reset()
  }

  return (
    <form onSubmit={submit} className="mt-8 grid gap-4 border-t border-line pt-8 sm:grid-cols-2" aria-label="Aloqa formasi">
      <div><label htmlFor="cf-name" className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-muted">Ism *</label>
        <input id="cf-name" name="full_name" required minLength={2} maxLength={150} className={field} autoComplete="name" /></div>
      <div><label htmlFor="cf-tg" className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-muted">Telegram</label>
        <input id="cf-tg" name="telegram_username" placeholder="@username" className={field} /></div>
      <div><label htmlFor="cf-phone" className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-muted">Telefon</label>
        <input id="cf-phone" name="phone" type="tel" className={field} autoComplete="tel" /></div>
      <div><label htmlFor="cf-email" className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-muted">Email</label>
        <input id="cf-email" name="email" type="email" className={field} autoComplete="email" /></div>
      <div className="sm:col-span-2"><label htmlFor="cf-subject" className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-muted">Mavzu *</label>
        <input id="cf-subject" name="subject" required maxLength={200} className={field} /></div>
      <div className="sm:col-span-2"><label htmlFor="cf-msg" className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-muted">Xabar *</label>
        <textarea id="cf-msg" name="message" required minLength={5} maxLength={5000} rows={4} className={field} /></div>
      {/* honeypot: hidden from people, bots fill it in */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute left-[-9999px] h-0 w-0 opacity-0" />
      <p className="text-xs text-muted sm:col-span-2">Telegram, telefon yoki email dan kamida bittasini kiriting.</p>
      <div className="sm:col-span-2">
        <button type="submit" disabled={busy} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-6 font-bold transition hover:bg-brand/90 disabled:opacity-60">
          <Send size={18} aria-hidden /> {busy ? 'Yuborilmoqda…' : 'Xabar yuborish'}
        </button>
        {state && <p role="status" className={`mt-3 text-sm font-medium ${state.ok ? 'text-cyan' : 'text-red-300'}`}>{state.message}</p>}
      </div>
    </form>
  )
}
