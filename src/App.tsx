import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute, GuestRoute, AdminRoute } from '@/components/layout/ProtectedRoute'
import { PublicLayout } from '@/components/layout/PublicLayout'

// Public pages
import HomePage from '@/pages/public/HomePage'
import MarketplacePage from '@/pages/public/MarketplacePage'
import MandateDetailPage from '@/pages/dashboard/MandateDetailPage'

// Auth pages
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'

// Dashboard
import DashboardLayout from '@/pages/dashboard/DashboardLayout'
import DashboardHome from '@/pages/dashboard/DashboardHome'
import MandatesPage from '@/pages/dashboard/MandatesPage'
import PostMandatePage from '@/pages/dashboard/PostMandatePage'
import CirclesPage from '@/pages/dashboard/CirclesPage'
import CircleDetailPage from '@/pages/dashboard/CircleDetailPage'
import ProfilePage from '@/pages/dashboard/ProfilePage'
import BrokerProfilePage from '@/pages/dashboard/BrokerProfilePage'
import KYCPage from '@/pages/dashboard/KYCPage'
import ChatPage from '@/pages/dashboard/ChatPage'
import NotificationsPage from '@/pages/dashboard/NotificationsPage'
import CompanyProfilePage from '@/pages/dashboard/CompanyProfilePage'
import SettingsPage from '@/pages/dashboard/SettingsPage'
import ListPropertyPage from '@/pages/public/ListPropertyPage'
import AdminLayout from '@/pages/admin/AdminLayout'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminUsersPage from '@/pages/admin/AdminUsersPage'
import AdminCompaniesPage from '@/pages/admin/AdminCompaniesPage'
import AdminMandatesPage from '@/pages/admin/AdminMandatesPage'
import AdminAnalyticsPage from '@/pages/admin/AdminAnalyticsPage'
import AdminPlatformSettingsPage from '@/pages/admin/AdminPlatformSettingsPage'

// Placeholder for not-yet-built pages
function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="text-center">
        <div className="text-4xl mb-4">🚧</div>
        <h2 className="text-xl font-semibold text-text-primary mb-2">{title}</h2>
        <p className="text-text-muted text-sm">This page is being built. Coming soon!</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Public routes — wrapped in PublicLayout (Navbar + Footer) */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
      </Route>

      {/* Marketplace — standalone (has its own Navbar) */}
      <Route path="/marketplace" element={<MarketplacePage />} />
      <Route path="/marketplace/:id" element={<MandateDetailPage />} />

      {/* List property — public, no auth required */}
      <Route path="/list-property" element={<ListPropertyPage />} />

      {/* Auth routes (guests only) */}
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      {/* Dashboard routes (authenticated only) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="mandates" element={<MandatesPage />} />
          <Route path="mandates/new" element={<PostMandatePage />} />
          <Route path="mandates/:id/edit" element={<PostMandatePage />} />
          <Route path="circles" element={<CirclesPage />} />
          <Route path="circles/:id" element={<CircleDetailPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="kyc" element={<KYCPage />} />
          <Route path="brokers/:id" element={<BrokerProfilePage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="chat/:conversationId" element={<ChatPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="company" element={<CompanyProfilePage />} />
          <Route path="analytics" element={<ComingSoon title="Analytics" />} />
          <Route path="settings" element={<SettingsPage />} />

        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />

      {/* Admin panel — requires super_admin role */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="companies" element={<AdminCompaniesPage />} />
          <Route path="mandates" element={<AdminMandatesPage />} />
          <Route path="analytics" element={<AdminAnalyticsPage />} />
          <Route path="settings" element={<AdminPlatformSettingsPage />} />
        </Route>
      </Route>
    </Routes>
  )
}


