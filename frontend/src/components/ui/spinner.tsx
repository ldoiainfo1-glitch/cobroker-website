import { cn } from '@/lib/utils'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' }
  return (
    <svg
      className={cn('animate-spin text-brand-gold', sizes[size], className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-label="Loading"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

export function FullPageSpinner() {
  return (
    <div className="fixed inset-0 bg-surface-0 flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="text-2xl font-bold text-brand-gold tracking-widest">⬡ Co-Brokings</div>
        <Spinner size="lg" />
      </div>
    </div>
  )
}

