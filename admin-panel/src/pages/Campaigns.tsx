import CrudPage, { yesNo, type CrudConfig } from '../components/CrudPage'
import { CampaignGallery, CampaignStats } from '../components/ProjectExtras'

const money = { type: 'number' as const }
const cfg: CrudConfig = {
  title: 'University campaigns', singular: 'campaign', resource: 'campaigns', reorderable: true, searchable: true, togglePublish: 'is_active',
  subtitle: 'Admission campaigns. Fill only the figures you actually know — empty values are not shown.',
  columns: [
    { key: 'campaign_image', label: '', render: (r) => (r.campaign_image as string) ? <img src={r.campaign_image as string} alt="" className="h-10 w-14 rounded object-cover" /> : <div className="h-10 w-14 rounded bg-slate-100" /> },
    { key: 'title', label: 'Short name', render: (r) => <span className="font-semibold">{String(r.title)}</span> },
    { key: 'university_name', label: 'University' },
    { key: 'followers_count', label: 'Followers', render: (r) => (r.followers_count as number | null)?.toLocaleString() ?? '—' },
    { key: 'leads', label: 'Leads', render: (r) => (r.leads as number | null)?.toLocaleString() ?? '—' },
    { key: 'is_active', label: 'Active', render: (r) => yesNo(r.is_active) },
  ],
  fields: [
    { name: 'title', label: 'Short name (e.g. TPU)', type: 'text', required: true },
    { name: 'university_name', label: 'University name', type: 'text', required: true },
    { name: 'role', label: 'My role', type: 'text' },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'points', label: 'Key points', type: 'strings' },
    { name: 'followers_count', label: 'Followers', type: 'number', integer: true },
    { name: 'advertising_budget', label: 'Advertising budget ($)', ...money },
    { name: 'impressions', label: 'Impressions', type: 'number', integer: true },
    { name: 'clicks', label: 'Clicks', type: 'number', integer: true },
    { name: 'leads', label: 'Leads', type: 'number', integer: true },
    { name: 'cpc', label: 'CPC ($)', ...money },
    { name: 'cpm', label: 'CPM ($)', ...money },
    { name: 'cost_per_lead', label: 'Cost per lead ($)', ...money },
    { name: 'start_date', label: 'Start date', type: 'date' },
    { name: 'end_date', label: 'End date', type: 'date' },
    { name: 'campaign_image', label: 'Main screenshot', type: 'image' },
    { name: 'is_active', label: 'Active (visible on website)', type: 'checkbox' },
  ],
  renderFormExtra: (item, reload) => (
    <div className="space-y-4">
      <CampaignStats campaignId={item.id} />
      <CampaignGallery campaignId={item.id} onChange={reload} />
    </div>
  ),
}
export default function CampaignsPage() { return <CrudPage cfg={cfg} /> }
