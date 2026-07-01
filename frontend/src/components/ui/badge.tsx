import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-surface-2 text-text-secondary border border-border',
        secondary: 'bg-surface-2 text-text-secondary border border-border',
        outline: 'bg-transparent text-text-secondary border border-border',
        gold: 'bg-brand-gold/10 text-brand-gold border border-brand-gold/30',
        success: 'bg-success/10 text-success border border-success/30',
        warning: 'bg-warning/10 text-warning border border-warning/30',
        error: 'bg-error/10 text-error border border-error/30',
        info: 'bg-info/10 text-info border border-info/30',
        verified: 'bg-success/10 text-success border border-success/30',
        pending: 'bg-warning/10 text-warning border border-warning/30',
        rejected: 'bg-error/10 text-error border border-error/30',
        buy: 'bg-info/10 text-info border border-info/30',
        sell: 'bg-success/10 text-success border border-success/30',
        lease: 'bg-brand-gold/10 text-brand-gold border border-brand-gold/30',
        joint_venture: 'bg-purple-500/10 text-purple-400 border border-purple-500/30',
        investment: 'bg-orange-500/10 text-orange-400 border border-orange-500/30',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
}

function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            variant === 'success' || variant === 'verified' ? 'bg-success' :
            variant === 'warning' || variant === 'pending' ? 'bg-warning' :
            variant === 'error' || variant === 'rejected' ? 'bg-error' :
            variant === 'gold' ? 'bg-brand-gold' : 'bg-current',
          )}
        />
      )}
      {children}
    </span>
  )
}

export { Badge, badgeVariants }

