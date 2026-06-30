import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute, GuestRoute } from '@/components/layout/ProtectedRoute'
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
import IntroductionsPage from '@/pages/dashboard/IntroductionsPage'
import DealsPage from '@/pages/dashboard/DealsPage'
import CirclesPage from '@/pages/dashboard/CirclesPage'
import CircleDetailPage from '@/pages/dashboard/CircleDetailPage'
import ProfilePage from '@/pages/dashboard/ProfilePage'
import BrokerProfilePage from '@/pages/dashboard/BrokerProfilePage'
import KYCPage from '@/pages/dashboard/KYCPage'
import ConnectionsPage from '@/pages/dashboard/ConnectionsPage'

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
          <Route path="introductions" element={<IntroductionsPage />} />
          <Route path="deals" element={<DealsPage />} />
          <Route path="circles" element={<CirclesPage />} />
          <Route path="circles/:id" element={<CircleDetailPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="kyc" element={<KYCPage />} />
          <Route path="connections" element={<ConnectionsPage />} />
          <Route path="brokers/:id" element={<BrokerProfilePage />} />
          <Route path="chat" element={<ComingSoon title="Messages" />} />
          <Route path="notifications" element={<ComingSoon title="Notifications" />} />
          <Route path="company" element={<ComingSoon title="Company Profile" />} />
          <Route path="analytics" element={<ComingSoon title="Analytics" />} />
          <Route path="settings" element={<ComingSoon title="Settings" />} />

        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

