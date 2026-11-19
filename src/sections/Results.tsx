import { Info } from 'lucide-react'
import Arcs from '../components/Arcs'
import SectionHeading from '../components/SectionHeading'
import StatCard from '../components/StatCard'
import AnimatedCounter from '../components/AnimatedCounter'
import Reveal from '../components/Reveal'
import { usePortfolio } from '../api/portfolio'
import metaShot from '../assets/meta-ads-manager.png'

export default function Results() {
  const { kpis, mainStats } = usePortfolio()
  return (
    <section id="results" aria-labelledby="results-title" className="relative overflow-hidden bg-bg2/40 py-20 sm:py-28">
      <Arcs className="-top-10 right-0 h-[60%] w-[70%] opacity-70" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-brand/15 blur-[140px]" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading id="results-title" eyebrow="Natijalar" title={<>Raqamlar <span className="pill">natijani ko'rsatadi.</span></>} subtitle="Meta Ads Manager — 12 ta kampaniya." />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {mainStats.map((s, i) => (
            <StatCard key={s.label} icon={s.icon} large delay={i * 0.08} label={s.label} note={s.note}
              value={<AnimatedCounter value={s.value} prefix={s.prefix} suffix={s.suffix} decimals={s.decimals} />} />
          ))}
        </div>

        <ul className="mt-5 grid gap-5 md:grid-cols-3">
          {kpis.map((k, i) => (
            <Reveal as="li" key={k.label} delay={i * 0.08}>
              <div className="flex items-center gap-5 rounded-3xl border border-line bg-gradient-to-br from-card to-bg2 p-6">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan/10 text-cyan"><k.icon size={22} aria-hidden /></span>
                <div>
                  <p className="text-3xl font-extrabold tabular-nums"><span className="grad-text">{k.value}</span></p>
                  <p className="mt-1 text-sm text-muted">{k.label}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </ul>

        <Reveal className="mt-6">
          <p className="flex gap-3 rounded-2xl border border-line bg-white/[0.03] p-5 text-sm leading-relaxed text-muted">
            <Info size={18} className="mt-0.5 shrink-0 text-cyan" aria-hidden />
            <span>
              Natijalar Meta Ads Manager jadvalidan olingan. 1 ta lid narxi umumiy reklama xarajatlarini lidlar soniga bo'lish orqali hisoblangan.
              Ushbu ko'rsatkichlar universitet reklama kampaniyalariga tegishli.
            </span>
          </p>
        </Reveal>

        <Reveal className="mt-10">
          <figure className="overflow-hidden rounded-3xl border border-line bg-card/60 p-3 shadow-[0_30px_80px_-40px_rgba(54,92,255,0.5)] sm:p-4">
            <div className="mb-3 flex items-center gap-2 px-2" aria-hidden>
              <span className="h-2.5 w-2.5 rounded-full bg-white/20" /><span className="h-2.5 w-2.5 rounded-full bg-white/20" /><span className="h-2.5 w-2.5 rounded-full bg-white/20" />
            </div>
            <div className="overflow-x-auto rounded-2xl bg-white">
              <img src={metaShot} alt="Meta Ads Manager jadvali: 12 ta kampaniya natijalari" loading="lazy" decoding="async" className="min-w-[640px] w-full" />
            </div>
            <figcaption className="px-2 pb-1 pt-4 text-sm text-muted">Meta Ads Manager — haqiqiy jadval. Ko'rsatuv, klik va lid: 12 ta kampaniya.</figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  )
}
