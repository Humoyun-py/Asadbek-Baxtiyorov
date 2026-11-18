import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ExternalLink, X } from 'lucide-react'
import type { Project } from '../types'

export default function ProjectModal({ project, onClose }: { project: Project | null; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!project) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', esc)
    closeRef.current?.focus()
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', esc) }
  }, [project, onClose])

  return (
    <AnimatePresence>
      {project && (
        <motion.div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-bg/80 backdrop-blur-md" onClick={onClose} aria-hidden />
          <motion.div role="dialog" aria-modal="true" aria-label={project.name}
            initial={{ y: 40, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 30, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-t-3xl border border-line bg-bg2 shadow-2xl sm:rounded-3xl">
            <button ref={closeRef} onClick={onClose} aria-label="Yopish"
              className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-bg/70 backdrop-blur hover:bg-white/10">
              <X size={20} />
            </button>
            <div className="bg-bg p-4 pt-16 sm:p-6 sm:pt-6">
              <img src={project.image} alt={`${project.name} — skrinshot`} className="mx-auto max-h-[320px] w-full rounded-2xl border border-line object-contain" />
            </div>
            <div className="p-6 sm:p-10">
              <span className="rounded-full border border-cyan/30 bg-cyan/10 px-3 py-1 text-xs font-semibold text-cyan">{project.badge}</span>
              <h3 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">{project.name}</h3>
              <dl className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-bold uppercase tracking-widest text-muted">Rolim</dt>
                  <dd className="mt-1.5 font-medium">{project.role}</dd>
                </div>
                {project.author && (
                  <div><dt className="text-xs font-bold uppercase tracking-widest text-muted">Muallif</dt><dd className="mt-1.5 font-medium">{project.author}</dd></div>
                )}
                {project.direction && (
                  <div><dt className="text-xs font-bold uppercase tracking-widest text-muted">Yo'nalish</dt><dd className="mt-1.5 font-medium">{project.direction}</dd></div>
                )}
                {project.handle && (
                  <div><dt className="text-xs font-bold uppercase tracking-widest text-muted">Telegram bot</dt><dd className="mt-1.5 font-medium">{project.handle}</dd></div>
                )}
              </dl>

              {project.stats && (
                <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {project.stats.map((s) => (
                    <div key={s.label} className="rounded-2xl border border-line bg-card/70 p-4">
                      <p className="text-2xl font-extrabold"><span className="grad-text">{s.value}</span></p>
                      <p className="mt-1 text-xs text-muted">{s.label}</p>
                    </div>
                  ))}
                </div>
              )}

              <ul className="mt-7 space-y-3">
                {project.highlights.map((h) => (
                  <li key={h} className="flex gap-3 text-base leading-relaxed text-white/90">
                    <Check size={18} className="mt-0.5 shrink-0 text-cyan" aria-hidden /> {h}
                  </li>
                ))}
              </ul>

              {project.lists?.map((l) => (
                <div key={l.title} className="mt-7">
                  <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">{l.title}</h4>
                  <div className="flex flex-wrap gap-2">
                    {l.items.map((i) => <span key={i} className="rounded-full border border-line bg-white/5 px-3.5 py-1.5 text-sm">{i}</span>)}
                  </div>
                </div>
              ))}

              <a href="#contact" onClick={onClose}
                className="mt-9 inline-flex min-h-12 items-center gap-2 rounded-xl bg-brand px-6 font-semibold transition-colors hover:bg-[#4a6dff]">
                Shunday loyiha kerakmi? Bog'lanish <ExternalLink size={16} aria-hidden />
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
