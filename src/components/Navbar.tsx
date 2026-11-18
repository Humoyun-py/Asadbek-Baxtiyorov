import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useActiveSection, useScrolled } from '../hooks/useActiveSection'
import Button from './Button'

export const navItems = [
  { id: 'home', label: 'Bosh sahifa' },
  { id: 'about', label: 'Men haqimda' },
  { id: 'services', label: 'Xizmatlar' },
  { id: 'projects', label: 'Loyihalar' },
  { id: 'results', label: 'Natijalar' },
  { id: 'contact', label: 'Aloqa' },
]
const ids = navItems.map((n) => n.id)

export default function Navbar() {
  const scrolled = useScrolled()
  const active = useActiveSection(ids)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', esc)
    return () => { window.removeEventListener('keydown', esc); document.body.style.overflow = '' }
  }, [open])

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled || open ? 'border-b border-line bg-bg/75 backdrop-blur-xl' : 'border-b border-transparent'}`}
    >
      <nav aria-label="Asosiy navigatsiya" className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
        <a href="#home" className="text-sm font-extrabold leading-[1.05] tracking-wide sm:text-base" aria-label="Asadbek Baxtiyorov — bosh sahifa">
          ASADBEK<span className="text-cyan">.</span><br /><span className="text-muted">BAXTIYOROV</span>
        </a>

        <ul className="hidden items-center gap-1 lg:flex">
          {navItems.map((n) => (
            <li key={n.id}>
              <a href={`#${n.id}`} aria-current={active === n.id ? 'true' : undefined}
                className={`relative block rounded-lg px-3.5 py-2 text-sm font-medium transition-colors hover:text-white ${active === n.id ? 'text-white' : 'text-muted'}`}>
                {n.label}
                {active === n.id && (
                  <motion.span layoutId="nav-active" className="absolute inset-x-3.5 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-brand to-cyan" />
                )}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <span className="hidden sm:block"><Button href="#contact" className="!min-h-10 !px-5 !text-sm">Bog'lanish</Button></span>
          <button className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-white/5 lg:hidden"
            onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? 'Menyuni yopish' : 'Menyuni ochish'}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div id="mobile-menu" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden lg:hidden">
            <ul className="mx-auto flex max-w-7xl flex-col gap-1 px-5 pb-6 pt-2 sm:px-8">
              {navItems.map((n, i) => (
                <motion.li key={n.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                  <a href={`#${n.id}`} onClick={() => setOpen(false)}
                    className={`flex min-h-12 items-center justify-between rounded-xl px-4 text-lg font-semibold ${active === n.id ? 'bg-brand/15 text-white' : 'text-muted'}`}>
                    {n.label}
                    {active === n.id && <span className="h-2 w-2 rounded-full bg-cyan" />}
                  </a>
                </motion.li>
              ))}
              <li className="mt-3"><Button href="#contact" className="w-full" ariaLabel="Bog'lanish">Bog'lanish</Button></li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
