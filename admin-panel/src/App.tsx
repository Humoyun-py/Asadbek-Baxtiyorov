import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Spinner } from './components/ui'
import { useAuth } from './contexts/AuthContext'
import AdminLayout from './layouts/AdminLayout'
import ActivityLogPage from './pages/ActivityLog'
import Campaigns from './pages/Campaigns'
import Categories from './pages/Categories'
import Login from './pages/Login'
import Messages from './pages/Messages'
import Profile from './pages/Profile'
import Projects from './pages/Projects'
import ResetPassword from './pages/ResetPassword'
import Services from './pages/Services'
import Statistics from './pages/Statistics'
import Testimonials from './pages/Testimonials'
import Users from './pages/Users'
import WebsiteSettings from './pages/WebsiteSettings'
import type { Role } from './types'

const Dashboard = lazy(() => import('./pages/Dashboard'))

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const loc = useLocation()
  if (loading) return <div className="min-h-screen bg-navy"><Spinner /></div>
  if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname }} />
  return <>{children}</>
}

function Role({ min, children }: { min: Role; children: React.ReactNode }) {
  const { can } = useAuth()
  // Editors only have access to projects; send them there instead of showing an error page.
  return can(min) ? <>{children}</> : <Navigate to="/projects" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<RequireAuth><AdminLayout /></RequireAuth>}>
        <Route index element={<Role min="ADMIN"><Suspense fallback={<Spinner />}><Dashboard /></Suspense></Role>} />
        <Route path="projects" element={<Projects />} />
        <Route path="categories" element={<Role min="ADMIN"><Categories /></Role>} />
        <Route path="services" element={<Role min="ADMIN"><Services /></Role>} />
        <Route path="campaigns" element={<Role min="ADMIN"><Campaigns /></Role>} />
        <Route path="statistics" element={<Role min="ADMIN"><Statistics /></Role>} />
        <Route path="messages" element={<Role min="ADMIN"><Messages /></Role>} />
        <Route path="testimonials" element={<Role min="ADMIN"><Testimonials /></Role>} />
        <Route path="profile" element={<Role min="ADMIN"><Profile /></Role>} />
        <Route path="settings" element={<Role min="SUPERADMIN"><WebsiteSettings /></Role>} />
        <Route path="users" element={<Role min="SUPERADMIN"><Users /></Role>} />
        <Route path="activity" element={<Role min="ADMIN"><ActivityLogPage /></Role>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
