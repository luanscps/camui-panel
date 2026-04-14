import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data, error } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  const profile = data as { is_admin: boolean } | null

  if (error || !profile || !profile.is_admin) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-8 py-3 flex items-center gap-6">
        <span className="font-bold text-teal-700">⚙ Admin</span>
        <a href="/admin" className="text-sm text-gray-600 hover:text-teal-700">Dashboard</a>
        <a href="/admin/users" className="text-sm text-gray-600 hover:text-teal-700">Usuários</a>
        <a href="/admin/licenses" className="text-sm text-gray-600 hover:text-teal-700">Devices</a>
        <div className="ml-auto">
          <a href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600">← Voltar ao painel</a>
        </div>
      </nav>
      <main className="p-8">{children}</main>
    </div>
  )
}