import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-wider transition-colors',
  {
    variants: {
      variant: {
        default:     'bg-[rgba(40,37,29,0.07)] text-[var(--color-text-muted)]',
        success:     'bg-[var(--color-success-bg)] text-[var(--color-success)]',
        warning:     'bg-[var(--color-warning-bg)] text-[var(--color-warning)]',
        destructive: 'bg-[var(--color-error-bg)] text-[var(--color-error)]',
        info:        'bg-[var(--color-info-bg)] text-[var(--color-info)]',
        brand:       'bg-[#f0fafb] text-[var(--color-brand)]',
        pro:         'bg-[#f0fdfb] text-[#0c4e54] border border-[var(--color-brand-highlight)]',
        basic:       'bg-[#eff6ff] text-[#1d4ed8]',
        outline:     'border border-[var(--color-border)] text-[var(--color-text-muted)] bg-transparent',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
