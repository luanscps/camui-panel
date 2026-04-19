export default function AdminUsersLoading() {
  return (
    <main className="camui-content">
      <div className="animate-pulse space-y-5">
        <div className="h-6 w-44 rounded bg-[var(--color-surface-offset)]" />
        <div className="card p-0 overflow-hidden">
          <div className="h-10 bg-[var(--color-surface-offset)]" />
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex gap-4 px-4 py-3 border-b border-[var(--color-border)]">
              <div className="h-4 w-48 rounded bg-[var(--color-surface-offset)]" />
              <div className="h-4 w-16 rounded bg-[var(--color-surface-offset)]" />
              <div className="h-4 w-20 rounded bg-[var(--color-surface-offset)]" />
              <div className="h-4 w-24 rounded bg-[var(--color-surface-offset)]" />
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
