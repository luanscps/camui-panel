import * as React from 'react'
import { cn } from '@/lib/utils'

export interface SelectNativeProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
}

const SelectNative = React.forwardRef<HTMLSelectElement, SelectNativeProps>(
  ({ className, children, label, ...props }, ref) => (
    <select
      className={cn(
        'flex w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)]',
        'px-3 py-1.5 text-[0.8125rem] text-[var(--color-text)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-1',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'transition-colors appearance-none cursor-pointer',
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </select>
  )
)
SelectNative.displayName = 'SelectNative'

export { SelectNative }
