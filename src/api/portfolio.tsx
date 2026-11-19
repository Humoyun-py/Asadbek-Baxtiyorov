import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { Bot, Lightbulb, LineChart, Megaphone, Rocket, Search, Target, Users, type LucideIcon } from 'lucide-react'
import { allProjects, filters as staticFilters, universities as staticUniversities } from '../data/projects'
import { services as staticServices } from '../data/services'
import { heroStats as staticHeroStats, kpis as staticKpis, mainStats as staticMainStats } from '../data/statistics'
import type { Project, Service, University, Kpi, StatItem } from '../types'

/**
 * Content comes from the Django API when VITE_API_URL is set. If it is unset or the request fails,
 * the bundled static data in src/data is used, so the public site never breaks.
 */
export const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || ''

type MainStat = StatItem & { icon: LucideIcon; note: string }
export interface PortfolioData {
  projects: Project[]
  filters: string[]
  universities: University[]
  services: Service[]
  mainStats: MainStat[]
  kpis: Kpi[]
  heroStats: { value: string; label: string }[]
  portrait?: string
  testimonials: { id: number; client_name: string; client_position: string; company_name: string; testimonial_text: string; rating: number }[]
  fromApi: boolean
}

const staticData: PortfolioData = {
  projects: allProjects, filters: staticFilters, universities: staticUniversities, services: staticServices,
  mainStats: staticMainStats, kpis: staticKpis, heroStats: staticHeroStats, testimonials: [], fromApi: false,
}

const ICONS: Record<string, LucideIcon> = { Target, Megaphone, Users, Bot, Search, Lightbulb, Rocket, LineChart }

/* eslint-disable @typescript-eslint/no-explicit-any */
const ming = (n: number) => {
  if (n < 1000) return String(n)
  const v = (n / 1000).toFixed(1).replace('.', ',').replace(/,0$/, '')
  return `${v} ming`
}
const num = (s: { value: string; prefix?: string; suffix?: string }) =>
  `${s.prefix ?? ''}${Number(s.value).toLocaleString('en-US', { maximumFractionDigits: 2 })}${s.suffix ?? ''}`

function mapCampaign(c: any): University {
  const stats: University['stats'] = []
  if (c.followers_count) stats.push({ value: ming(c.followers_count), label: 'obunachi' })
  for (const s of c.statistics ?? []) stats.push({ value: num(s), label: s.title })
  return { id: String(c.id), short: c.title, name: c.university_name, role: c.role, image: c.campaign_image || '', stats, points: c.points ?? [] }
}

function mapProject(p: any, campaigns: University[]): Project {
  const stats: Project['stats'] = []
  if (p.followers_count) stats.push({ value: ming(p.followers_count), label: 'obunachi' })
  if (p.slug.startsWith('uni-')) {
    const c = campaigns.find((u) => u.name === p.title)
    if (c) for (const s of c.stats) if (s.label !== 'obunachi') stats.push(s)
  }
  return {
    id: p.slug, name: p.title, category: p.category_detail?.name ?? '', badge: p.badge, short: p.short_description, role: p.role,
    author: p.client_name || undefined, direction: p.direction || undefined, handle: p.handle || undefined,
    image: p.project_image || p.cover_image || '', highlights: p.highlights ?? [],
    lists: p.extra_lists?.length ? p.extra_lists : undefined, stats: stats.length ? stats : undefined,
  }
}

function mapAll(d: any): PortfolioData {
  const universities: University[] = d.campaigns.map(mapCampaign)
  const projects: Project[] = d.projects.map((p: any) => mapProject(p, universities))
  const used = new Set(projects.map((p) => p.category))
  const filters = ['Barchasi', ...d.categories.map((c: any) => c.name).filter((n: string) => used.has(n))]
  const services: Service[] = d.services.map((s: any) => ({ title: String(s.title).toUpperCase(), text: s.description, icon: ICONS[s.icon] ?? Target }))

  const stat = (key: string) => d.statistics.find((s: any) => s.key === key)
  const mainStats = staticData.mainStats.map((base, i): MainStat => {
    const s = stat(['uni-ad-spend', 'uni-impressions', 'uni-clicks', 'uni-leads'][i])
    if (!s) return base
    const v = Number(s.value)
    const million = s.key === 'uni-impressions' && v >= 1_000_000
    return { ...base, value: million ? v / 1_000_000 : v, decimals: million ? 1 : 0, prefix: s.prefix || undefined,
      suffix: million ? ' million' : s.suffix || undefined, label: `${s.title}.`, note: s.description || base.note }
  })
  const kpis = staticData.kpis.map((base, i): Kpi => {
    const s = stat(['uni-cost-per-lead', 'uni-cpc', 'uni-cpm'][i])
    return s ? { ...base, value: `${s.prefix}${Number(s.value).toFixed(2)}${s.suffix}`, label: `${s.title}.` } : base
  })
  const p = d.profile
  const heroStats = [
    { value: `${p.experience_years} yil`, label: 'tajriba' },
    { value: p.projects_count, label: 'loyiha' },
    { value: p.advertising_budget, label: 'reklama byudjeti' },
  ]
  return {
    projects, filters, universities: universities.length ? universities : staticData.universities,
    services: services.length ? services : staticData.services, mainStats, kpis, heroStats,
    portrait: p.profile_image || undefined, testimonials: d.testimonials ?? [], fromApi: true,
  }
}

const Ctx = createContext<PortfolioData>(staticData)
export const usePortfolio = () => useContext(Ctx)

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PortfolioData>(staticData)
  useEffect(() => {
    if (!API_URL) return
    const ctrl = new AbortController()
    fetch(`${API_URL}/portfolio/`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d) => setData(mapAll(d)))
      .catch(() => { /* keep static fallback */ })
    return () => ctrl.abort()
  }, [])
  return <Ctx.Provider value={data}>{children}</Ctx.Provider>
}

/** Fire-and-forget visit tracking (no cookies; the server stores only a daily-rotating hash). */
export function track(event_type: 'PAGE_VIEW' | 'PROJECT_VIEW', extra: { path?: string; project?: string } = {}) {
  if (!API_URL) return
  fetch(`${API_URL}/analytics/track/`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, keepalive: true,
    body: JSON.stringify({ event_type, ...extra }),
  }).catch(() => {})
}

export async function sendContact(body: Record<string, string>): Promise<{ ok: boolean; message: string }> {
  try {
    const r = await fetch(`${API_URL}/contacts/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (r.ok) return { ok: true, message: "Xabaringiz yuborildi. Tez orada bog'lanaman." }
    if (r.status === 429) return { ok: false, message: "Juda ko'p urinish. Birozdan so'ng qayta urinib ko'ring." }
    const err = await r.json().catch(() => ({}))
    const first = Object.values(err)[0]
    return { ok: false, message: Array.isArray(first) ? String(first[0]) : "Xabarni yuborib bo'lmadi. Ma'lumotlarni tekshiring." }
  } catch { return { ok: false, message: "Server bilan aloqa yo'q. Telegram orqali yozing." } }
}
