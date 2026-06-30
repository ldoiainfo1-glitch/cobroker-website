import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { FullPageSpinner } from '@/components/ui/spinner'

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
  const { isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) return <FullPageSpinner />
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }
  return <Outlet />
}

