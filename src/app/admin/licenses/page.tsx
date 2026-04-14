import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

type DeviceRow = {
  id: string
  device_id: string
  activated_at: string | null
  last_seen_at: string | null
  license: {
    plan: string
    user_id: string
  } | null
}

export default async function AdminLicensesPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('device_activations')
    .select('id, device_id, activated_at, last_seen_at, license:licenses(plan, user_id)')
    .order('last_seen_at', { ascending: false })

  const devices = (data ?? []) as DeviceRow[]

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin" className="text-gray-400 hover:text-gray-600 text-sm">
          Admin
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Devices Ativados</h1>
        <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
          {devices.length} dispositivos
        </span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Device ID</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Plano</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Ativado em</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Último acesso</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {devices.map((d) => (
              <tr key={d.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-gray-600">{d.device_id}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      d.license?.plan === 'PRO'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {d.license?.plan ?? '-'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {d.activated_at
                    ? new Date(d.activated_at).toLocaleDateString('pt-BR')
                    : '-'}
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {d.last_seen_at
                    ? new Date(d.last_seen_at).toLocaleDateString('pt-BR')
                    : '-'}
                </td>
                <td className="px-4 py-3">
                  <form
                    action={async () => {
                      'use server'
                      const { createClient } = await import('@/lib/supabase/server')
                      const sb = await createClient()
                      await sb.from('device_activations').delete().eq('id', d.id)
                    }}
                  >
                    <button
                      type="submit"
                      className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Revogar
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}