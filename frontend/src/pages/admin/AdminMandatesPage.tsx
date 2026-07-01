import { useState } from 'react'
import { Search, AlertTriangle, CheckCircle2, EyeOff, MoreVertical, MapPin } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type MandateStatus = 'active' | 'reported' | 'removed' | 'expired'
type MandateType = 'buy' | 'sell' | 'rent' | 'lease'

interface AdminMandate {
  id: string; title: string; type: MandateType; assetType: string
  postedBy: string; company: string; city: string
  budget: string; status: MandateStatus; views: number
  postedAt: string; reportCount: number; reportReason?: string
}

const MOCK_MANDATES: AdminMandate[] = [
  { id: 'm1', title: '3BHK in Bandra West, Mumbai',     type: 'buy',   assetType: 'Residential', postedBy: 'Arjun Mehta',  company: 'Skyline Realty',     city: 'Mumbai',    budget: '₹2.5–3.5 Cr', status: 'active',   views: 284, postedAt: '3 days ago',  reportCount: 0 },
  { id: 'm2', title: 'Commercial plot near highway',      type: 'sell',  assetType: 'Land',        postedBy: 'Priya Nair',   company: 'Prime Homes',        city: 'Pune',      budget: '₹8–12 Cr',    status: 'reported',  views: 56,  postedAt: '5 days ago',  reportCount: 2, reportReason: 'Incorrect information' },
  { id: 'm3', title: 'Warehouse in Bhiwandi',             type: 'lease', assetType: 'Industrial',  postedBy: 'Raj Kumar',    company: 'Metro Estates',      city: 'Mumbai',    budget: '₹18/sqft',    status: 'reported',  views: 34,  postedAt: '1 week ago',  reportCount: 3, reportReason: 'Spam / fake listing' },
  { id: 'm4', title: 'Grade-A office space in BKC',       type: 'rent',  assetType: 'Commercial',  postedBy: 'Vikram Rao',   company: 'JLL India',          city: 'Mumbai',    budget: '₹95/sqft',    status: 'active',   views: 512, postedAt: '2 days ago',  reportCount: 0 },
  { id: 'm5', title: 'Sea-facing penthouse in Worli',     type: 'sell',  assetType: 'Residential', postedBy: 'Anita Desai',  company: 'JLL India',          city: 'Mumbai',    budget: '₹28 Cr',      status: 'active',   views: 890, postedAt: '1 day ago',   reportCount: 1, reportReason: 'Price seems incorrect' },
  { id: 'm6', title: '2BHK rental, Koramangala',          type: 'rent',  assetType: 'Residential', postedBy: 'Deepak Verma', company: 'Sun Realty',         city: 'Bengaluru', budget: '₹28k/mo',     status: 'removed',  views: 12,  postedAt: '2 weeks ago', reportCount: 4, reportReason: 'Duplicate listing' },
  { id: 'm7', title: 'Logistics park, NH48',              type: 'lease', assetType: 'Industrial',  postedBy: 'Kiran Patel',  company: 'Spectrum Realty',    city: 'Gurgaon',   budget: '₹12/sqft',    status: 'expired',  views: 78,  postedAt: '1 month ago', reportCount: 0 },
]

const TYPE_STYLE: Record<MandateType, string> = {
  buy:   'bg-info/10 text-info border-info/20',
  sell:  'bg-success/10 text-success border-success/20',
  rent:  'bg-warning/10 text-warning border-warning/20',
  lease: 'bg-brand-gold/10 text-brand-gold border-brand-gold/20',
}

const STATUS_CONFIG: Record<MandateStatus, { label: string; style: string }> = {
  active:   { label: 'Active',   style: 'bg-success/10 text-success border-success/20' },
  reported: { label: 'Reported', style: 'bg-error/10 text-error border-error/20' },
  removed:  { label: 'Removed',  style: 'bg-surface-2 text-text-muted border-border' },
  expired:  { label: 'Expired',  style: 'bg-surface-2 text-text-muted border-border' },
}

