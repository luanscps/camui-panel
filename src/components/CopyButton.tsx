'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

type Props = {
  value: string
  masked?: boolean
  label?: string
}

export default function CopyButton({ value, masked = false, label }: Props) {
  const [copied, setCopied] = useState(false)
  const [revealed, setRevealed] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    toast.success(label ? `${label} copiado!` : 'Copiado!')
    setTimeout(() => setCopied(false), 2000)
  }

  const display = masked && !revealed
    ? value.replace(/[A-Z0-9]/g, '•').slice(0, 24)
    : value

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-1.5">
        <code
          className="text-[0.7rem] font-mono bg-[var(--color-surface-offset)] border border-[var(--color-border)] rounded px-1.5 py-0.5 select-all text-[var(--color-text-muted)] cursor-pointer"
          onClick={() => masked && setRevealed(r => !r)}
          title={masked ? 'Clique para revelar' : undefined}
        >
          {display}
        </code>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="!w-6 !h-6" onClick={handleCopy}>
              {copied ? <Check size={11} className="text-[var(--color-success)]" /> : <Copy size={11} />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copiar</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
