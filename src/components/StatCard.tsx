import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import Reveal from './Reveal'

interface Props { icon: LucideIcon; value: ReactNode; label: string; note?: string; delay?: number; large?: boolean }

export default function StatCard({ icon: Icon, value, label, note, delay = 0, large }: Props) {
  return (
    <Reveal delay={delay} className="h-full">
      <div className="group relative h-full overflow-hidden rounded-3xl border border-line bg-card/80 p-6 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.8)] transition-colors hover:border-cyan/40 sm:p-7">
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand/20 blur-3xl transition-opacity group-hover:opacity-100" aria-hidden />
        <div className="mb-5 flex items-center justify-between">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/15 text-cyan"><Icon size={22} aria-hidden /></span>
          {note && <span className="text-xs font-medium text-muted">{note}</span>}
        </div>
        <p className={`font-extrabold tracking-tight tabular-nums ${large ? 'text-4xl sm:text-5xl' : 'text-3xl sm:text-4xl'}`}>
          <span className="grad-text">{value}</span>
        </p>
        <p className="mt-2 text-sm text-muted sm:text-base">{label}</p>
      </div>
    </Reveal>
  )
}
