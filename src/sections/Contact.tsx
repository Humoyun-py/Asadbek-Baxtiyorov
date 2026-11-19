import { Building2, Send, User } from 'lucide-react'
import Arcs from '../components/Arcs'
import Button from '../components/Button'
import Reveal from '../components/Reveal'
import ContactForm from '../components/ContactForm'
import { API_URL } from '../api/portfolio'
import { TELEGRAM_URL, TELEGRAM_HANDLE } from '../data/services'

export default function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="relative overflow-hidden py-20 sm:py-28">
      <Arcs className="-bottom-10 left-0 h-[80%] w-full opacity-70" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/20 blur-[140px]" aria-hidden />
      <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
        <Reveal>
          <h2 id="contact-title" className="text-4xl font-black leading-[1.2] tracking-tight sm:text-6xl">
            Keyingi loyiha — <span className="pill">sizniki bo'lishi mumkin.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}><p className="mt-5 text-lg text-muted">Reklama sizga to'g'ri mijozni olib keladi.</p></Reveal>
        <Reveal delay={0.2}>
          <div className="glass mx-auto mt-10 max-w-2xl rounded-3xl p-6 text-left sm:p-8">
            <dl className="grid gap-6 sm:grid-cols-2">
              <div className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/15 text-cyan"><User size={20} aria-hidden /></span>
                <div><dt className="text-xs font-bold uppercase tracking-widest text-muted">Ism</dt><dd className="mt-1 font-semibold">Asadbek Baxtiyorov</dd></div>
              </div>
              <div className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/15 text-cyan"><Building2 size={20} aria-hidden /></span>
                <div><dt className="text-xs font-bold uppercase tracking-widest text-muted">Agentlik</dt><dd className="mt-1 font-semibold">Global Targeting Agency</dd></div>
              </div>
              <div className="flex gap-4 sm:col-span-2">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/15 text-cyan"><Send size={20} aria-hidden /></span>
                <div className="min-w-0"><dt className="text-xs font-bold uppercase tracking-widest text-muted">Telegram</dt>
                  <dd className="mt-1 break-all font-semibold"><a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className="hover:text-cyan">{TELEGRAM_HANDLE}</a></dd></div>
              </div>
            </dl>
            <Button href={TELEGRAM_URL} external className="mt-8 w-full"><Send size={18} aria-hidden /> Telegram orqali bog'lanish</Button>
            {API_URL && <ContactForm />}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
