import { createClient } from '@/lib/supabase/server'
import AdminUserActions from './UserActions'
import Link from 'next/link'

type UserRow = {
  id: string
  email: string
  is_admin: boolean
  plan: string | null
  license_status: string | null
  license_id: string | null
  active_devices_count: number | null
  max_devices: number | null
  registered_at: string | null
}

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('admin_users_overview').select('*').order('registered_at', { ascending: false })
  const users = (data ?? []) as UserRow[]

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin" className="text-gray-400 hover:text-gray-600 text-sm">Admin</Link>
        <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
        <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">{users.length} total</span>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Email</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Plano</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Devices</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Cadastro</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-800">{u.email}</div>
                  {u.is_admin && <span className="text-xs bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded">admin</span>}
                </td>
                <td className="px-4 py-3">
                  <span className={'px-2 py-0.5 rounded-full text-xs font-semibold ' + (u.plan === 'PRO' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700')}>
                    {u.plan ?? 'SEM LICENCA'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={'px-2 py-0.5 rounded-full text-xs ' + (u.license_status === 'ACTIVE' ? 'bg-green-50 text-green-600' : u.license_status === 'SUSPENDED' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600')}>
                    {u.license_status ?? '-'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{u.active_devices_count ?? 0} / {u.max_devices ?? '-'}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{u.registered_at ? new Date(u.registered_at).toLocaleDateString('pt-BR') : '-'}</td>
                <td className="px-4 py-3">
                  {u.license_id && (
                    <AdminUserActions licenseId={u.license_id} currentPlan={u.plan ?? 'BASIC'} currentStatus={u.license_status ?? 'ACTIVE'} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
