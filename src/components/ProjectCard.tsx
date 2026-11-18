import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import type { Project } from '../types'

export default function ProjectCard({ project, onOpen }: { project: Project; onOpen: (p: Project) => void }) {
  return (
    <motion.article
      layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35 }} whileHover={{ y: -6 }}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-card/80 transition-colors hover:border-cyan/40"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-bg2">
        <img src={project.image} alt={`${project.name} — sahifa skrinshoti`} loading="lazy" decoding="async"
          className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-70" aria-hidden />
        <span className="absolute bottom-3 left-4 rounded-full border border-white/15 bg-bg/70 px-3 py-1 text-xs font-semibold backdrop-blur-md">{project.badge}</span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-xl font-bold tracking-tight">{project.name}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{project.short}</p>
        <button onClick={() => onOpen(project)} aria-label={`${project.name} — batafsil ko'rish`}
          className="mt-5 inline-flex min-h-11 items-center gap-2 self-start text-sm font-semibold text-cyan transition-all group-hover:gap-3">
          Batafsil ko'rish <ArrowUpRight size={16} aria-hidden />
        </button>
      </div>
    </motion.article>
  )
}
