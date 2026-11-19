import { GraduationCap, MapPin } from 'lucide-react'
import SectionHeading from '../components/SectionHeading'
import Reveal from '../components/Reveal'
import { usePortfolio } from '../api/portfolio'

export default function UniversityCampaigns() {
  const { universities } = usePortfolio()
  return (
    <section id="universities" aria-labelledby="uni-title" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading id="uni-title" eyebrow="Qabul kampaniyalari" title={<>Universitetlar uchun <span className="pill-cyan">qabul kampaniyalari</span></>}
          subtitle="4 ta universitet • Lid generatsiya • Meta Ads" />
        <div className="grid gap-6 md:grid-cols-2">
          {universities.map((u, i) => (
            <Reveal key={u.id} delay={(i % 2) * 0.1} className="h-full">
              <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-card/70 transition-colors hover:border-cyan/40">
                <div className="relative aspect-[16/8] overflow-hidden bg-bg2">
                  <img src={u.image} alt={`${u.name} — sahifa skrinshoti`} loading="lazy" decoding="async" className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" aria-hidden />
                  <span className="absolute bottom-3 left-5 flex items-center gap-2 rounded-full border border-white/15 bg-bg/70 px-3 py-1.5 text-xs font-bold tracking-wider backdrop-blur-md">
                    <GraduationCap size={14} className="text-cyan" aria-hidden /> {String(i + 1).padStart(2, '0')} • {u.short}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6 sm:p-8">
                  <h3 className="text-xl font-bold tracking-tight sm:text-2xl">{u.name}</h3>
                  <p className="mt-2 text-sm font-medium text-cyan">{u.role}</p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    {u.stats.map((s) => (
                      <div key={s.label} className="rounded-2xl border border-line bg-bg/50 px-4 py-3">
                        <p className="text-lg font-extrabold">{s.value}</p>
                        <p className="text-xs text-muted">{s.label}</p>
                      </div>
                    ))}
                  </div>
                  <ul className="mt-5 space-y-2.5 text-sm text-muted">
                    {u.points.map((p) => (
                      <li key={p} className="flex gap-2.5"><MapPin size={15} className="mt-0.5 shrink-0 text-brand" aria-hidden /> {p}</li>
                    ))}
                  </ul>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