export default function AdminMandatesPage() {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<MandateStatus | 'all'>('all')
  const [mandates, setMandates] = useState<AdminMandate[]>(MOCK_MANDATES)
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const filtered = mandates.filter((m) => {
    const q = search.toLowerCase()
    const matchSearch = !q || m.title.toLowerCase().includes(q) || m.postedBy.toLowerCase().includes(q) || m.city.toLowerCase().includes(q)
    const matchStatus = filterStatus === 'all' || m.status === filterStatus
    return matchSearch && matchStatus
  })

  const setStatus = (id: string, status: MandateStatus) => {
    setMandates((p) => p.map((m) => m.id === id ? { ...m, status } : m))
    setOpenMenu(null)
  }

  const reported = mandates.filter((m) => m.status === 'reported').length

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Mandates</h1>
          <p className="text-sm text-text-muted mt-0.5">
            {mandates.length} total · {reported > 0 && <span className="text-error font-medium">{reported} reported</span>}
          </p>
        </div>
      </div>

      {/* Reported alert */}
      {reported > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-error/10 border border-error/20 mb-5">
          <AlertTriangle className="h-4 w-4 text-error shrink-0" />
          <p className="text-sm text-error font-medium">{reported} mandate{reported > 1 ? 's' : ''} flagged for review. Please action them promptly.</p>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title, broker, city…"
            className="w-full h-9 pl-8 pr-3 rounded-lg bg-surface-2 border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-gold/40" />
        </div>
        <div className="flex items-center gap-1">
          {(['all', 'active', 'reported', 'removed', 'expired'] as const).map((s) => (
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
                <th className="text-left px-4 py-3">Mandate</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Posted by</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">Budget</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">Views</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3 hidden xl:table-cell">Report reason</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((m) => {
                const cfg = STATUS_CONFIG[m.status]
                return (
                  <tr key={m.id} className={cn('hover:bg-surface-1 transition-colors', m.status === 'reported' && 'bg-error/5')}>
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <span className={cn('text-xs font-bold uppercase px-2 py-0.5 rounded-full border', TYPE_STYLE[m.type])}>
                              {m.type}
                            </span>
                            <span className="text-xs text-text-muted">{m.assetType}</span>
                          </div>
                          <p className="text-sm font-medium text-text-primary">{m.title}</p>
                          <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3" /> {m.city} · {m.postedAt}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-sm text-text-secondary">{m.postedBy}</p>
                      <p className="text-xs text-text-muted">{m.company}</p>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-sm font-medium text-brand-gold">{m.budget}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-sm text-text-secondary">{m.views}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className={cn('inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border w-fit', cfg.style)}>
                          {cfg.label}
                        </span>
                        {m.reportCount > 0 && (
                          <span className="text-xs text-error">{m.reportCount} report{m.reportCount > 1 ? 's' : ''}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell">
                      {m.reportReason
                        ? <span className="text-xs text-error">{m.reportReason}</span>
                        : <span className="text-xs text-text-muted">—</span>}
                    </td>
                    <td className="px-4 py-3 relative">
                      <button onClick={() => setOpenMenu(openMenu === m.id ? null : m.id)}
                        className="p-1.5 rounded-lg text-text-muted hover:text-text-secondary hover:bg-surface-2 transition-colors">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {openMenu === m.id && (
                        <div className="absolute right-4 top-10 z-20 bg-surface-0 border border-border rounded-xl shadow-xl py-1 min-w-36">
                          {m.status !== 'active' && (
                            <button onClick={() => setStatus(m.id, 'active')}
                              className="w-full text-left px-3 py-2 text-xs text-success hover:bg-surface-1 transition-colors flex items-center gap-1.5">
                              <CheckCircle2 className="h-3 w-3" /> Restore
                            </button>
                          )}
                          {m.status !== 'removed' && (
                            <button onClick={() => setStatus(m.id, 'removed')}
                              className="w-full text-left px-3 py-2 text-xs text-error hover:bg-surface-1 transition-colors flex items-center gap-1.5">
                              <EyeOff className="h-3 w-3" /> Remove listing
                            </button>
                          )}
                          {m.status === 'reported' && (
                            <button onClick={() => setStatus(m.id, 'active')}
                              className="w-full text-left px-3 py-2 text-xs text-text-muted hover:bg-surface-1 transition-colors">
                              Dismiss report
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-text-muted text-sm">No mandates match your filter.</div>
          )}
        </div>
      </Card>
    </div>
  )
}
