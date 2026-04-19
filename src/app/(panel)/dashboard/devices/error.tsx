'use client'

import { Button } from '@/components/ui/button'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'

export default function DevicesError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="camui-content">
      <Alert variant="destructive" className="max-w-lg">
        <AlertTriangle size={16} />
        <AlertTitle>Erro ao carregar dispositivos</AlertTitle>
        <AlertDescription>
          <p className="mb-3">{error.message}</p>
          <Button variant="outline" size="sm" onClick={reset}>Tentar novamente</Button>
        </AlertDescription>
      </Alert>
    </main>
  )
}
