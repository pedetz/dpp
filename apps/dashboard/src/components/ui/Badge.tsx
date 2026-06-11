import { cn } from '@/lib/utils'

type BadgeVariant =
  | 'draft'
  | 'published'
  | 'archived'
  | 'trial'
  | 'starter'
  | 'pro'
  | 'filiera'

interface BadgeProps {
  variant: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  draft: 'bg-gray-100 text-gray-700',
  published: 'bg-green-100 text-green-800',
  archived: 'bg-yellow-100 text-yellow-800',
  trial: 'bg-blue-100 text-blue-800',
  starter: 'bg-blue-100 text-blue-800',
  pro: 'bg-blue-100 text-blue-800',
  filiera: 'bg-blue-100 text-blue-800',
}

export function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
