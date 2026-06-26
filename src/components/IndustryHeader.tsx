'use client'

import { useState } from 'react'
import { HelpCircle } from 'lucide-react'
import CpsInfoModal from './CpsInfoModal'

interface Props {
  emoji: string
  label: string
}

export default function IndustryHeader({ emoji, label }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {emoji} Top {label} Creators
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Ranked by Creator Power Score — a composite of reach, engagement quality, and posting activity.
          </p>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 self-start sm:self-auto shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <HelpCircle className="h-3.5 w-3.5" />
          What is Creator Power Score?
        </button>
      </div>

      <CpsInfoModal open={open} onOpenChange={setOpen} />
    </>
  )
}
