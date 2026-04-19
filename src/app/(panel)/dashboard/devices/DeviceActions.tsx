'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'

type Action = 'suspend' | 'activate' | 'revoke'

type Props = {
  activationId: string
  status: string
}

async function runAction(activationId: string, action: Action) {
  const res = await fetch('/api/admin/device-action', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ activationId, action }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error ?? 'Erro ao executar ação')
  }
}

export default function DeviceActions({ activationId, status }: Props) {
  const [open, setOpen] = useState<Action | null>(null)
  const [isPending, startTransition] = useTransition()

  function confirm(action: Action) {
    startTransition(async () => {
      try {
        await runAction(activationId, action)
        toast.success(
          action === 'suspend'  ? 'Dispositivo suspenso.'  :
          action === 'activate' ? 'Dispositivo reativado.' :
          'Dispositivo revogado.'
        )
        setOpen(null)
        // Server Component recarrega ao navegar; força refresh
        window.location.reload()
      } catch (e: any) {
        toast.error(e.message ?? 'Erro inesperado.')
      }
    })
  }

  const isActive    = status === 'ACTIVE'
  const isSuspended = status === 'SUSPENDED'

  const dialogMeta: Record<Action, { title: string; desc: string; confirmLabel: string; variant: 'default' | 'destructive' }> = {
    suspend:  { title: 'Suspender dispositivo', desc: 'O dispositivo perderá acesso ao streaming até ser reativado.',    confirmLabel: 'Suspender',  variant: 'destructive' },
    activate: { title: 'Reativar dispositivo',  desc: 'O dispositivo voltará a ter acesso conforme o plano da licença.', confirmLabel: 'Reativar',   variant: 'default' },
    revoke:   { title: 'Revogar dispositivo',   desc: 'Esta ação é irreversível. O device precisará ser reativado manualmente.', confirmLabel: 'Revogar', variant: 'destructive' },
  }

  return (
    <div className="flex flex-wrap gap-1">
      {/* Suspender */}
      {isActive && (
        <AlertDialog open={open === 'suspend'} onOpenChange={v => setOpen(v ? 'suspend' : null)}>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="xs">Suspender</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{dialogMeta.suspend.title}</AlertDialogTitle>
              <AlertDialogDescription>{dialogMeta.suspend.desc}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-transparent text-[#a12c7b] border border-[rgba(161,44,123,0.3)] hover:bg-[rgba(161,44,123,0.06)]"
                onClick={() => confirm('suspend')}
                disabled={isPending}
              >
                {isPending ? 'Aguarde…' : 'Suspender'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Reativar */}
      {isSuspended && (
        <AlertDialog open={open === 'activate'} onOpenChange={v => setOpen(v ? 'activate' : null)}>
          <AlertDialogTrigger asChild>
            <Button variant="secondary" size="xs">Reativar</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{dialogMeta.activate.title}</AlertDialogTitle>
              <AlertDialogDescription>{dialogMeta.activate.desc}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => confirm('activate')} disabled={isPending}>
                {isPending ? 'Aguarde…' : 'Reativar'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Revogar */}
      {(isActive || isSuspended) && (
        <AlertDialog open={open === 'revoke'} onOpenChange={v => setOpen(v ? 'revoke' : null)}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="xs">Revogar</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{dialogMeta.revoke.title}</AlertDialogTitle>
              <AlertDialogDescription>{dialogMeta.revoke.desc}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-transparent text-[#a12c7b] border border-[rgba(161,44,123,0.3)] hover:bg-[rgba(161,44,123,0.06)]"
                onClick={() => confirm('revoke')}
                disabled={isPending}
              >
                {isPending ? 'Aguarde…' : 'Revogar'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
