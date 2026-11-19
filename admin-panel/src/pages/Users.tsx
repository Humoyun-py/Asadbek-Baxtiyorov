import CrudPage, { yesNo, type CrudConfig } from '../components/CrudPage'
import { Badge } from '../components/ui'
import { fmtDate } from '../utils/format'

const cfg: CrudConfig = {
  title: 'Admin users', singular: 'user', resource: 'admin/users', multipart: false, searchable: true, wide: false,
  writeRole: 'SUPERADMIN', deleteRole: 'SUPERADMIN',
  subtitle: 'Only super admins can manage users. There is no public registration.',
  filters: [{ name: 'role', label: 'Role', options: [{ value: 'SUPERADMIN', label: 'Super admin' }, { value: 'ADMIN', label: 'Admin' }, { value: 'EDITOR', label: 'Editor' }] }],
  columns: [
    { key: 'username', label: 'Username', render: (r) => <span className="font-semibold">{String(r.username)}</span> },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (r) => <Badge tone={r.role === 'SUPERADMIN' ? 'red' : r.role === 'ADMIN' ? 'blue' : 'slate'}>{String(r.role)}</Badge> },
    { key: 'is_active', label: 'Active', render: (r) => yesNo(r.is_active) },
    { key: 'last_login', label: 'Last login', render: (r) => fmtDate(r.last_login as string | null) },
  ],
  fields: [
    { name: 'username', label: 'Username', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'first_name', label: 'First name', type: 'text' },
    { name: 'last_name', label: 'Last name', type: 'text' },
    { name: 'role', label: 'Role', type: 'select', required: true, options: [{ value: 'EDITOR', label: 'Editor' }, { value: 'ADMIN', label: 'Admin' }, { value: 'SUPERADMIN', label: 'Super admin' }] },
    { name: 'password', label: 'Password', type: 'password', requiredOnCreate: true, help: 'On edit, leave empty to keep the current password; fill it in to reset it. Min 10 characters.' },
    { name: 'is_active', label: 'Active', type: 'checkbox' },
  ],
}
export default function UsersPage() { return <CrudPage cfg={cfg} /> }
