import type { ReactNode } from 'react'
import Reveal from './Reveal'

interface Props { eyebrow?: string; title: ReactNode; subtitle?: string; align?: 'left' | 'center'; id?: string }

export default function SectionHeading({ eyebrow, title, subtitle, align = 'left', id }: Props) {
  return (
    <div className={`mb-12 max-w-3xl ${align === 'center' ? 'mx-auto text-center' : ''}`}>
      {eyebrow && (
        <Reveal>
          <p className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan">
            <span className="h-px w-8 bg-cyan" aria-hidden /> {eyebrow}
          </p>
        </Reveal>
      )}
      <Reveal delay={0.05}>
        <h2 id={id} className="text-3xl font-black leading-[1.2] tracking-tight sm:text-4xl lg:text-5xl">{title}</h2>
      </Reveal>
      {subtitle && (
        <Reveal delay={0.1}>
          <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">{subtitle}</p>
        </Reveal>
      )}
    </div>
  )
}
