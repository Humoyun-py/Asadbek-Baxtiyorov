import { useState } from 'react'
import CrudPage, { yesNo, type CrudConfig } from '../components/CrudPage'
import { Badge, PageHeader } from '../components/ui'

const num = (r: Record<string, unknown>) => `${r.prefix ?? ''}${Number(r.value).toLocaleString('en-US', { maximumFractionDigits: 2 })}${r.suffix ?? ''}`

const globalCfg: CrudConfig = {
  title: 'Global statistics', singular: 'statistic', resource: 'statistics', multipart: false, reorderable: true, wide: false, togglePublish: 'is_active',
  subtitle: 'General portfolio figures vs. university-campaign totals — kept separate on purpose.',
  columns: [
    { key: 'title', label: 'Title', render: (r) => <span className="font-semibold">{String(r.title)}</span> },
    { key: 'value', label: 'Value', render: (r) => <span className="tabular-nums">{num(r)}</span> },
    { key: 'category', label: 'Group', render: (r) => <Badge tone={r.category === 'GENERAL' ? 'blue' : 'amber'}>{r.category === 'GENERAL' ? 'General' : 'University'}</Badge> },
    { key: 'description', label: 'Description', className: 'max-w-xs text-slate-600' },
    { key: 'is_active', label: 'Active', render: (r) => yesNo(r.is_active) },
  ],
  fields: [
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'key', label: 'Key', type: 'text', required: true, help: 'Stable identifier used by the website (lowercase, dashes).' },
    { name: 'value', label: 'Value', type: 'number', required: true },
    { name: 'prefix', label: 'Prefix (e.g. $)', type: 'text' },
    { name: 'suffix', label: 'Suffix (e.g. +)', type: 'text' },
    { name: 'category', label: 'Group', type: 'select', required: true, options: [{ value: 'GENERAL', label: 'General portfolio' }, { value: 'UNIVERSITY', label: 'University campaigns' }] },
    { name: 'description', label: 'Description', type: 'text', full: true },
    { name: 'is_active', label: 'Active', type: 'checkbox' },
  ],
}

const campaignCfg: CrudConfig = {
  title: 'Campaign statistics', singular: 'campaign statistic', resource: 'campaign-statistics', multipart: false, wide: false,
  subtitle: 'Figures attached to one specific campaign.',
  filters: [{ name: 'campaign', label: 'Campaign', optionsFrom: { resource: 'campaigns', label: 'title' } }],
  columns: [
    { key: 'title', label: 'Label', render: (r) => <span className="font-semibold">{String(r.title)}</span> },
    { key: 'value', label: 'Value', render: (r) => <span className="tabular-nums">{num(r)}</span> },
    { key: 'is_active', label: 'Active', render: (r) => yesNo(r.is_active) },
  ],
  fields: [
    { name: 'campaign', label: 'Campaign', type: 'select', required: true, optionsFrom: { resource: 'campaigns', label: 'title' } },
    { name: 'title', label: 'Label', type: 'text', required: true },
    { name: 'value', label: 'Value', type: 'number', required: true },
    { name: 'prefix', label: 'Prefix', type: 'text' },
    { name: 'suffix', label: 'Suffix', type: 'text' },
    { name: 'is_active', label: 'Active', type: 'checkbox' },
  ],
}

export default function StatisticsPage() {
  const [tab, setTab] = useState<'global' | 'campaign'>('global')
  return (
    <div>
      <PageHeader title="Statistics" />
      <div role="tablist" className="mb-5 inline-flex rounded-xl bg-white p-1 ring-1 ring-slate-200">
        {(['global', 'campaign'] as const).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-1.5 text-sm font-semibold ${tab === t ? 'bg-brand text-white' : 'text-slate-600'}`}>
            {t === 'global' ? 'Global' : 'Per campaign'}
          </button>
        ))}
      </div>
      {tab === 'global' ? <CrudPage key="g" cfg={globalCfg} /> : <CrudPage key="c" cfg={campaignCfg} />}
    </div>
  )
}
