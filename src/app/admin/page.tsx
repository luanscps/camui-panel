import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminPage() {
  const supabase = await createClient()

  const { data: stats } = await supabase
    .from('admin_license_stats')
    .select('*')
    .single()

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Painel Admin</h1>
      <p className="text-gray-500 mb-8">CamStreamer BR — visão geral</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Usuários" value={stats?.total_users ?? 0} color="gray" />
        <StatCard label="Plano BASIC" value={stats?.total_basic ?? 0} color="blue" />
        <StatCard label="Plano PRO" value={stats?.total_pro ?? 0} color="green" />
        <StatCard label="Devices Ativos" value={stats?.total_devices ?? 0} color="purple" />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Licenças Ativas" value={stats?.total_active ?? 0} color="green" />
        <StatCard label="Suspensas" value={stats?.total_suspended ?? 0} color="yellow" />
        <StatCard label="Expiradas" value={stats?.total_expired ?? 0} color="red" />
      </div>

      <div className="flex gap-4">
        <Link
          href="/admin/users"
          className="px-4 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition text-sm"
        >
          Gerenciar Usuários →
        </Link>
        <Link
          href="/admin/licenses"
          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition text-sm"
        >
          Gerenciar Devices →
        </Link>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  color = 'gray',
}: {
  label: string
  value: number
  color?: string
}) {
  const colors: Record<string, string> = {
    gray:   'bg-white border-gray-200',
    blue:   'bg-blue-50 border-blue-200',
    green:  'bg-green-50 border-green-200',
    purple: 'bg-purple-50 border-purple-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    red:    'bg-red-50 border-red-200',
  }
  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
    </div>
  )
}
