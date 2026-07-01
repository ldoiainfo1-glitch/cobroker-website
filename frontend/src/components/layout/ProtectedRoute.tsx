import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { FullPageSpinner } from '@/components/ui/spinner'

// Protects admin routes — must be authenticated AND have role 'super_admin'
export function AdminRoute() {
  const { isAuthenticated, isLoading, user } = useAuthStore()
  const location = useLocation()

  if (isLoading) return <FullPageSpinner />
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }
  if (user?.role !== 'super_admin') {
    return <Navigate to="/dashboard" replace />
  }
  return <Outlet />
}

// Protects routes that require authentication
export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuthStore()
  const location = useLocation()

  if (isLoading) return <FullPageSpinner />
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return <Outlet />
}

// Redirects authenticated users away from auth pages
export function GuestRoute() {
  const { isAuthenticated, isLoading, user } = useAuthStore()

  if (isLoading) return <FullPageSpinner />
  if (isAuthenticated) {
    return <Navigate to={user?.role === 'super_admin' ? '/admin' : '/dashboard'} replace />
  }
  return <Outlet />
}

