import CrudPage, { yesNo, type CrudConfig } from '../components/CrudPage'

const cfg: CrudConfig = {
  title: 'Services', singular: 'service', resource: 'services', reorderable: true, multipart: false, wide: false, togglePublish: 'is_active',
  subtitle: 'Services offered. Drag to change the order.',
  columns: [
    { key: 'title', label: 'Title', render: (r) => <span className="font-semibold">{String(r.title)}</span> },
    { key: 'description', label: 'Description', className: 'max-w-md text-slate-600' },
    { key: 'icon', label: 'Icon' },
    { key: 'is_active', label: 'Active', render: (r) => yesNo(r.is_active) },
  ],
  fields: [
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'textarea', required: true },
    { name: 'icon', label: 'Icon name (Lucide)', type: 'text', help: 'e.g. Target, Megaphone, Users, Bot' },
    { name: 'is_active', label: 'Active (visible on website)', type: 'checkbox' },
  ],
}
export default function ServicesPage() { return <CrudPage cfg={cfg} /> }
