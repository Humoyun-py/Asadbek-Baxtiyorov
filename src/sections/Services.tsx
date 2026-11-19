import { usePortfolio } from '../api/portfolio'
import Reveal from '../components/Reveal'

export default function Services() {
  const { services } = usePortfolio()
  return (
    <section id="services" aria-label="Xizmatlar" className="pb-20 sm:pb-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s, i) => (
            <Reveal as="li" key={s.title} delay={i * 0.08}>
              <div className="group relative h-full overflow-hidden rounded-3xl border border-line bg-card/70 p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-cyan/40 hover:bg-card">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand/30 to-cyan/10 text-cyan transition-transform duration-300 group-hover:scale-110">
                  <s.icon size={26} aria-hidden />
                </span>
                <h3 className="mt-6 text-sm font-extrabold tracking-[0.16em]">{s.title}</h3>
                <p className="mt-3 leading-relaxed text-muted">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
