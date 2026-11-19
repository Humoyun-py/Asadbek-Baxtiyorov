import CrudPage, { type CrudConfig } from '../components/CrudPage'
import { Badge } from '../components/ui'

const cfg: CrudConfig = {
  title: 'Testimonials', singular: 'testimonial', resource: 'testimonials', reorderable: true, togglePublish: 'is_published',
  subtitle: 'Only real client testimonials. The website section stays hidden until one is published.',
  columns: [
    { key: 'client_name', label: 'Client', render: (r) => <span className="font-semibold">{String(r.client_name)}</span> },
    { key: 'company_name', label: 'Company' },
    { key: 'rating', label: 'Rating', render: (r) => `${r.rating} / 5` },
    { key: 'is_published', label: 'Status', render: (r) => <Badge tone={r.is_published ? 'green' : 'amber'}>{r.is_published ? 'Published' : 'Hidden'}</Badge> },
  ],
  fields: [
    { name: 'client_name', label: 'Client name', type: 'text', required: true },
    { name: 'client_position', label: 'Position', type: 'text' },
    { name: 'company_name', label: 'Company', type: 'text' },
    { name: 'rating', label: 'Rating (1-5)', type: 'number', integer: true, required: true },
    { name: 'testimonial_text', label: 'Testimonial', type: 'textarea', required: true },
    { name: 'client_image', label: 'Client photo', type: 'image' },
    { name: 'is_published', label: 'Published', type: 'checkbox' },
  ],
}
export default function TestimonialsPage() { return <CrudPage cfg={cfg} /> }
