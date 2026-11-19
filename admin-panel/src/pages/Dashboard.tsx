import { BarChart3, DollarSign, Eye, FolderKanban, GraduationCap, Mail, Wrench } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Badge, Card, ErrorBox, PageHeader, Spinner } from '../components/ui'
import { useFetch } from '../hooks/useFetch'
import { t } from '../i18n'
import type { ActivityLog, Overview, Paginated } from '../types'
import { fmtDate, fmtNum } from '../utils/format'

interface Visits { daily: { date: string; visits: number; unique: number }[]; monthly: { month: string; visits: number }[] }

interface ContactStats { by_status: Record<string, number>; total: number }

function Stat({ icon: Icon, label, value, hint }: { icon: typeof Eye; label: string; value: string | number; hint?: string }) {
  return (
    <Card className="flex items-center gap-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand"><Icon size={20} aria-hidden /></span>
      <div className="min-w-0"><p className="truncate text-xs font-semibold uppercase tracking-wide text-slate-500">{t(label)}</p>
        <p className="text-2xl font-bold tabular-nums">{value}</p>{hint && <p className="text-xs text-slate-500">{hint}</p>}</div>
    </Card>
  )
}

function ChartCard({ title, children, empty }: { title: string; children: React.ReactNode; empty?: boolean }) {
  return <Card><h2 className="mb-3 text-sm font-bold">{t(title)}</h2><div className="h-64">{empty ? <p className="flex h-full items-center justify-center text-sm text-slate-500">{t('No data yet.')}</p> : children}</div></Card>
}

export default function Dashboard() {
  const o = useFetch<Overview>('/admin/analytics/overview/')
  const v = useFetch<Visits>('/admin/analytics/visits/?days=30')
  const p = useFetch<{ id: number; title: string; views: number }[]>('/admin/analytics/projects/')
  const c = useFetch<ContactStats>('/admin/analytics/contacts/')
  const a = useFetch<Paginated<ActivityLog>>('/admin/activity-logs/?page_size=8')

  if (o.loading && !o.data) return <Spinner />
  if (o.error) return <ErrorBox message={o.error} onRetry={o.reload} />
  const d = o.data!
  const hasVisits = !!v.data?.daily.some((x) => x.visits > 0)
  const statusData = c.data ? Object.entries(c.data.by_status).map(([name, count]) => ({ name: t(({ NEW: 'New', IN_PROGRESS: 'In progress', COMPLETED: 'Completed', SPAM: 'Spam' } as Record<string, string>)[name] ?? name), count })) : []

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Live data from the portfolio API." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={FolderKanban} label="Projects" value={d.projects_total} hint={t('{n} published', { n: d.projects_published })} />
        <Stat icon={Wrench} label="Services" value={d.services_total} />
        <Stat icon={GraduationCap} label="Campaigns" value={d.campaigns_total} />
        <Stat icon={Mail} label="New messages" value={d.messages_new} />
        <Stat icon={Eye} label="Website visits" value={fmtNum(d.visits_total)} hint={t('{n} in the last 7 days', { n: fmtNum(d.visits_7d) })} />
        <Stat icon={BarChart3} label="Project views" value={fmtNum(d.project_views_total)} />
        <Stat icon={Mail} label="Form submissions" value={fmtNum(d.contact_submissions_total)} />
        <Stat icon={DollarSign} label="Advertising budget" value={d.advertising_budget} hint={t('General (not university campaigns)')} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ChartCard title="Daily visits (30 days)" empty={!hasVisits}>
          <ResponsiveContainer><LineChart data={v.data?.daily}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="date" tickFormatter={(s) => s.slice(5)} fontSize={11} /><YAxis allowDecimals={false} fontSize={11} /><Tooltip />
            <Line dataKey="visits" stroke="#365cff" strokeWidth={2} dot={false} name={t('Visits')} /><Line dataKey="unique" stroke="#22d3ee" strokeWidth={2} dot={false} name={t('Unique')} /></LineChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Monthly visits" empty={!v.data?.monthly.length}>
          <ResponsiveContainer><BarChart data={v.data?.monthly}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="month" fontSize={11} /><YAxis allowDecimals={false} fontSize={11} /><Tooltip /><Bar dataKey="visits" fill="#365cff" radius={[6, 6, 0, 0]} name={t('Visits')} /></BarChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Popular projects" empty={!p.data?.length}>
          <ResponsiveContainer><BarChart data={p.data ?? []} layout="vertical" margin={{ left: 40 }}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis type="number" allowDecimals={false} fontSize={11} /><YAxis type="category" dataKey="title" width={110} fontSize={11} /><Tooltip /><Bar dataKey="views" fill="#22d3ee" radius={[0, 6, 6, 0]} name={t('Views')} /></BarChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Messages by status" empty={!c.data?.total}>
          <ResponsiveContainer><BarChart data={statusData}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="name" fontSize={11} /><YAxis allowDecimals={false} fontSize={11} /><Tooltip /><Bar dataKey="count" fill="#365cff" radius={[6, 6, 0, 0]} name={t('Messages')} /></BarChart></ResponsiveContainer>
        </ChartCard>
      </div>

      <Card className="mt-6">
        <h2 className="mb-3 text-sm font-bold">{t('Recent activity')}</h2>
        {a.loading ? <Spinner /> : a.error ? <ErrorBox message={a.error} /> : (
          <ul className="divide-y divide-slate-100 text-sm">
            {a.data?.results.map((l) => <li key={l.id} className="flex flex-wrap items-center gap-2 py-2"><Badge tone={l.action === 'delete' ? 'red' : l.action === 'create' ? 'green' : 'blue'}>{t(l.action)}</Badge>
              <span className="font-medium">{l.username}</span><span className="text-slate-600">{l.object_type} {l.object_repr}</span><time className="ml-auto text-xs text-slate-500">{fmtDate(l.created_at)}</time></li>)}
            {!a.data?.results.length && <li className="py-6 text-center text-slate-500">{t('No activity yet.')}</li>}
          </ul>
        )}
      </Card>
    </div>
  )
}
