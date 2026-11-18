import { Wallet, MousePointerClick, Eye, UserCheck } from 'lucide-react'
import type { StatItem, Kpi } from '../types'

// Meta Ads Manager — 12 ta universitet kampaniyasi (taqdimotdagi jadvaldan)
export const mainStats: (StatItem & { icon: typeof Wallet; note: string })[] = [
  { value: 29049, prefix: '$', label: 'Sarflangan reklama byudjeti.', icon: Wallet, note: 'Umumiy xarajat' },
  { value: 26.6, suffix: ' million', decimals: 1, label: 'Ko\'rsatuvlar.', icon: Eye, note: '26 618 412 ta' },
  { value: 183319, label: 'Kliklar.', icon: MousePointerClick, note: 'Havola bo\'yicha' },
  { value: 30852, label: 'Lidlar / arizalar.', icon: UserCheck, note: 'Qabul arizalari' },
]

export const kpis: Kpi[] = [
  { value: '$0.94', label: '1 ta lid narxi.', icon: UserCheck },
  { value: '$0.16', label: '1 ta klik narxi.', icon: MousePointerClick },
  { value: '$1.09', label: '1000 ta ko\'rsatuv narxi (CPM).', icon: Eye },
]

export const heroStats = [
  { value: '2 yil', label: 'tajriba' },
  { value: '10+', label: 'loyiha' },
  { value: '$180 000+', label: 'reklama byudjeti' },
]
