export default function DevicesLoading() {
  return (
    <main className="camui-content">
      <div className="animate-pulse space-y-6">
        <div className="space-y-2">
          <div className="h-6 w-52 rounded bg-[var(--color-surface-offset)]" />
          <div className="h-4 w-36 rounded bg-[var(--color-surface-offset)]" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-0 overflow-hidden">
              <div className="h-44 bg-[var(--color-surface-offset)]" />
              <div className="p-4 space-y-3">
                <div className="h-4 w-40 rounded bg-[var(--color-surface-offset)]" />
                <div className="h-3 w-28 rounded bg-[var(--color-surface-offset)]" />
                <div className="flex gap-2">
                  <div className="h-5 w-16 rounded-full bg-[var(--color-surface-offset)]" />
                  <div className="h-5 w-12 rounded-full bg-[var(--color-surface-offset)]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
