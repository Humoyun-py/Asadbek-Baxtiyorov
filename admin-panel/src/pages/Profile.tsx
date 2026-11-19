import SingletonForm from '../components/SingletonForm'
import type { FieldDef } from '../components/forms'

const fields: FieldDef[] = [
  { name: 'full_name', label: 'Full name', type: 'text', required: true },
  { name: 'professional_title', label: 'Professional titles', type: 'text', full: true },
  { name: 'description', label: 'Short description', type: 'textarea' },
  { name: 'biography', label: 'Biography', type: 'textarea' },
  { name: 'profile_image', label: 'Profile image', type: 'image' },
  { name: 'experience_years', label: 'Experience (years)', type: 'number', integer: true, required: true },
  { name: 'projects_count', label: 'Projects count', type: 'text', required: true, help: 'Shown as text, e.g. 10+' },
  { name: 'advertising_budget', label: 'General advertising budget', type: 'text', required: true, help: 'e.g. $180 000+ (separate from the university campaigns budget)' },
  { name: 'agency_name', label: 'Agency name', type: 'text' },
  { name: 'telegram_url', label: 'Telegram URL', type: 'url' },
  { name: 'instagram_url', label: 'Instagram URL', type: 'url' },
  { name: 'github_url', label: 'GitHub URL', type: 'url' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'is_active', label: 'Profile active', type: 'checkbox' },
]
export default function ProfilePage() {
  return <SingletonForm title="Portfolio profile" subtitle="Main personal information shown on the website." endpoint="/portfolio/profile/" fields={fields} />
}
