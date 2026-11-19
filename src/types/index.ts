import type { LucideIcon } from 'lucide-react'

export type Category = string
export type Filter = string

export interface Project {
  id: string
  name: string
  category: Category
  badge: string
  short: string
  role: string
  author?: string
  direction?: string
  image: string
  highlights: string[]
  lists?: { title: string; items: string[] }[]
  stats?: { value: string; label: string }[]
  handle?: string
}

export interface University {
  id: string
  short: string
  name: string
  role: string
  image: string
  stats: { value: string; label: string }[]
  points: string[]
}

export interface Service { title: string; text: string; icon: LucideIcon }
export interface StatItem { value: number; prefix?: string; suffix?: string; decimals?: number; label: string; display?: string }
export interface Kpi { value: string; label: string; icon: LucideIcon }
