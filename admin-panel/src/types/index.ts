export type Role = 'SUPERADMIN' | 'ADMIN' | 'EDITOR'
export const ROLE_RANK: Record<Role, number> = { EDITOR: 1, ADMIN: 2, SUPERADMIN: 3 }

export interface User {
  id: number; username: string; email: string; first_name: string; last_name: string
  role: Role; is_active: boolean; is_staff: boolean; date_joined: string; last_login: string | null
}

export interface Paginated<T> { count: number; next: string | null; previous: string | null; results: T[] }

export interface Category { id: number; name: string; slug: string; display_order: number }
export interface GalleryImage { id: number; image: string; caption: string; display_order: number }

export interface Project {
  id: number; title: string; slug: string; category: number; category_detail: Category
  badge: string; short_description: string; full_description: string; client_name: string; role: string
  followers_count: number | null; project_image: string | null; cover_image: string | null
  gallery: GalleryImage[]; project_url: string; instagram_url: string; telegram_url: string
  handle: string; direction: string; highlights: string[]; extra_lists: { title: string; items: string[] }[]
  start_date: string | null; end_date: string | null; is_featured: boolean; is_published: boolean
  display_order: number; created_at: string; updated_at: string
}

export interface ContactMessage {
  id: number; full_name: string; email: string; phone: string; telegram_username: string
  subject: string; message: string; status: 'NEW' | 'IN_PROGRESS' | 'COMPLETED' | 'SPAM'
  created_at: string; updated_at: string
}

export interface ActivityLog {
  id: number; username: string; action: string; object_type: string; object_id: string
  object_repr: string; created_at: string
}

export interface Overview {
  projects_total: number; projects_published: number; services_total: number; campaigns_total: number
  messages_new: number; visits_total: number; visits_7d: number; unique_visitor_days: number
  project_views_total: number; contact_submissions_total: number
  advertising_budget: string; advertising_budget_label: string
}
