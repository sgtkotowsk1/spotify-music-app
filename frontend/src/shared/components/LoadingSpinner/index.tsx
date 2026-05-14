import { clsx } from 'clsx'

interface Props {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' }

export function LoadingSpinner({ size = 'md', className }: Props) {
  return (
    <div
      role="status"
      className={clsx(
        'animate-spin rounded-full border-2 border-white/20 border-t-brand-500',
        sizes[size],
        className
      )}
    />
  )
}

export function PageLoader() {
  return (
    <div className="flex h-full min-h-[400px] items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl bg-surface-50 p-4 space-y-3">
      <div className="skeleton h-40 w-full rounded-lg" />
      <div className="skeleton h-4 w-3/4 rounded" />
      <div className="skeleton h-3 w-1/2 rounded" />
    </div>
  )
}
