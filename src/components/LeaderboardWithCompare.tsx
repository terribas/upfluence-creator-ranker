'use client'

import { useState } from 'react'
import { Scale } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import MetricTooltip from './MetricTooltip'
import CreatorCard from './CreatorCard'
import VersusDialog from './VersusDialog'
import type { PillarTier } from './ScorePillarBadge'
import type { RankedCreator } from '@/lib/types'

const MAX_COMPARE = 3

// Top 30% → green, middle 40% → amber, bottom 30% → amber unless genuinely low (< 0.35)
function computeTiers(values: number[]): PillarTier[] {
  const n = values.length
  const sorted = [...values].sort((a, b) => b - a)
  return values.map(v => {
    const percentile = (sorted.indexOf(v) + 1) / n
    if (percentile <= 0.3) return 'green'
    if (percentile <= 0.7) return 'amber'
    return v < 0.35 ? 'red' : 'amber'
  })
}

function initials(name: string) {
  return name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function LeaderboardWithCompare({ creators, industryLabel }: { creators: RankedCreator[]; industryLabel: string }) {
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [compareOpen, setCompareOpen] = useState(false)

  function toggleSelect(id: number) {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : prev.length < MAX_COMPARE
          ? [...prev, id]
          : prev,
    )
  }

  const selectedCreators = selectedIds
    .map(id => creators.find(c => c.influencerId === id))
    .filter((c): c is RankedCreator => !!c)

  const rTiers = computeTiers(creators.map(c => c.r))
  const qTiers = computeTiers(creators.map(c => c.q))
  const aTiers = computeTiers(creators.map(c => c.a))

  return (
    <>
      <div className="space-y-2">
        {/* Column headers — desktop only */}
        <div className="hidden md:grid grid-cols-[2rem_3rem_1fr_8rem_6rem_10rem_7rem_3rem] items-center gap-3 px-4 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <span>#</span>
          <span />
          <span>Creator</span>
          <span className="text-right">Followers</span>
          <span className="text-right flex items-center justify-end gap-0.5">
            Eng. Rate <MetricTooltip field="engagement_rate" />
          </span>
          <span>
            Pillars <MetricTooltip field="reach" />
          </span>
          <span className="text-right flex items-center justify-end gap-0.5">
            CPS <MetricTooltip field="cps" />
          </span>
          <span className="flex items-center justify-center gap-1">
            <Scale className="h-3 w-3" />
            Compare
          </span>
        </div>

        {creators.map((creator, i) => (
          <CreatorCard
            key={creator.influencerId}
            creator={creator}
            industryLabel={industryLabel}
            selected={selectedIds.includes(creator.influencerId)}
            onToggleSelect={() => toggleSelect(creator.influencerId)}
            selectDisabled={
              selectedIds.length >= MAX_COMPARE && !selectedIds.includes(creator.influencerId)
            }
            rTier={rTiers[i]}
            qTier={qTiers[i]}
            aTier={aTiers[i]}
          />
        ))}
      </div>

      {/* Bottom spacer so the sticky compare bar doesn't overlap the last card */}
      {selectedIds.length > 0 && <div className="h-20" />}

      {/* Sticky compare bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur px-4 py-3 flex items-center justify-between shadow-xl gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-sm font-medium text-muted-foreground shrink-0">
              {selectedIds.length}/{MAX_COMPARE} selected
            </span>
            <div className="flex -space-x-2">
              {selectedCreators.map(c => (
                <Avatar
                  key={c.influencerId}
                  className="h-7 w-7 ring-2 ring-background"
                >
                  <AvatarImage
                    src={c.avatarUrl ?? undefined}
                    alt={c.name}
                    referrerPolicy="no-referrer"
                  />
                  <AvatarFallback
                    className="text-[10px] font-bold"
                    style={{ backgroundColor: '#d0d9ff', color: '#060666' }}
                  >
                    {initials(c.name)}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            <span className="hidden sm:block text-xs text-muted-foreground truncate">
              {selectedCreators.map(c => c.name).join(' vs ')}
            </span>
          </div>

          <div className="flex gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={() => setSelectedIds([])}>
              Clear
            </Button>
            <Button size="sm" disabled={selectedIds.length < 2} onClick={() => setCompareOpen(true)}>
              Compare ({selectedIds.length})
            </Button>
          </div>
        </div>
      )}

      <VersusDialog
        creators={selectedCreators}
        open={compareOpen}
        onOpenChange={setCompareOpen}
      />
    </>
  )
}
