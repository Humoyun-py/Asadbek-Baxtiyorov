import Reveal from '../components/Reveal'
import SectionHeading from '../components/SectionHeading'

export default function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading id="about-title" eyebrow="Men kimman?" title={<>Marketing — bu shunchaki reklama emas, <span className="pill">bu natija.</span></>} />
        <div className="grid gap-8 lg:grid-cols-2">
          <Reveal>
            <p className="text-lg leading-relaxed text-muted">
              Men bizneslar, shaxsiy brendlar va ta'lim loyihalarini rivojlantirish uchun target reklama, SMM va lid generatsiya yo'nalishlarida ishlayman.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-lg leading-relaxed text-muted">
              Asosiy maqsadim — reklama orqali kerakli auditoriyani topish, mijozlar oqimini shakllantirish va biznes natijalarini yaxshilash.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
