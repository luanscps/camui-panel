'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'

const inputStyle = {
  padding: '0.5rem 0.75rem',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  background: 'var(--color-surface)',
  color: 'var(--color-text)',
  fontSize: '0.875rem',
}

export type SortField = 'registered_at' | 'last_sign_in_at' | 'expires_at' | 'full_name' | 'plan' | 'license_status'
export type SortDir   = 'asc' | 'desc'

// Colunas clicáveis passadas ao header da tabela
export const SORTABLE_COLUMNS: { label: string; field: SortField }[] = [
  { label: 'Usuário',        field: 'full_name' },
  { label: 'Plano',          field: 'plan' },
  { label: 'Status',         field: 'license_status' },
  { label: 'Último acesso',  field: 'last_sign_in_at' },
  { label: 'Expira em',      field: 'expires_at' },
  { label: 'Cadastro',       field: 'registered_at' },
]

export default function UsersControls({
  total, page, pageSize, q, status, plan, sort, dir,
}: {
  total: number; page: number; pageSize: number
  q: string; status: string; plan: string
  sort: SortField; dir: SortDir
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const push = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString())
      Object.entries(updates).forEach(([k, v]) => {
        if (v) params.set(k, v)
        else params.delete(k)
      })
      if (!('page' in updates)) params.set('page', '1')
      startTransition(() => router.push(`${pathname}?${params.toString()}`))
    },
    [pathname, router, searchParams]
  )

  const handleSort = (field: SortField) => {
    if (field === sort) {
      push({ sort: field, dir: dir === 'asc' ? 'desc' : 'asc' })
    } else {
      push({ sort: field, dir: 'desc' })
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input type="text" placeholder="Buscar por nome ou email..."
            defaultValue={q} onChange={e => push({ q: e.target.value })}
            style={{ ...inputStyle, width: '100%', paddingLeft: '2.25rem' }} />
        </div>

        <select value={status} onChange={e => push({ status: e.target.value })} style={{ ...inputStyle, minWidth: 150 }}>
          <option value="">Todos os status</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="SUSPENDED">SUSPENDED</option>
          <option value="EXPIRED">EXPIRED</option>
        </select>

        <select value={plan} onChange={e => push({ plan: e.target.value })} style={{ ...inputStyle, minWidth: 130 }}>
          <option value="">Todos os planos</option>
          <option value="BASIC">BASIC</option>
          <option value="PRO">PRO</option>
        </select>

        <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', flexShrink: 0 }}>
          {isPending ? '⏳ Buscando...' : `${from}–${to} de ${total}`}
        </span>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-ghost btn-sm" disabled={page <= 1 || isPending} onClick={() => push({ page: '1' })}>«</button>
          <button className="btn btn-ghost btn-sm" disabled={page <= 1 || isPending} onClick={() => push({ page: String(page - 1) })}>‹ Anterior</button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
            .reduce<(number | '...')[]>((acc, p, i, arr) => {
              if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('...')
              acc.push(p)
              return acc
            }, [])
            .map((p, i) =>
              p === '...'
                ? <span key={`el-${i}`} style={{ padding: '0 0.25rem', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>…</span>
                : <button key={p} className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => push({ page: String(p) })} disabled={isPending} style={{ minWidth: 32 }}>{p}</button>
            )}

          <button className="btn btn-ghost btn-sm" disabled={page >= totalPages || isPending} onClick={() => push({ page: String(page + 1) })}>Próxima ›</button>
          <button className="btn btn-ghost btn-sm" disabled={page >= totalPages || isPending} onClick={() => push({ page: String(totalPages) })}>»</button>
        </div>
      )}

      {/* Controle de ordenação visível (mobile-friendly) */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Ordenar por:</span>
        {SORTABLE_COLUMNS.map(col => (
          <button
            key={col.field}
            onClick={() => handleSort(col.field)}
            className={`btn btn-xs ${sort === col.field ? 'btn-primary' : 'btn-ghost'}`}
            disabled={isPending}
          >
            {col.label}
            {sort === col.field ? (dir === 'asc' ? ' ↑' : ' ↓') : ''}
          </button>
        ))}
      </div>

    </div>
  )
}