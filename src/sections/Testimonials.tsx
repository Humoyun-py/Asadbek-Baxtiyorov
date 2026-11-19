import { Quote } from 'lucide-react'
import { usePortfolio } from '../api/portfolio'
import Reveal from '../components/Reveal'
import SectionHeading from '../components/SectionHeading'

/** Renders nothing until the administrator publishes real testimonials. */
export default function Testimonials() {
  const { testimonials } = usePortfolio()
  if (!testimonials.length) return null
  return (
    <section id="testimonials" aria-labelledby="testimonials-title" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading id="testimonials-title" eyebrow="Fikrlar" title={<>Mijozlar <span className="pill">fikri</span></>} />
        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal as="li" key={t.id} delay={i * 0.08}>
              <figure className="h-full rounded-3xl border border-line bg-card/70 p-7">
                <Quote size={24} className="text-cyan" aria-hidden />
                <blockquote className="mt-4 leading-relaxed text-muted">{t.testimonial_text}</blockquote>
                <figcaption className="mt-5 text-sm font-bold">{t.client_name}<span className="block text-xs font-medium text-muted">{[t.client_position, t.company_name].filter(Boolean).join(' • ')}</span></figcaption>
              </figure>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
