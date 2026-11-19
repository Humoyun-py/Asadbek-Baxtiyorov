import CrudPage, { type CrudConfig } from '../components/CrudPage'

const cfg: CrudConfig = {
  title: 'Project categories', singular: 'category', resource: 'project-categories', reorderable: true, multipart: false, wide: false,
  subtitle: 'Categories used to filter projects on the website.',
  columns: [{ key: 'name', label: 'Name' }, { key: 'slug', label: 'Slug' }],
  fields: [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'slug', label: 'Slug', type: 'text', help: 'Leave empty to generate.' },
  ],
}
export default function CategoriesPage() { return <CrudPage cfg={cfg} /> }
