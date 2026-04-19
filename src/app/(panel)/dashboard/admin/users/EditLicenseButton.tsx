'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SelectNative } from '@/components/ui/select-native'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { updateLicenseAction } from '../actions'

type Props = {
  licenseId: string
  currentPlan: string
  currentStatus: string
  currentMaxDevices: number
  currentExpiresAt: string | null
}

function addDays(dateStr: string | null, days: number): string {
  const base = dateStr ? new Date(dateStr) : new Date()
  if (base < new Date()) base.setTime(new Date().getTime())
  base.setDate(base.getDate() + days)
  return base.toISOString().slice(0, 10)
}

export default function EditLicenseButton({
  licenseId,
  currentPlan,
  currentStatus,
  currentMaxDevices,
  currentExpiresAt,
}: Props) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [plan, setPlan] = useState(currentPlan)
  const [status, setStatus] = useState(currentStatus)
  const [maxDevices, setMaxDevices] = useState(currentMaxDevices)
  const [expiresAt, setExpiresAt] = useState(
    currentExpiresAt ? currentExpiresAt.slice(0, 10) : ''
  )

  function handleSave() {
    setError(null)
    startTransition(async () => {
      try {
        await updateLicenseAction({ licenseId, plan, status, maxDevices, expiresAt: expiresAt || null })
        toast.success('Licença atualizada com sucesso.')
        setOpen(false)
      } catch (e: any) {
        setError(e.message ?? 'Erro ao salvar')
      }
    })
  }

  const labelCls = 'text-[0.7rem] font-semibold uppercase tracking-wide text-[var(--color-text-muted)] block mb-1'

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="xs">Editar</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Licença</DialogTitle>
          <DialogDescription>Altere plano, status, limite de devices ou data de expiração.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3.5">
          {/* Plano + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Plano</label>
              <SelectNative value={plan} onChange={e => setPlan(e.target.value)}>
                <option value="BASIC">BASIC</option>
                <option value="PRO">PRO</option>
              </SelectNative>
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <SelectNative value={status} onChange={e => setStatus(e.target.value)}>
                <option value="ACTIVE">ACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
                <option value="EXPIRED">EXPIRED</option>
              </SelectNative>
            </div>
          </div>

          {/* Máx. Devices + Expiração */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Máx. Devices</label>
              <Input
                type="number"
                min={1} max={10}
                value={maxDevices}
                onChange={e => setMaxDevices(Number(e.target.value))}
              />
            </div>
            <div>
              <label className={labelCls}>Expiração</label>
              <Input
                type="date"
                value={expiresAt}
                onChange={e => setExpiresAt(e.target.value)}
              />
            </div>
          </div>

          {/* Extensão rápida */}
          <div>
            <label className={labelCls}>Extensão rápida</label>
            <div className="flex gap-2">
              <Button variant="outline" size="xs" type="button" onClick={() => setExpiresAt(addDays(expiresAt || null, 30))}>+30 dias</Button>
              <Button variant="outline" size="xs" type="button" onClick={() => setExpiresAt(addDays(expiresAt || null, 180))}>+6 meses</Button>
              <Button variant="outline" size="xs" type="button" onClick={() => setExpiresAt(addDays(expiresAt || null, 365))}>+1 ano</Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>⚠️ {error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)} disabled={isPending}>Cancelar</Button>
          <Button size="sm" onClick={handleSave} disabled={isPending}>
            {isPending ? 'Salvando…' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
