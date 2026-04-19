'use client'

import { Toaster as SonnerToaster } from 'sonner'

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:       'group bg-[var(--color-surface)] border border-[var(--color-border)] shadow-lg rounded-lg text-[var(--color-text)] text-sm',
          title:       'font-semibold',
          description: 'text-[var(--color-text-muted)]',
          actionButton: 'bg-[var(--color-brand)] text-white text-xs font-medium rounded px-2 py-1',
          cancelButton: 'bg-[var(--color-surface-offset)] text-[var(--color-text-muted)] text-xs font-medium rounded px-2 py-1',
          error:       '!border-[rgba(161,44,123,0.3)] !text-[var(--color-error)]',
          success:     '!border-[rgba(67,122,34,0.3)] !text-[var(--color-success)]',
          warning:     '!border-[rgba(150,66,25,0.3)] !text-[var(--color-warning)]',
        },
      }}
    />
  )
}
