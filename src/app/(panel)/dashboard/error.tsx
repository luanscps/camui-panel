'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[DashboardError]', error)
  }, [error])

  return (
    <main className="camui-content">
      <Alert variant="destructive" className="max-w-lg">
        <AlertTriangle size={16} />
        <AlertTitle>Algo deu errado</AlertTitle>
        <AlertDescription>
          <p className="mb-3">{error.message ?? 'Erro inesperado ao carregar esta página.'}</p>
          <Button variant="outline" size="sm" onClick={reset}>Tentar novamente</Button>
        </AlertDescription>
      </Alert>
    </main>
  )
}
