import SectionHeading from '../components/SectionHeading'
import Reveal from '../components/Reveal'
import { processSteps } from '../data/services'

export default function WorkProcess() {
  return (
    <section id="process" aria-labelledby="process-title" className="bg-bg2/40 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading id="process-title" eyebrow="Xizmat jarayoni" title={<>Ish <span className="pill">jarayoni</span></>} />
        <ol className="relative grid gap-10 lg:grid-cols-4 lg:gap-6">
          <div className="absolute left-6 top-6 h-[calc(100%-3rem)] w-px bg-gradient-to-b from-brand via-cyan/60 to-transparent lg:left-6 lg:right-6 lg:top-6 lg:h-px lg:w-auto lg:bg-gradient-to-r" aria-hidden />
          {processSteps.map((s, i) => (
            <Reveal as="li" key={s.n} delay={i * 0.1} className="relative pl-20 lg:pl-0 lg:pt-20">
              <span className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-full border border-cyan/40 bg-bg text-sm font-extrabold text-cyan shadow-[0_0_0_6px_rgba(8,15,43,1)]">{s.n}</span>
              <div className="rounded-3xl border border-line bg-card/70 p-6 transition-colors hover:border-cyan/40">
                <s.icon size={24} className="text-cyan" aria-hidden />
                <h3 className="mt-4 text-sm font-extrabold tracking-[0.16em]">{s.title}</h3>
                <p className="mt-2 leading-relaxed text-muted">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
