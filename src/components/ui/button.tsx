import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        default:     'bg-[var(--color-brand)] text-white shadow-sm hover:bg-[var(--color-brand-hover)] focus-visible:ring-[var(--color-brand)]',
        secondary:   'border border-[var(--color-brand)] text-[var(--color-brand)] bg-transparent hover:bg-[rgba(1,105,111,0.06)] focus-visible:ring-[var(--color-brand)]',
        ghost:       'bg-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-surface-offset)] hover:text-[var(--color-text)] focus-visible:ring-[var(--color-brand)]',
        destructive: 'border border-[rgba(161,44,123,0.3)] text-[#a12c7b] bg-transparent hover:bg-[rgba(161,44,123,0.06)] focus-visible:ring-[#a12c7b]',
        outline:     'border border-[var(--color-border)] bg-transparent text-[var(--color-text)] hover:bg-[var(--color-surface-offset)] focus-visible:ring-[var(--color-brand)]',
        link:        'text-[var(--color-brand)] underline-offset-4 hover:underline bg-transparent',
      },
      size: {
        default: 'px-4 py-2',
        sm:      'px-3 py-1.5 text-xs rounded-md',
        xs:      'px-2 py-1 text-xs rounded',
        lg:      'px-6 py-2.5 text-base rounded-lg',
        icon:    'size-8',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
