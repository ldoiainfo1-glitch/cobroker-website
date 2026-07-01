import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  GitBranch, ChevronRight, ChevronDown,
  Phone, Mail, Building2, Calendar, Users, MessageSquare,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
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

// ─── Tree node component ──────────────────────────────────────────────────────

function TreeNode({ node, depth = 0 }: { node: NetworkProfile; depth?: number }) {
  const navigate = useNavigate()
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
      <div className="flex items-start gap-3 p-3.5 bg-surface-1 border border-border rounded-xl mb-2 hover:border-brand-gold/30 transition-colors">
        {/* Avatar — links to broker profile */}
        <Link
          to={`/dashboard/brokers/${node.id}`}
          className="w-10 h-10 rounded-full bg-brand-gold/20 border border-brand-gold/30 flex items-center justify-center text-sm font-semibold text-brand-gold shrink-0 hover:bg-brand-gold/30 transition-colors overflow-hidden"
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

        {/* Details */}
        <div className="flex-1 min-w-0">
          <Link
            to={`/dashboard/brokers/${node.id}`}
            className="text-sm font-semibold text-text-primary hover:text-brand-gold transition-colors block truncate"
          >
            {node.full_name}
          </Link>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
            {node.phone && (
              <span className="flex items-center gap-1 text-xs text-text-muted">
                <Phone className="h-3 w-3 shrink-0" />
                {node.phone}
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-text-muted truncate max-w-xs">
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

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0 mt-0.5">
          <button
            onClick={() => navigate(`/dashboard/chat?with=${node.id}&name=${encodeURIComponent(node.full_name)}&initial=${getInitials(node.full_name)}&company=${encodeURIComponent(node.company?.name ?? '')}`)}
            title={`Message ${node.full_name}`}
            className="p-1.5 rounded-lg text-text-muted hover:text-brand-gold hover:bg-brand-gold/10 transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
          </button>
          <button
            onClick={handleToggle}
            title={expanded ? 'Collapse referrals' : 'View this member\'s referrals'}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
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
      </div>

      {/* Children */}
      {expanded && (
        <div className={cn('pl-4 border-l border-border mb-2', depth === 0 ? 'ml-5' : 'ml-5')}>
          {children.map((child) => (
            <TreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
          {loaded && children.length === 0 && (
            <p className="text-xs text-text-muted py-2 pl-1">
              No referrals from {node.full_name} yet.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NetworkPage() {
  const { user } = useAuthStore()
  const [roots, setRoots] = useState<NetworkProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    fetchReferrals(user.id).then((data) => {
      setRoots(data)
      setLoading(false)
    })
  }, [user])

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2.5">
            <GitBranch className="h-6 w-6 text-brand-gold" />
            My Network
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Members who registered on COBROKINGS using your referral
          </p>
        </div>

        {/* Referral count badge */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-surface-1 border border-border rounded-xl shrink-0">
          <Users className="h-4 w-4 text-brand-gold" />
          <span className="text-xl font-bold text-text-primary">{roots.length}</span>
          <span className="text-xs text-text-muted leading-tight">
            direct<br />referral{roots.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Hint banner */}
      <div className="bg-brand-gold/5 border border-brand-gold/20 rounded-xl px-4 py-3 mb-6 flex items-start gap-3">
        <Phone className="h-4 w-4 text-brand-gold mt-0.5 shrink-0" />
        <p className="text-sm text-text-secondary">
          Share your registered phone number
          {user?.phone && (
            <span className="font-semibold text-text-primary"> ({user.phone})</span>
          )}{' '}
          with others. When they sign up and enter your number as the <span className="font-medium text-text-primary">Introducer Phone</span>, they'll appear here automatically.
        </p>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Spinner size="lg" />
        </div>
      ) : roots.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-1 border border-border flex items-center justify-center mb-4">
            <GitBranch className="h-8 w-8 text-text-muted" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            No referrals yet
          </h3>
          <p className="text-text-muted text-sm max-w-sm">
            Share your phone number with other brokers. When they register and enter your number as their introducer, they'll appear here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col">
          {roots.map((node) => (
            <TreeNode key={node.id} node={node} />
          ))}
        </div>
      )}
    </div>
  )
}
