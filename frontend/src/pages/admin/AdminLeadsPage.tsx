import { useEffect, useState } from 'react'
import { Phone, Mail, Clock, RefreshCw, Search } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { timeAgo } from '@/lib/utils'

type LeadStatus = 'new' | 'contacted' | 'converted' | 'closed'

interface Lead {
  id: string
  mandate_id: string | null
  full_name: string
  email: string
  phone: string
  message: string | null
  status: LeadStatus
  created_at: string
  mandate?: { title: string } | null
}

const STATUS_STYLE: Record<LeadStatus, string> = {
  new:       'bg-info/10 text-info border-info/20',
  contacted: 'bg-warning/10 text-warning border-warning/20',
  converted: 'bg-success/10 text-success border-success/20',
  closed:    'bg-surface-2 text-text-muted border-border',
}

const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: 'new',       label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'converted', label: 'Converted' },
  { value: 'closed',    label: 'Closed' },
]

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<LeadStatus | 'all'>('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchLeads = async () => {
    setLoading(true)
    setError('')
    const { data, error: err } = await supabase
      .from('mandate_enquiries')
      .select('*, mandate:mandates(title)')
      .order('created_at', { ascending: false })

    if (err) {
      setError('Failed to load leads: ' + err.message)
    } else {
      setLeads((data ?? []) as Lead[])
    }
    setLoading(false)
  }

  useEffect(() => { fetchLeads() }, [])

  const updateStatus = async (id: string, status: LeadStatus) => {
    setUpdatingId(id)
    const { error: err } = await supabase
      .from('mandate_enquiries')
      .update({ status })
      .eq('id', id)

    if (!err) {
      setLeads((prev) => prev.map((l) => l.id === id ? { ...l, status } : l))
    }
    setUpdatingId(null)
  }

  const filtered = leads.filter((l) => {
    const q = search.toLowerCase()
    const matchSearch = !q || l.full_name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || l.phone.includes(q)
    const matchStatus = filterStatus === 'all' || l.status === filterStatus
    return matchSearch && matchStatus
  })

  const counts = {
    all: leads.length,
    new: leads.filter((l) => l.status === 'new').length,
    contacted: leads.filter((l) => l.status === 'contacted').length,
    converted: leads.filter((l) => l.status === 'converted').length,
    closed: leads.filter((l) => l.status === 'closed').length,
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Leads</h1>
          <p className="text-sm text-text-muted mt-0.5">{leads.length} total enquiries from public visitors</p>
        </div>
        <button
          onClick={fetchLeads}
          className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors"
        >
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-1 mb-5 overflow-x-auto pb-1">
        {(['all', 'new', 'contacted', 'converted', 'closed'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border',
              filterStatus === s
                ? 'bg-error/10 text-error border-error/20'
                : 'bg-surface-2 text-text-muted border-border hover:text-text-secondary',
            )}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
            <span className="ml-1.5 text-xs opacity-70">({counts[s]})</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
        <input
          type="text"
          placeholder="Search by name, email or phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface-1 border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-gold/50"
        />
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-error/10 border border-error/20 text-sm text-error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-48 text-text-muted text-sm">Loading leads…</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-center">
          <p className="text-text-muted text-sm">No leads found.</p>
          {leads.length === 0 && (
            <p className="text-xs text-text-muted mt-1">Leads will appear here when public visitors submit enquiries on mandate pages.</p>
          )}
        </div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-text-muted px-4 py-3">Contact</th>
                  <th className="text-left text-xs font-medium text-text-muted px-4 py-3">Mandate</th>
                  <th className="text-left text-xs font-medium text-text-muted px-4 py-3">Note</th>
                  <th className="text-left text-xs font-medium text-text-muted px-4 py-3">Received</th>
                  <th className="text-left text-xs font-medium text-text-muted px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead) => (
                  <tr key={lead.id} className="border-b border-border last:border-0 hover:bg-surface-1 transition-colors">
                    {/* Contact */}
                    <td className="px-4 py-3">
                      <p className="font-medium text-text-primary">{lead.full_name}</p>
                      <a href={`mailto:${lead.email}`} className="flex items-center gap-1 text-xs text-text-muted hover:text-brand-gold transition-colors mt-0.5">
                        <Mail className="h-3 w-3" />{lead.email}
                      </a>
                      <a href={`tel:+91${lead.phone}`} className="flex items-center gap-1 text-xs text-text-muted hover:text-brand-gold transition-colors mt-0.5">
                        <Phone className="h-3 w-3" />+91 {lead.phone}
                      </a>
                    </td>

                    {/* Mandate */}
                    <td className="px-4 py-3 max-w-xs">
                      {lead.mandate?.title ? (
                        <p className="text-xs text-text-secondary line-clamp-2">{lead.mandate.title}</p>
                      ) : (
                        <p className="text-xs text-text-muted italic">—</p>
                      )}
                    </td>

                    {/* Note */}
                    <td className="px-4 py-3 max-w-xs">
                      {lead.message ? (
                        <p className="text-xs text-text-secondary line-clamp-2">{lead.message}</p>
                      ) : (
                        <p className="text-xs text-text-muted italic">—</p>
                      )}
                    </td>

                    {/* Time */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="flex items-center gap-1 text-xs text-text-muted">
                        <Clock className="h-3 w-3" />{timeAgo(lead.created_at)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <select
                        value={lead.status}
                        disabled={updatingId === lead.id}
                        onChange={(e) => updateStatus(lead.id, e.target.value as LeadStatus)}
                        className={cn(
                          'text-xs font-medium px-2.5 py-1 rounded-lg border cursor-pointer focus:outline-none transition-colors',
                          STATUS_STYLE[lead.status],
                        )}
                      >
                        {STATUS_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
