import CrudPage, { yesNo, type CrudConfig } from '../components/CrudPage'
import { ProjectGallery } from '../components/ProjectExtras'
import { Badge } from '../components/ui'
import { t } from '../i18n'
import type { Project } from '../types'

const cfg: CrudConfig = {
  title: 'Projects', singular: 'project', resource: 'projects', subtitle: 'Portfolio projects shown on the public website.',
  searchable: true, reorderable: true, writeRole: 'EDITOR', deleteRole: 'ADMIN', togglePublish: 'is_published',
  filters: [{ name: 'category', label: 'Category', optionsFrom: { resource: 'project-categories', label: 'name' } },
            { name: 'is_published', label: 'Status', options: [{ value: 'true', label: 'Published' }, { value: 'false', label: 'Draft' }] }],
  columns: [
    { key: 'project_image', label: '', render: (r) => (r.project_image as string)
      ? <img src={r.project_image as string} alt="" className="h-10 w-14 rounded object-cover" /> : <div className="h-10 w-14 rounded bg-slate-100" /> },
    { key: 'title', label: 'Title', render: (r) => <span className="font-semibold">{String(r.title)}</span> },
    { key: 'category', label: 'Category', render: (r) => <Badge tone="blue">{(r as unknown as Project).category_detail?.name}</Badge> },
    { key: 'followers_count', label: 'Followers', render: (r) => (r.followers_count as number | null)?.toLocaleString() ?? '—' },
    { key: 'is_featured', label: 'Featured', render: (r) => yesNo(r.is_featured) },
    { key: 'is_published', label: 'Status', render: (r) => <Badge tone={r.is_published ? 'green' : 'amber'}>{r.is_published ? t('Published') : t('Draft')}</Badge> },
  ],
  fields: [
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'slug', label: 'Slug', type: 'text', help: 'Leave empty to generate from the title.' },
    { name: 'category', label: 'Category', type: 'select', required: true, optionsFrom: { resource: 'project-categories', label: 'name' } },
    { name: 'badge', label: 'Card badge', type: 'text' },
    { name: 'short_description', label: 'Short description', type: 'textarea', required: true },
    { name: 'full_description', label: 'Full description', type: 'textarea' },
    { name: 'client_name', label: 'Client name', type: 'text' },
    { name: 'role', label: 'My role', type: 'text' },
    { name: 'followers_count', label: 'Followers', type: 'number', integer: true },
    { name: 'direction', label: 'Direction', type: 'text' },
    { name: 'project_image', label: 'Card image', type: 'image' },
    { name: 'cover_image', label: 'Cover image', type: 'image' },
    { name: 'project_url', label: 'Project URL', type: 'url' },
    { name: 'instagram_url', label: 'Instagram URL', type: 'url' },
    { name: 'telegram_url', label: 'Telegram URL', type: 'url' },
    { name: 'handle', label: 'Handle (e.g. bot)', type: 'text' },
    { name: 'highlights', label: 'Highlights', type: 'strings' },
    { name: 'extra_lists', label: 'Extra lists (JSON)', type: 'json', help: 'e.g. [{"title": "Style", "items": ["Luxury"]}]' },
    { name: 'start_date', label: 'Start date', type: 'date' },
    { name: 'end_date', label: 'End date', type: 'date' },
    { name: 'is_featured', label: 'Featured project', type: 'checkbox' },
    { name: 'is_published', label: 'Published', type: 'checkbox' },
  ],
  renderFormExtra: (item, reload) => <ProjectGallery project={item} onChange={reload} />,
}

export default function ProjectsPage() { return <CrudPage cfg={cfg} /> }
