import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Send, TrendingUp, Users, Wallet } from 'lucide-react'
import Arcs from '../components/Arcs'
import Button from '../components/Button'
import { usePortfolio } from '../api/portfolio'

// Haqiqiy portret qo'shish: src/assets/portrait.png (yoki .jpg/.webp) faylini joylashtiring.
const portraits = import.meta.glob('../assets/portrait.{png,jpg,jpeg,webp}', { eager: true, import: 'default' }) as Record<string, string>
const staticPortrait = Object.values(portraits)[0]

const ease = [0.22, 1, 0.36, 1] as const

function Float({ children, className, delay = 0 }: { children: React.ReactNode; className: string; delay?: number }) {
  const reduce = useReducedMotion()
  return (
    <motion.div className={`glass !bg-[rgba(8,15,43,0.88)] absolute rounded-2xl p-4 shadow-xl ${className}`}
      initial={reduce ? false : { opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1, y: reduce ? 0 : [0, -8, 0] }}
      transition={{ opacity: { delay: 0.7 + delay, duration: 0.5 }, scale: { delay: 0.7 + delay, duration: 0.5 }, y: { duration: 5 + delay * 2, repeat: Infinity, ease: 'easeInOut', delay } }}>
      {children}
    </motion.div>
  )
}

export default function Hero() {
  const { heroStats, portrait: apiPortrait } = usePortfolio()
  const portrait = apiPortrait || staticPortrait
  const reduce = useReducedMotion()
  const item = (i: number) => ({
    initial: reduce ? false as const : { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay: 0.15 + i * 0.1, ease },
  })

  return (
    <section id="home" aria-labelledby="hero-title" className="relative overflow-hidden pt-[72px]">
      <div className="grid-bg pointer-events-none absolute inset-0" aria-hidden />
      <Arcs className="-bottom-10 left-0 h-[70%] w-full opacity-80" />
      <div className="pointer-events-none absolute -left-40 top-20 h-[480px] w-[480px] rounded-full bg-brand/25 blur-[120px]" aria-hidden />
      <div className="pointer-events-none absolute -right-32 top-40 h-[420px] w-[420px] rounded-full bg-cyan/10 blur-[120px]" aria-hidden />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-12 sm:px-8 lg:min-h-[calc(100vh-72px)] lg:grid-cols-[1.1fr_0.9fr] lg:gap-8 lg:pt-8">
        <div>
          <motion.p {...item(0)} className="inline-flex items-center gap-2 rounded-full border border-line bg-white/5 px-3.5 py-2 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-muted sm:px-4 sm:text-xs sm:tracking-[0.18em]">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan" aria-hidden /> PERSONAL PORTFOLIO • 2026
          </motion.p>
          <motion.h1 id="hero-title" {...item(1)} className="mt-6 text-[2.1rem] font-black leading-[1.15] tracking-tight sm:text-5xl lg:text-[3.4rem]">
            Reklama orqali biznesingizga <span className="pill">yangi mijozlar</span> olib kelaman.
          </motion.h1>
          <motion.p {...item(2)} className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            Men Asadbek Baxtiyorov — targetolog, SMM mutaxassisi va AI Specialist. Bizneslar uchun samarali reklama strategiyalari, mijoz jalb qilish tizimlari va zamonaviy raqamli yechimlar yarataman.
          </motion.p>
          <motion.div {...item(3)} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="#projects">Loyihalarni ko'rish <ArrowRight size={18} aria-hidden /></Button>
            <Button href="#contact" variant="ghost">Bog'lanish</Button>
          </motion.div>
          <motion.dl {...item(4)} className="mt-10 grid max-w-xl grid-cols-3 gap-2 sm:gap-4 border-t border-line pt-7">
            {heroStats.map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd className="whitespace-nowrap text-base font-extrabold tracking-tight sm:text-2xl">{s.value}</dd>
                <dd className="mt-1 text-xs text-muted sm:text-sm">{s.label}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* Profil kompozitsiyasi */}
        <motion.div initial={reduce ? false : { opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, delay: 0.3, ease }}
          className="relative mx-auto w-full max-w-[460px] lg:max-w-none">
          <div className="relative mx-auto aspect-[4/5] w-[92%] sm:w-[82%] overflow-hidden rounded-[2rem] border border-line bg-gradient-to-br from-[#1a2a78] via-card to-bg2 shadow-[0_40px_80px_-30px_rgba(54,92,255,0.5)]">
            <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand/50 blur-3xl" aria-hidden />
            <div className="absolute -bottom-20 -left-10 h-60 w-60 rounded-full bg-cyan/25 blur-3xl" aria-hidden />
            <svg className="absolute inset-0 h-full w-full opacity-40" viewBox="0 0 400 500" fill="none" aria-hidden>
              <circle cx="200" cy="250" r="150" stroke="rgba(255,255,255,0.15)" />
              <circle cx="200" cy="250" r="100" stroke="rgba(34,211,238,0.25)" strokeDasharray="4 8" />
              <circle cx="200" cy="250" r="200" stroke="rgba(255,255,255,0.08)" />
            </svg>
            {portrait ? (
              <img src={portrait} alt="Asadbek Baxtiyorov" className="relative h-full w-full object-cover" />
            ) : (
              <div className="relative flex h-full flex-col items-center justify-center gap-5">
                <div className="flex h-36 w-36 items-center justify-center rounded-full border border-white/20 bg-bg/40 backdrop-blur sm:h-44 sm:w-44">
                  <span className="grad-text text-6xl font-extrabold tracking-tighter sm:text-7xl">AB</span>
                </div>
                <p className="text-center text-sm font-semibold tracking-wide">Asadbek Baxtiyorov<br /><span className="text-xs font-medium text-muted">Global Targeting Agency</span></p>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg/90 to-transparent p-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan">Targetolog • SMM • AI • Canva</p>
            </div>
          </div>

          <Float className="left-0 top-[6%] scale-90 sm:-left-2 sm:top-[10%] sm:scale-100" delay={0}>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/20 text-cyan"><Wallet size={20} aria-hidden /></span>
              <div><p className="text-lg font-extrabold leading-none">$180 000+</p><p className="mt-1 text-xs text-muted">reklama byudjeti</p></div>
            </div>
          </Float>
          <Float className="-right-1 top-[38%] hidden sm:-right-4 sm:block" delay={0.4}>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan/15 text-cyan"><Users size={20} aria-hidden /></span>
              <div><p className="text-lg font-extrabold leading-none">30 852</p><p className="mt-1 text-xs text-muted">lid / ariza</p></div>
            </div>
          </Float>
          <Float className="bottom-[6%] left-[4%] hidden sm:left-[-1%] sm:block" delay={0.8}>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/20 text-cyan"><TrendingUp size={20} aria-hidden /></span>
              <div><p className="text-lg font-extrabold leading-none">≈ $0,94</p><p className="mt-1 text-xs text-muted">1 ta lid narxi</p></div>
            </div>
          </Float>
          <Float className="-right-1 bottom-[2%] hidden sm:block" delay={1.2}>
            <div className="flex items-center gap-2 text-sm font-semibold"><Send size={16} className="text-cyan" aria-hidden /> Meta Ads</div>
          </Float>
        </motion.div>
      </div>
    </section>
  )
}
