import SingletonForm from '../components/SingletonForm'
import type { FieldDef } from '../components/forms'

const fields: FieldDef[] = [
  { name: 'website_title', label: 'Website title', type: 'text', required: true },
  { name: 'website_description', label: 'Website description', type: 'textarea' },
  { name: 'logo', label: 'Logo', type: 'image' },
  { name: 'favicon', label: 'Favicon', type: 'image' },
  { name: 'primary_color', label: 'Primary colour', type: 'color', required: true },
  { name: 'secondary_color', label: 'Secondary colour', type: 'color', required: true },
  { name: 'telegram_url', label: 'Telegram URL', type: 'url' },
  { name: 'instagram_url', label: 'Instagram URL', type: 'url' },
  { name: 'footer_text', label: 'Footer text', type: 'text', full: true },
  { name: 'contact_email', label: 'Contact email', type: 'email' },
  { name: 'contact_phone', label: 'Contact phone', type: 'text' },
  { name: 'contact_address', label: 'Contact address', type: 'text', full: true },
  { name: 'seo_title', label: 'SEO title', type: 'text', help: 'Up to 70 characters.' },
  { name: 'seo_description', label: 'SEO description', type: 'textarea', help: 'Up to 170 characters.' },
  { name: 'og_image', label: 'Open Graph image', type: 'image' },
  { name: 'maintenance_mode', label: 'Maintenance mode', type: 'checkbox' },
]
export default function WebsiteSettingsPage() {
  return <SingletonForm title="Website settings" subtitle="Branding, SEO and site-wide switches (super admin only)." endpoint="/settings/" fields={fields} writeRole="SUPERADMIN" />
}
