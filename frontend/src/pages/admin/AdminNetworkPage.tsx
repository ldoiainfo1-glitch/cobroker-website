import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  GitBranch, ChevronRight, ChevronDown,
  Phone, Mail, Building2, Calendar, Users, Search,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getInitials, cn } from '@/lib/utils'
import { Spinner } from '@/components/ui/spinner'

// ─── Types ────────────────────────────────────────────────────────────────────

interface NetworkProfile {
  id: string
  full_name: string
  email: string
  phone: string | null
  avatar_url: string | null
  created_at: string
  company: { name: string; city: string } | null
}

// ─── Data fetcher ─────────────────────────────────────────────────────────────

async function fetchReferrals(userId: string): Promise<NetworkProfile[]> {
  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, email, phone, avatar_url, created_at, company:companies!company_id(name, city)')
    .eq('introducer_id', userId)
    .order('created_at', { ascending: false })
  return (data as unknown as NetworkProfile[]) ?? []
}

// ─── Tree node (shared between root and child levels) ────────────────────────

function AdminTreeNode({ node, depth = 0 }: { node: NetworkProfile; depth?: number }) {
  const [expanded, setExpanded] = useState(false)
  const [children, setChildren] = useState<NetworkProfile[]>([])
  const [loaded, setLoaded] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    if (!loaded) {
      setLoading(true)
      const kids = await fetchReferrals(node.id)
      setChildren(kids)
      setLoaded(true)
      setLoading(false)
    }
    setExpanded((v) => !v)
  }

  const joinDate = new Date(node.created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <div className="relative">
      {/* Node card */}
      <div
        className={cn(
          'flex items-start gap-3 p-3.5 border rounded-xl mb-2 transition-colors hover:border-brand-gold/30',
          depth === 0
            ? 'bg-surface-1 border-border'
            : 'bg-surface-0 border-border/60',
        )}
      >
        {/* Avatar — opens broker profile in new tab */}
        <Link
          to={`/dashboard/brokers/${node.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-9 h-9 rounded-full bg-brand-gold/20 border border-brand-gold/30 flex items-center justify-center text-xs font-semibold text-brand-gold shrink-0 hover:bg-brand-gold/30 transition-colors overflow-hidden"
        >
          {node.avatar_url ? (
            <img
              src={node.avatar_url}
              alt={node.full_name}
              className="w-full h-full object-cover"
            />
          ) : (
            getInitials(node.full_name)
          )}
        </Link>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to={`/dashboard/brokers/${node.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-text-primary hover:text-brand-gold transition-colors truncate"
            >
              {node.full_name}
            </Link>
            {depth === 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-brand-gold/10 text-brand-gold border border-brand-gold/20 shrink-0 uppercase tracking-wide">
                Introducer
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
            {node.phone && (
              <span className="flex items-center gap-1 text-xs text-text-muted">
                <Phone className="h-3 w-3 shrink-0" />
                {node.phone}
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-text-muted">
              <Mail className="h-3 w-3 shrink-0" />
              {node.email}
            </span>
            {node.company && (
              <span className="flex items-center gap-1 text-xs text-text-muted">
                <Building2 className="h-3 w-3 shrink-0" />
                {node.company.name}, {node.company.city}
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-text-muted">
              <Calendar className="h-3 w-3 shrink-0" />
              Joined {joinDate}
            </span>
          </div>
        </div>

        {/* Expand button */}
        <button
          onClick={handleToggle}
          title={expanded ? 'Collapse' : 'View referrals'}
          className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors shrink-0 mt-0.5"
        >
          {loading ? (
            <Spinner size="sm" />
          ) : expanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Children */}
      {expanded && (
        <div className="ml-5 pl-4 border-l border-brand-gold/20 mb-2">
          {children.map((child) => (
            <AdminTreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
          {loaded && children.length === 0 && (
            <p className="text-xs text-text-muted py-2 pl-1">
              No further referrals from {node.full_name}.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminNetworkPage() {
  const [roots, setRoots] = useState<NetworkProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [totalIntroducers, setTotalIntroducers] = useState(0)
  const [totalReferrals, setTotalReferrals] = useState(0)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function load() {
      // Step 1: find all unique introducer IDs across the platform
      const { data: refs } = await supabase
        .from('profiles')
        .select('introducer_id')
        .not('introducer_id', 'is', null)

      if (!refs || refs.length === 0) {
        setLoading(false)
        return
      }

      setTotalReferrals(refs.length)
      const allIntroducerIdSet = new Set(refs.map((r) => r.introducer_id as string))
      setTotalIntroducers(allIntroducerIdSet.size)

      // Step 2: fetch all profiles that have NO introducer themselves
      // (true tree roots — prevents duplication)
      const { data: candidateProfiles } = await supabase
        .from('profiles')
        .select(
          'id, full_name, email, phone, avatar_url, created_at, company:companies!company_id(name, city)',
        )
        .is('introducer_id', null)
        .order('full_name')

      // Step 3: keep only those who are also introducers for someone
      const rootIntroducers = (
        (candidateProfiles as unknown as NetworkProfile[]) ?? []
      ).filter((p) => allIntroducerIdSet.has(p.id))

      setRoots(rootIntroducers)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = roots.filter(
    (r) =>
      search === '' ||
      r.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (r.phone ?? '').includes(search) ||
      r.email.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-text-primary flex items-center gap-2.5">
          <GitBranch className="h-5 w-5 text-brand-gold" />
          Referral Network
        </h1>
        <p className="text-text-muted text-sm mt-1">
          Full referral tree across the entire platform — who introduced whom
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-surface-1 border border-border rounded-xl px-4 py-3 flex items-center gap-3">
          <Users className="h-5 w-5 text-brand-gold shrink-0" />
          <div>
            <p className="text-2xl font-bold text-text-primary">{totalIntroducers}</p>
            <p className="text-xs text-text-muted">Active introducers</p>
          </div>
        </div>
        <div className="bg-surface-1 border border-border rounded-xl px-4 py-3 flex items-center gap-3">
          <GitBranch className="h-5 w-5 text-success shrink-0" />
          <div>
            <p className="text-2xl font-bold text-text-primary">{totalReferrals}</p>
            <p className="text-xs text-text-muted">Total referrals made</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
        <input
          type="text"
          placeholder="Search introducer by name, phone or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-9 pr-4 rounded-lg bg-surface-1 border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-gold/50 transition-colors"
        />
      </div>

      {/* Tree content */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Spinner size="lg" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-14 h-14 rounded-2xl bg-surface-1 border border-border flex items-center justify-center mb-4">
            <GitBranch className="h-7 w-7 text-text-muted" />
          </div>
          <p className="text-text-primary font-semibold">
            {search ? 'No match found' : 'No referral trees yet'}
          </p>
          <p className="text-text-muted text-sm mt-1">
            {search
              ? 'Try a different name or phone number'
              : 'Trees appear here once users start introducing others during registration'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((root) => (
            <div
              key={root.id}
              className="bg-surface-0 border border-border rounded-2xl p-4"
            >
              <AdminTreeNode node={root} depth={0} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
