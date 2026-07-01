import { useState } from 'react'
import { Outlet, Link } from 'react-router-dom'
import {
  LayoutDashboard, Building2, Search,
  MessageSquare, Bell, BarChart3, Settings,
  ChevronLeft, ChevronRight, Plus, LogOut, Radio,
  UserCircle, Shield, GitBranch,
} from 'lucide-react'
import { SidebarLink } from '@/components/layout/Navbar'
import { useAuthStore } from '@/stores/authStore'
import { getInitials, cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type NavLink = { to: string; icon: React.ReactNode; label: string; badge?: number }

const navSections: { title: string; links: NavLink[] }[] = [
  {
    title: 'Main',
    links: [
      { to: '/dashboard', icon: <LayoutDashboard className="h-4 w-4" />, label: 'Dashboard' },
      { to: '/dashboard/mandates', icon: <Building2 className="h-4 w-4" />, label: 'My Mandates' },
      { to: '/dashboard/marketplace', icon: <Search className="h-4 w-4" />, label: 'Marketplace' },
    ],
  },
  {
    title: 'Co-Broking',
    links: [
      { to: '/dashboard/circles', icon: <Radio className="h-4 w-4" />, label: 'Circles', badge: 3 },
    ],
  },
  {
    title: 'Communication',
    links: [
      { to: '/dashboard/chat', icon: <MessageSquare className="h-4 w-4" />, label: 'Messages', badge: 5 },
      { to: '/dashboard/notifications', icon: <Bell className="h-4 w-4" />, label: 'Notifications', badge: 2 },
    ],
  },
  {
    title: 'Trust & Network',
    links: [
      { to: '/dashboard/profile', icon: <UserCircle className="h-4 w-4" />, label: 'My Profile' },
      { to: '/dashboard/kyc', icon: <Shield className="h-4 w-4" />, label: 'KYC & Verification' },
      { to: '/dashboard/network', icon: <GitBranch className="h-4 w-4" />, label: 'My Network' },
    ],
  },
  {
    title: 'Company',
    links: [
      { to: '/dashboard/company', icon: <Building2 className="h-4 w-4" />, label: 'Company Profile' },
      { to: '/dashboard/analytics', icon: <BarChart3 className="h-4 w-4" />, label: 'Analytics' },
      { to: '/dashboard/settings', icon: <Settings className="h-4 w-4" />, label: 'Settings' },
    ],
  },
]

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuthStore()

  return (
    <div className="flex h-screen bg-surface-0 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          'flex flex-col bg-surface-1 border-r border-border transition-all duration-300 ease-in-out relative shrink-0',
          collapsed ? 'w-18' : 'w-67',
        )}
      >
        {/* Logo */}
        <div className={cn('flex items-center gap-2 px-4 h-16 border-b border-border', collapsed && 'justify-center px-0')}>
          {!collapsed ? (
            <Link to="/" className="flex items-center gap-2">
              <span className="text-brand-gold text-lg">⬡</span>
              <span className="font-bold text-sm tracking-widest text-text-primary">COBROKINGS</span>
            </Link>
          ) : (
            <Link to="/" className="text-brand-gold text-xl">⬡</Link>
          )}
        </div>

        {/* Post mandate CTA */}
        {!collapsed && (
          <div className="px-3 py-3 border-b border-border">
            <Button size="sm" className="w-full text-xs" asChild>
              <Link to="/dashboard/mandates/new">
                <Plus className="h-3.5 w-3.5" /> Post Mandate
              </Link>
            </Button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 flex flex-col gap-5">
          {navSections.map((section) => (
            <div key={section.title}>
              {!collapsed && (
                <p className="px-3 mb-1 text-xs font-semibold text-text-muted uppercase tracking-wider">
                  {section.title}
                </p>
              )}
              <div className="flex flex-col gap-0.5">
                {section.links.map((link) =>
                  collapsed ? (
                    <Link
                      key={link.to}
                      to={link.to}
                      title={link.label}
                      className="flex items-center justify-center p-2.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors relative"
                    >
                      {link.icon}
                      {link.badge && link.badge > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-brand-gold" />
                      )}
                    </Link>
                  ) : (
                    <SidebarLink key={link.to} to={link.to} icon={link.icon} label={link.label} badge={link.badge} />
                  ),
                )}
              </div>
            </div>
          ))}
        </nav>

        {/* Admin return banner — only visible to super_admin */}
        {user?.role === 'super_admin' && (
          <div className={cn('px-3 pb-2', collapsed && 'flex justify-center')}>
            {!collapsed ? (
              <Link
                to="/admin"
                className="flex items-center gap-2 w-full px-3 py-2 rounded-xl bg-error/10 border border-error/20 text-error text-xs font-semibold hover:bg-error/20 transition-colors"
              >
                <Shield className="h-3.5 w-3.5 shrink-0" />
                Back to Admin Panel
              </Link>
            ) : (
              <Link
                to="/admin"
                title="Back to Admin Panel"
                className="p-2 rounded-xl bg-error/10 text-error hover:bg-error/20 transition-colors flex items-center justify-center"
              >
                <Shield className="h-4 w-4" />
              </Link>
            )}
          </div>
        )}

        {/* User footer */}
        <div className={cn('border-t border-border p-3', collapsed && 'flex justify-center')}>
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-brand-gold/20 border border-brand-gold/30 flex items-center justify-center text-sm font-semibold text-brand-gold shrink-0">
                {user ? getInitials(user.fullName) : '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{user?.fullName || 'User'}</p>
                <p className="text-xs text-text-muted truncate">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                title="Logout"
                className="p-1.5 text-text-muted hover:text-error hover:bg-error/10 rounded-lg transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={logout}
              title="Logout"
              className="p-2 text-text-muted hover:text-error hover:bg-error/10 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-surface-1 border border-border rounded-full flex items-center justify-center text-text-muted hover:text-text-primary hover:border-brand-gold/40 transition-all z-10"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 border-b border-border bg-surface-1 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                placeholder="Search mandates, companies..."
                className="h-9 w-72 pl-9 pr-4 rounded-lg bg-surface-2 border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-gold/50 transition-colors"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 text-text-secondary hover:text-text-primary hover:bg-surface-2 rounded-lg transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-gold rounded-full" />
            </button>
            <div className="w-9 h-9 rounded-full bg-brand-gold/20 border border-brand-gold/30 flex items-center justify-center text-sm font-semibold text-brand-gold cursor-pointer">
              {user ? getInitials(user.fullName) : '?'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto bg-surface-0 flex flex-col">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

