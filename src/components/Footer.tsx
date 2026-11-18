import { Send } from 'lucide-react'
import { TELEGRAM_URL, TELEGRAM_HANDLE } from '../data/services'

const links = [
  ['Bosh sahifa', '#home'], ['Men haqimda', '#about'], ['Loyihalar', '#projects'], ['Natijalar', '#results'], ['Aloqa', '#contact'],
]

export default function Footer() {
  return (
    <footer className="border-t border-line bg-bg2/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="text-lg font-extrabold tracking-wide">ASADBEK BAXTIYOROV</p>
          <p className="mt-2 text-sm text-muted">Targetolog • SMM Specialist • AI Specialist</p>
        </div>
        <nav aria-label="Footer navigatsiya">
          <ul className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm text-muted md:grid-cols-1">
            {links.map(([l, h]) => <li key={h}><a href={h} className="transition-colors hover:text-white">{l}</a></li>)}
          </ul>
        </nav>
        <div>
          <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line bg-white/5 px-4 text-sm font-semibold transition-colors hover:border-cyan/50">
            <Send size={16} className="text-cyan" aria-hidden /> {TELEGRAM_HANDLE}
          </a>
        </div>
      </div>
      <div className="border-t border-line py-6 text-center text-xs text-muted">
        © 2026 Asadbek Baxtiyorov. Barcha huquqlar himoyalangan.
      </div>
    </footer>
  )
}
