import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const alertVariants = cva(
  'relative w-full rounded-lg border p-3.5 text-sm [&>svg]:absolute [&>svg]:left-3.5 [&>svg]:top-3.5 [&>svg+div]:pl-7',
  {
    variants: {
      variant: {
        default:     'border-[var(--color-border)] bg-[var(--color-surface-offset)] text-[var(--color-text)]',
        destructive: 'border-[rgba(161,44,123,0.3)] bg-[var(--color-error-bg)] text-[var(--color-error)]',
        warning:     'border-[rgba(150,66,25,0.3)] bg-[var(--color-warning-bg)] text-[var(--color-warning)]',
        success:     'border-[rgba(67,122,34,0.3)] bg-[var(--color-success-bg)] text-[var(--color-success)]',
        info:        'border-[rgba(0,100,148,0.3)] bg-[var(--color-info-bg)] text-[var(--color-info)]',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
))
Alert.displayName = 'Alert'

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5 ref={ref} className={cn('font-semibold leading-none tracking-tight mb-1', className)} {...props} />
  )
)
AlertTitle.displayName = 'AlertTitle'

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('text-sm [&_p]:leading-relaxed', className)} {...props} />
  )
)
AlertDescription.displayName = 'AlertDescription'

export { Alert, AlertTitle, AlertDescription }
