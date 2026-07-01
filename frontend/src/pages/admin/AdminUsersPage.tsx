import { useState } from 'react'
import { Search, Filter, CheckCircle2, XCircle, Shield, MoreVertical, ChevronDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type UserStatus = 'active' | 'inactive' | 'banned'
type UserTier = 'free' | 'pro' | 'verified_plus' | 'enterprise'

interface AdminUser {
  id: string; name: string; email: string; company: string; city: string
  role: string; tier: UserTier; status: UserStatus; verified: boolean
  mandates: number; joinedAt: string; lastSeen: string
}

const MOCK_USERS: AdminUser[] = [
  { id: 'u1', name: 'Arjun Mehta',    email: 'arjun@skyline.com',    company: 'Skyline Realty',     city: 'Mumbai',    role: 'broker',        tier: 'verified_plus', status: 'active',   verified: true,  mandates: 34, joinedAt: '15 Jan 2022', lastSeen: '2 min ago' },
  { id: 'u2', name: 'Priya Nair',     email: 'priya@primehomes.in',  company: 'Prime Homes',        city: 'Mumbai',    role: 'broker',        tier: 'pro',           status: 'active',   verified: true,  mandates: 28, joinedAt: '01 Feb 2022', lastSeen: '1 hr ago' },
  { id: 'u3', name: 'Rahul Sharma',   email: 'rahul@capitalp.com',   company: 'Capital Properties', city: 'Delhi NCR', role: 'company_admin', tier: 'pro',           status: 'active',   verified: true,  mandates: 19, joinedAt: '10 Mar 2022', lastSeen: '3 hr ago' },
  { id: 'u4', name: 'Sneha Joshi',    email: 'sneha@realtypulse.com',company: 'Realty Pulse',       city: 'Pune',      role: 'broker',        tier: 'free',          status: 'active',   verified: false, mandates: 7,  joinedAt: '22 Apr 2022', lastSeen: 'Yesterday' },
  { id: 'u5', name: 'Vikram Rao',     email: 'vikram@bricksb.com',   company: 'Bricks Beyond',      city: 'Pune',      role: 'broker',        tier: 'pro',           status: 'inactive', verified: true,  mandates: 12, joinedAt: '05 May 2022', lastSeen: '3 days ago' },
  { id: 'u6', name: 'Kiran Patel',    email: 'kiran@specr.com',      company: 'Spectrum Realty',    city: 'Ahmedabad', role: 'broker',        tier: 'free',          status: 'banned',   verified: false, mandates: 2,  joinedAt: '18 Jun 2022', lastSeen: '1 week ago' },
  { id: 'u7', name: 'Anita Desai',    email: 'anita@jllindia.com',   company: 'JLL India',          city: 'Mumbai',    role: 'director',      tier: 'enterprise',    status: 'active',   verified: true,  mandates: 55, joinedAt: '03 Jul 2022', lastSeen: 'Just now' },
  { id: 'u8', name: 'Deepak Verma',   email: 'deepak@sunrealty.com', company: 'Sun Realty',         city: 'Surat',     role: 'broker',        tier: 'free',          status: 'active',   verified: false, mandates: 4,  joinedAt: '11 Aug 2022', lastSeen: '2 hr ago' },
]

const STATUS_STYLE: Record<UserStatus, string> = {
  active:   'bg-success/10 text-success border-success/20',
  inactive: 'bg-surface-2 text-text-muted border-border',
  banned:   'bg-error/10 text-error border-error/20',
}

const TIER_STYLE: Record<UserTier, string> = {
  free:          'text-text-muted bg-surface-2 border-border',
  pro:           'text-info bg-info/10 border-info/20',
  verified_plus: 'text-brand-gold bg-brand-gold/10 border-brand-gold/20',
  enterprise:    'text-warning bg-warning/10 border-warning/20',
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<UserStatus | 'all'>('all')
  const [users, setUsers] = useState<AdminUser[]>(MOCK_USERS)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [roleMenuId, setRoleMenuId] = useState<string | null>(null)

  const ROLES: { value: string; label: string }[] = [
    { value: 'broker',        label: 'Broker' },
    { value: 'employee',      label: 'Employee' },
    { value: 'director',      label: 'Director' },
    { value: 'company_admin', label: 'Company Admin' },
    { value: 'viewer',        label: 'Viewer' },
    { value: 'super_admin',   label: 'Super Admin' },
  ]

  const setRole = (id: string, role: string) => {
    setUsers((p) => p.map((u) => u.id === id ? { ...u, role } : u))
    setRoleMenuId(null)
    setOpenMenu(null)
  }

  const filtered = users.filter((u) => {
    const q = search.toLowerCase()
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.company.toLowerCase().includes(q)
    const matchStatus = filterStatus === 'all' || u.status === filterStatus
    return matchSearch && matchStatus
  })

  const setStatus = (id: string, status: UserStatus) => {
    setUsers((p) => p.map((u) => u.id === id ? { ...u, status } : u))
    setOpenMenu(null)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Users</h1>
          <p className="text-sm text-text-muted mt-0.5">{users.length} total users on the platform</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, company…"
            className="w-full h-9 pl-8 pr-3 rounded-lg bg-surface-2 border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-gold/40"
          />
        </div>
        <div className="flex items-center gap-1">
          <Filter className="h-3.5 w-3.5 text-text-muted" />
          {(['all', 'active', 'inactive', 'banned'] as const).map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors',
                filterStatus === s ? 'bg-brand-gold/10 text-brand-gold' : 'text-text-muted hover:text-text-secondary hover:bg-surface-2')}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-text-muted font-medium">
                <th className="text-left px-4 py-3">User</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Company</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">Role</th>
                <th className="text-left px-4 py-3">Tier</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">Mandates</th>
                <th className="text-left px-4 py-3 hidden xl:table-cell">Last seen</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-surface-1 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-surface-2 border border-border flex items-center justify-center text-xs font-bold text-text-secondary shrink-0">
                        {u.name[0]}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="text-sm font-medium text-text-primary truncate">{u.name}</p>
                          {u.verified && <CheckCircle2 className="h-3 w-3 text-brand-gold shrink-0" />}
                        </div>
                        <p className="text-xs text-text-muted truncate">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="text-sm text-text-secondary truncate">{u.company}</p>
                    <p className="text-xs text-text-muted">{u.city}</p>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-xs text-text-muted capitalize">{u.role.replace('_', ' ')}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full border capitalize', TIER_STYLE[u.tier])}>
                      {u.tier.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full border capitalize', STATUS_STYLE[u.status])}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-sm text-text-secondary">{u.mandates}</td>
                  <td className="px-4 py-3 hidden xl:table-cell text-xs text-text-muted">{u.lastSeen}</td>
                  <td className="px-4 py-3 relative">
                    <button onClick={() => setOpenMenu(openMenu === u.id ? null : u.id)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-text-secondary hover:bg-surface-2 transition-colors">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    {openMenu === u.id && (
                      <div className="absolute right-4 top-10 z-20 bg-surface-0 border border-border rounded-xl shadow-xl py-1 min-w-36">
                        {u.status !== 'active' && (
                          <button onClick={() => setStatus(u.id, 'active')}
                            className="w-full text-left px-3 py-2 text-xs text-success hover:bg-surface-1 transition-colors">
                            ✓ Activate
                          </button>
                        )}
                        {u.status !== 'inactive' && (
                          <button onClick={() => setStatus(u.id, 'inactive')}
                            className="w-full text-left px-3 py-2 text-xs text-text-muted hover:bg-surface-1 transition-colors">
                            Deactivate
                          </button>
                        )}
                        {u.status !== 'banned' && (
                          <button onClick={() => setStatus(u.id, 'banned')}
                            className="w-full text-left px-3 py-2 text-xs text-error hover:bg-surface-1 transition-colors">
                            Ban user
                          </button>
                        )}
                        <div className="border-t border-border my-1" />
                        {roleMenuId === u.id ? (
                          <div>
                            <p className="px-3 py-1.5 text-xs font-semibold text-text-muted uppercase tracking-wider">Select role</p>
                            {ROLES.map((r) => (
                              <button key={r.value} onClick={() => setRole(u.id, r.value)}
                                className={cn('w-full text-left px-3 py-2 text-xs hover:bg-surface-1 transition-colors flex items-center justify-between',
                                  u.role === r.value ? 'text-brand-gold font-semibold' : 'text-text-secondary')}>
                                {r.label}
                                {u.role === r.value && <span className="text-brand-gold">✓</span>}
                              </button>
                            ))}
                            <button onClick={() => setRoleMenuId(null)}
                              className="w-full text-left px-3 py-2 text-xs text-text-muted hover:bg-surface-1 transition-colors">
                              ← Back
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setRoleMenuId(u.id)}
                            className="w-full text-left px-3 py-2 text-xs text-brand-gold hover:bg-surface-1 transition-colors flex items-center gap-1.5">
                            <Shield className="h-3 w-3" /> Change role
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-text-muted text-sm">No users match your search.</div>
          )}
        </div>
      </Card>
    </div>
  )
}
