import { useCallback, useState } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import SectionHeading from '../components/SectionHeading'
import ProjectCard from '../components/ProjectCard'
import ProjectModal from '../components/ProjectModal'
import { track, usePortfolio } from '../api/portfolio'
import type { Filter, Project } from '../types'

export default function Projects() {
  const { projects: allProjects, filters } = usePortfolio()
  const [filter, setFilter] = useState<Filter>('Barchasi')
  const [selected, setSelected] = useState<Project | null>(null)
  const close = useCallback(() => setSelected(null), [])
  const list = filter === 'Barchasi' ? allProjects : allProjects.filter((p) => p.category === filter)

  return (
    <section id="projects" aria-labelledby="projects-title" className="bg-bg2/40 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading id="projects-title" eyebrow="Loyihalar" title={<>Tanlangan <span className="pill">loyihalar</span></>}
          subtitle="Turli sohalardagi bizneslar va brendlar bilan amalga oshirilgan ishlar." />

        <div role="group" aria-label="Loyiha kategoriyalari" className="-mx-5 mb-10 flex gap-2 overflow-x-auto px-5 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
          {filters.map((f) => (
            <button key={f} onClick={() => setFilter(f)} aria-pressed={filter === f}
              className={`relative min-h-11 shrink-0 rounded-full px-5 text-sm font-semibold transition-colors ${filter === f ? 'text-white' : 'border border-line text-muted hover:text-white'}`}>
              {filter === f && <motion.span layoutId="filter-pill" className="absolute inset-0 rounded-full bg-brand" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
              <span className="relative">{f}</span>
            </button>
          ))}
        </div>

        <LayoutGroup>
          <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {list.map((p) => <ProjectCard key={p.id} project={p} onOpen={(p) => { setSelected(p); track('PROJECT_VIEW', { project: p.id }) }} />)}
            </AnimatePresence>
          </motion.div>
        </LayoutGroup>
        <p className="sr-only" role="status">{list.length} ta loyiha ko'rsatilmoqda</p>
      </div>
      <ProjectModal project={selected} onClose={close} />
    </section>
  )
}
