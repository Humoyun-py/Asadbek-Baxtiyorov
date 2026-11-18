import { Check, Globe2, Send } from 'lucide-react'
import Button from '../components/Button'
import Reveal from '../components/Reveal'
import { agencyMarkets, agencyServices, AGENCY_TELEGRAM_URL } from '../data/services'
import shot from '../assets/agency-telegram.png'

export default function Agency() {
  return (
    <section id="agency" aria-labelledby="agency-title" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] border border-line bg-gradient-to-br from-[#1a3fd0] via-card to-[#0a1f80] p-7 sm:p-12">
            <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand/30 blur-[110px]" aria-hidden />
            <div className="relative grid items-center gap-10 lg:grid-cols-[1.3fr_0.7fr]">
              <div>
                <p className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan"><span className="h-px w-8 bg-cyan" aria-hidden /> Agentlik</p>
                <h2 id="agency-title" className="text-3xl font-black tracking-tight sm:text-5xl">Global Targeting Agency</h2>
                <p className="mt-4 text-lg text-muted">MDH bozori uchun professional targeting xizmati.</p>

                <h3 className="mb-3 mt-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted"><Globe2 size={15} aria-hidden /> Bozorlar</h3>
                <ul className="flex flex-wrap gap-2">
                  {agencyMarkets.map((m) => <li key={m} className="rounded-full border border-cyan/30 bg-cyan/10 px-4 py-1.5 text-sm font-semibold">{m}</li>)}
                </ul>

                <h3 className="mb-3 mt-8 text-xs font-bold uppercase tracking-widest text-muted">Xizmatlar</h3>
                <ul className="grid gap-2.5 sm:grid-cols-2">
                  {agencyServices.map((s) => <li key={s} className="flex items-center gap-2.5 text-base"><Check size={16} className="text-cyan" aria-hidden /> {s}.</li>)}
                </ul>

                <div className="mt-9"><Button href={AGENCY_TELEGRAM_URL} external className="w-full sm:w-auto"><Send size={18} aria-hidden /> Agentlik bilan bog'lanish</Button></div>
              </div>
              <div className="mx-auto w-full max-w-[320px]">
                <img src={shot} alt="Global Targeting Kanali — Telegram" loading="lazy" decoding="async" className="w-full rounded-3xl border border-line shadow-2xl" />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
