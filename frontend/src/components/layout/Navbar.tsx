import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, Bell, ChevronDown, LogOut, User, Settings, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/authStore'
import { getInitials } from '@/lib/utils'
import { cn } from '@/lib/utils'

const publicNavLinks = [
  { label: 'Area Circles', href: '/dashboard/circles' },
  { label: 'How it Works', href: '/#how' },
  { label: 'Categories', href: '/#categories' },
  { label: 'List your property', href: '/list-property' },
]

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-surface-0/95 backdrop-blur-md border-b border-border shadow-xl shadow-black/20'
          : 'bg-transparent',
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="text-brand-gold text-xl">⬡</span>
            <span className="font-bold text-base tracking-widest text-text-primary">
              COBROKINGS
            </span>
          </Link>          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {publicNavLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors rounded-lg hover:bg-surface-2"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated && user ? (
              <>
                {/* Notification bell */}
                <button className="relative p-2 text-text-secondary hover:text-text-primary hover:bg-surface-2 rounded-lg transition-colors">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-brand-gold rounded-full" />
                </button>

                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-2 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-brand-gold/20 border border-brand-gold/40 flex items-center justify-center text-xs font-semibold text-brand-gold">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        getInitials(user.fullName)
                      )}
                    </div>
                    <span className="text-sm text-text-primary hidden lg:block">{user.fullName?.split(' ')[0] ?? 'You'}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-text-muted" />
                  </button>

                  {isUserMenuOpen && (
                    <>
                      <div className="fixed inset-0" onClick={() => setIsUserMenuOpen(false)} />
                      <div className="absolute right-0 mt-2 w-52 bg-surface-1 border border-border rounded-xl shadow-2xl shadow-black/40 overflow-hidden">
                        <div className="px-4 py-3 border-b border-border">
                          <p className="text-sm font-medium text-text-primary">{user.fullName}</p>
                          <p className="text-xs text-text-muted truncate">{user.email}</p>
                        </div>
                        <nav className="p-1">
                          <Link to="/dashboard" onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-2 rounded-lg transition-colors">
                            <LayoutDashboard className="h-4 w-4" />
                            Dashboard
                          </Link>
                          <Link to="/dashboard/profile" onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-2 rounded-lg transition-colors">
                            <User className="h-4 w-4" />
                            Profile
                          </Link>
                          <Link to="/dashboard/settings" onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-2 rounded-lg transition-colors">
                            <Settings className="h-4 w-4" />
                            Settings
                          </Link>
                          <hr className="my-1 border-border" />
                          <button onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-error hover:bg-error/10 rounded-lg transition-colors">
                            <LogOut className="h-4 w-4" />
                            Logout
                          </button>
                        </nav>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild className="text-text-muted">
                  <Link to="/login">Demo login</Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/register">Get started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-text-secondary hover:text-text-primary rounded-lg"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-label="Toggle menu"
          >
            {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileOpen && (
        <div className="md:hidden bg-surface-1 border-t border-border">
          <nav className="px-4 py-3 flex flex-col gap-1">
            {publicNavLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setIsMobileOpen(false)}
                className="px-3 py-2.5 text-sm text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface-2"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="px-4 py-3 border-t border-border flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <Button variant="secondary" size="md" asChild>
                  <Link to="/dashboard" onClick={() => setIsMobileOpen(false)}>Dashboard</Link>
                </Button>
                <Button variant="ghost" size="md" onClick={handleLogout}>Logout</Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="md" asChild>
                  <Link to="/login" onClick={() => setIsMobileOpen(false)}>Sign in</Link>
                </Button>
                <Button size="md" asChild>
                  <Link to="/register" onClick={() => setIsMobileOpen(false)}>Get started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

// Minimal navbar for auth pages
export function AuthNavbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-0/95 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-brand-gold text-xl">⬡</span>
            <div>
              <span className="font-bold text-base tracking-widest text-text-primary">COBROKINGS</span>
              <span className="hidden sm:block text-xs text-text-muted -mt-0.5">Verified Property Marketplace</span>
            </div>
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">← Back to Home</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}

// Sidebar nav for dashboard
interface SidebarLinkProps {
  to: string
  icon: React.ReactNode
  label: string
  badge?: number
}

export function SidebarLink({ to, icon, label, badge }: SidebarLinkProps) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200',
          isActive
            ? 'bg-brand-gold/10 text-brand-gold border border-brand-gold/20 font-medium'
            : 'text-text-secondary hover:text-text-primary hover:bg-surface-2',
        )
      }
    >
      <span className="w-5 h-5 shrink-0">{icon}</span>
      <span className="flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="min-w-5 h-5 px-1 bg-brand-gold text-black text-xs font-bold rounded-full flex items-center justify-center">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </NavLink>
  )
}

