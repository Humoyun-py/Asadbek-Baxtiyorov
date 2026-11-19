import { Activity, BarChart3, FolderKanban, Globe, KeyRound, LayoutDashboard, LogOut, Mail, Menu, MessageSquareQuote, Settings, Tags, UserCircle, Users, Wrench, X, GraduationCap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import ChangePasswordModal from '../components/ChangePasswordModal'
import { useAuth } from '../contexts/AuthContext'
import { LanguageSwitcher, t } from '../i18n'
import { api } from '../services/api'
import type { Role } from '../types'

interface NavItem { to: string; label: string; icon: typeof Globe; min: Role; badge?: boolean }
const NAV: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, min: 'ADMIN' },
  { to: '/projects', label: 'Projects', icon: FolderKanban, min: 'EDITOR' },
  { to: '/categories', label: 'Categories', icon: Tags, min: 'ADMIN' },
  { to: '/services', label: 'Services', icon: Wrench, min: 'ADMIN' },
  { to: '/campaigns', label: 'Campaigns', icon: GraduationCap, min: 'ADMIN' },
  { to: '/statistics', label: 'Statistics', icon: BarChart3, min: 'ADMIN' },
  { to: '/messages', label: 'Messages', icon: Mail, min: 'ADMIN', badge: true },
  { to: '/testimonials', label: 'Testimonials', icon: MessageSquareQuote, min: 'ADMIN' },
  { to: '/profile', label: 'Portfolio profile', icon: UserCircle, min: 'ADMIN' },
  { to: '/settings', label: 'Website settings', icon: Settings, min: 'SUPERADMIN' },
  { to: '/users', label: 'Admin users', icon: Users, min: 'SUPERADMIN' },
  { to: '/activity', label: 'Activity log', icon: Activity, min: 'ADMIN' },
]

export default function AdminLayout() {
  const { user, logout, can } = useAuth()
  const [open, setOpen] = useState(false)
  const [newCount, setNewCount] = useState(0)
  const [pwOpen, setPwOpen] = useState(false)

  useEffect(() => {
    if (!can('ADMIN')) return
    const load = () => api.get('/contacts/', { params: { status: 'NEW', page_size: 1 } }).then((r) => setNewCount(r.data.count)).catch(() => {})
    load()
    const t = setInterval(load, 60_000)
    window.addEventListener('messages-changed', load)
    return () => { clearInterval(t); window.removeEventListener('messages-changed', load) }
  }, [can])

  const items = NAV.filter((n) => can(n.min))
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-sidebar text-slate-300 transition lg:static lg:w-auto lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center justify-between px-5">
          <div className="flex items-center gap-2 font-bold text-white"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand"><Globe size={17} aria-hidden /></span> Portfolio Admin</div>
          <button className="lg:hidden" aria-label={t('Close menu')} onClick={() => setOpen(false)}><X size={20} /></button>
        </div>
        <nav aria-label={t('Main')} className="space-y-1 px-3 pb-24">
          {items.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.to === '/'} onClick={() => setOpen(false)}
              className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-brand text-white' : 'hover:bg-white/10 hover:text-white'}`}>
              <n.icon size={18} aria-hidden /> <span className="flex-1">{t(n.label)}</span>
              {n.badge && newCount > 0 && <span aria-label={t('{n} new messages', { n: newCount })} className="rounded-full bg-cyan px-2 py-0.5 text-xs font-bold text-navy">{newCount}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-sidebar p-3">
          <div className="mb-2 px-2 text-xs"><div className="truncate font-semibold text-white">{user?.username}</div><div className="text-slate-400">{user?.role}</div></div>
          <LanguageSwitcher className="mb-2 w-full [&>button]:flex-1" />
          <div className="flex gap-2">
            <button onClick={() => setPwOpen(true)} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white/10 px-2 py-2 text-xs font-semibold hover:bg-white/20"><KeyRound size={14} aria-hidden /> {t('Password')}</button>
            <button onClick={logout} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white/10 px-2 py-2 text-xs font-semibold hover:bg-white/20"><LogOut size={14} aria-hidden /> {t('Sign out')}</button>
          </div>
        </div>
      </aside>
      {open && <div className="fixed inset-0 z-30 bg-navy/60 lg:hidden" onClick={() => setOpen(false)} aria-hidden />}
      <div className="min-w-0">
        <header className="flex h-16 items-center gap-3 bg-navy px-4 text-white lg:hidden">
          <button aria-label={t('Open menu')} onClick={() => setOpen(true)}><Menu size={22} /></button><span className="font-bold">Portfolio Admin</span><LanguageSwitcher className="ml-auto" />
        </header>
        <main className="mx-auto max-w-6xl p-4 sm:p-8"><Outlet /></main>
      </div>
      <ChangePasswordModal open={pwOpen} onClose={() => setPwOpen(false)} />
    </div>
  )
}
