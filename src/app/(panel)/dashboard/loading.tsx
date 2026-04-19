export default function DashboardLoading() {
  return (
    <main className="camui-content">
      <div className="animate-pulse space-y-6">
        {/* Header skeleton */}
        <div className="space-y-2">
          <div className="h-6 w-48 rounded bg-[var(--color-surface-offset)]" />
          <div className="h-4 w-32 rounded bg-[var(--color-surface-offset)]" />
        </div>
        {/* Stat cards skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card h-24 bg-[var(--color-surface-offset)] border-0" />
          ))}
        </div>
        {/* Content skeleton */}
        <div className="card h-48 bg-[var(--color-surface-offset)] border-0" />
      </div>
    </main>
  )
}
