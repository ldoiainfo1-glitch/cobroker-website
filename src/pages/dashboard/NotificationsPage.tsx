import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bell, CheckCheck, Building2, GitBranch, MessageSquare,
  UserPlus, Shield, CreditCard, AlertCircle, Users, ChevronRight,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn, timeAgo } from '@/lib/utils'
import type { NotificationType } from '@/types'
import { useNotifications, useMarkRead, useMarkAllRead } from '@/hooks/useNotifications'
import { Spinner } from '@/components/ui/spinner'

// ─── Notification icon/color per type ────────────────────────────────────────
const typeConfig: Record<NotificationType, { icon: React.ReactNode; bg: string; color: string }> = {
  new_mandate:       { icon: <Building2 className="h-4 w-4" />,    bg: 'bg-brand-gold/10', color: 'text-brand-gold' },
  new_introduction:  { icon: <Users className="h-4 w-4" />,         bg: 'bg-info/10',       color: 'text-info' },
  intro_accepted:    { icon: <UserPlus className="h-4 w-4" />,      bg: 'bg-success/10',    color: 'text-success' },
  intro_rejected:    { icon: <AlertCircle className="h-4 w-4" />,   bg: 'bg-error/10',      color: 'text-error' },
  new_message:       { icon: <MessageSquare className="h-4 w-4" />, bg: 'bg-info/10',       color: 'text-info' },
  deal_stage_update: { icon: <GitBranch className="h-4 w-4" />,     bg: 'bg-warning/10',    color: 'text-warning' },
  verification_update:{ icon: <Shield className="h-4 w-4" />,       bg: 'bg-success/10',    color: 'text-success' },
  payment_success:   { icon: <CreditCard className="h-4 w-4" />,    bg: 'bg-success/10',    color: 'text-success' },
  mandate_expiring:  { icon: <AlertCircle className="h-4 w-4" />,   bg: 'bg-warning/10',    color: 'text-warning' },
  new_follower:      { icon: <UserPlus className="h-4 w-4" />,      bg: 'bg-brand-gold/10', color: 'text-brand-gold' },
  system:            { icon: <Bell className="h-4 w-4" />,          bg: 'bg-surface-3',     color: 'text-text-muted' },
}

export default function NotificationsPage() {
  const [tab, setTab] = useState<'all' | 'unread'>('all')

  const { data: notifications = [], isLoading } = useNotifications()
  const { mutate: markReadMutation } = useMarkRead()
  const { mutate: markAllReadMutation } = useMarkAllRead()

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const markAllRead = () => markAllReadMutation()
  const markRead = (id: string) => markReadMutation(id)

  const filtered = notifications.filter((n) => tab === 'all' || !n.isRead)

  if (isLoading) return <div className="flex justify-center py-20"><Spinner /></div>

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Bell className="h-5 w-5 text-brand-gold" />
            Notifications
            {unreadCount > 0 && (
              <span className="min-w-5 h-5 px-1.5 bg-brand-gold text-black text-xs font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-sm text-text-muted mt-0.5">Stay on top of your co-broking activity</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <CheckCheck className="h-3.5 w-3.5" /> Mark all read
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {([['all', 'All'], ['unread', `Unread (${unreadCount})`]] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium transition-all',
              tab === id ? 'bg-brand-gold text-black' : 'bg-surface-2 text-text-muted hover:text-text-secondary border border-border',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Bell className="h-12 w-12 mx-auto text-text-muted opacity-40 mb-3" />
          <p className="text-sm text-text-muted">You're all caught up!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((n) => {
            const cfg = typeConfig[n.type] ?? typeConfig.system
            return (
              <Card
                key={n.id}
                className={cn(
                  'transition-all cursor-pointer hover:border-brand-gold/20',
                  !n.isRead && 'border-brand-gold/20 bg-brand-gold/5',
                )}
                onClick={() => markRead(n.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5', cfg.bg)}>
                      <span className={cfg.color}>{cfg.icon}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-0.5">
                        <p className={cn('text-sm font-semibold', n.isRead ? 'text-text-secondary' : 'text-text-primary')}>
                          {n.title}
                        </p>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-text-muted">{timeAgo(n.createdAt)}</span>
                          {!n.isRead && <span className="w-2 h-2 rounded-full bg-brand-gold shrink-0" />}
                        </div>
                      </div>
                      <p className="text-sm text-text-muted leading-relaxed">{n.body}</p>
                      {n.actionUrl && (
                        <Link
                          to={n.actionUrl}
                          className="inline-flex items-center gap-1 mt-2 text-xs text-brand-gold hover:text-brand-gold-light font-medium"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View details <ChevronRight className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

