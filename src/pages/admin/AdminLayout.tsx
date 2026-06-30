import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, Building2, FileText,
  Settings, LogOut, ChevronRight, Shield,
  BarChart3, Bell,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'

const NAV = [
  { to: '/admin',           label: 'Dashboard',  icon: <LayoutDashboard className="h-4 w-4" />, exact: true },
  { to: '/admin/users',     label: 'Users',      icon: <Users className="h-4 w-4" />, badge: 12 },
  { to: '/admin/companies', label: 'Companies',  icon: <Building2 className="h-4 w-4" />, badge: 5 },
  { to: '/admin/mandates',  label: 'Mandates',   icon: <FileText className="h-4 w-4" />, badge: 3 },
  { to: '/admin/analytics', label: 'Analytics',  icon: <BarChart3 className="h-4 w-4" /> },
  { to: '/admin/settings',  label: 'Platform Settings', icon: <Settings className="h-4 w-4" /> },
]

export default function AdminLayout() {
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const isActive = (to: string, exact?: boolean) =>
    exact ? location.pathname === to : location.pathname.startsWith(to)

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="flex h-screen bg-surface-0 overflow-hidden">
      {/* Sidebar */}
      <aside className={cn(
        'flex flex-col h-full border-r border-border bg-surface-1 transition-all duration-200 shrink-0',
        collapsed ? 'w-14' : 'w-56',
      )}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-border">
          <div className="w-7 h-7 rounded-lg bg-error flex items-center justify-center shrink-0">
            <Shield className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-xs font-bold text-text-primary tracking-wide">COBROKINGS</p>
              <p className="text-[10px] text-error font-semibold uppercase tracking-widest">Admin Panel</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 flex flex-col gap-0.5">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={cn(
                'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors',
                isActive(n.to, n.exact)
                  ? 'bg-error/10 text-error font-medium'
                  : 'text-text-muted hover:text-text-secondary hover:bg-surface-2',
              )}
            >
              {n.icon}
              {!collapsed && (
                <>
                  <span className="flex-1 truncate">{n.label}</span>
                  {n.badge && (
                    <span className="text-[10px] font-bold bg-error text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                      {n.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-2">
          <div className={cn('flex items-center gap-2 px-2 py-2 mb-1', collapsed && 'justify-center')}>
            <div className="w-7 h-7 rounded-full bg-error/10 flex items-center justify-center text-xs font-bold text-error shrink-0">
              {user?.fullName?.[0] ?? 'A'}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-text-primary truncate">{user?.fullName ?? 'Admin'}</p>
                <p className="text-[10px] text-error font-medium uppercase tracking-wide">Super Admin</p>
              </div>
            )}
          </div>
          <div className="flex gap-1">
            <Link to="/dashboard"
              className={cn('flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-text-muted hover:text-text-secondary hover:bg-surface-2 transition-colors', collapsed ? 'justify-center w-full' : 'flex-1')}>
              <ChevronRight className="h-3.5 w-3.5" />
              {!collapsed && 'Broker view'}
            </Link>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-text-muted hover:text-error hover:bg-error/10 transition-colors">
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-12 border-b border-border bg-surface-1 flex items-center justify-between px-5 shrink-0">
          <button onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-secondary hover:bg-surface-2 transition-colors">
            <LayoutDashboard className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-error/10 text-error font-medium border border-error/20">
              Admin mode
            </span>
            <button className="p-1.5 rounded-lg text-text-muted hover:text-text-secondary hover:bg-surface-2 transition-colors relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-error" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
