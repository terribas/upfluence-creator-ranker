'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { RankedCreator } from '@/lib/types'

interface Props {
  creators: RankedCreator[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}
function pct(n: number) { return `${(n * 100).toFixed(2)}%` }
function currency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}
function initials(name: string) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}
function recencyLabel(score: number) {
  if (score >= 1) return 'Active (≤14 days)'
  if (score >= 0.5) return 'Slowing (15–30 days)'
  return 'Inactive (>30 days)'
}

type MetricDef = {
  label: string
  getValue: (c: RankedCreator) => number
  format: (c: RankedCreator) => string
  higherIsBetter: boolean
  section?: string
  showBar?: boolean
}

const METRICS: MetricDef[] = [
  {
    section: 'Creator Power Score',
    label: 'CPS',
    getValue: c => c.cps,
    format: c => c.cps.toFixed(4),
    higherIsBetter: true,
    showBar: true,
  },
  { label: 'R — Reach', getValue: c => c.r, format: c => c.r.toFixed(3), higherIsBetter: true, showBar: true },
  { label: 'Q — Quality', getValue: c => c.q, format: c => c.q.toFixed(3), higherIsBetter: true, showBar: true },
  { label: 'A — Activity', getValue: c => c.a, format: c => c.a.toFixed(3), higherIsBetter: true, showBar: true },
  { section: 'Audience', label: 'Followers', getValue: c => c.instagramFollowers, format: c => fmt(c.instagramFollowers), higherIsBetter: true },
  {
    label: 'Cross-platform',
    getValue: c => c.crossPlatformBonus,
    format: c => `${c.crossPlatformBonus} extra platform${c.crossPlatformBonus !== 1 ? 's' : ''}`,
    higherIsBetter: true,
  },
  { section: 'Engagement', label: 'Engagement rate', getValue: c => c.engagementRate, format: c => pct(c.engagementRate), higherIsBetter: true },
  { label: 'Avg reach ratio', getValue: c => c.avgReachRatio, format: c => pct(c.avgReachRatio), higherIsBetter: true },
  { label: 'Follower growth', getValue: c => c.communityGrowthRate, format: c => pct(c.communityGrowthRate), higherIsBetter: true },
  { section: 'Activity', label: 'Posts / week', getValue: c => c.postsPerWeek, format: c => c.postsPerWeek.toFixed(1), higherIsBetter: true },
  { label: 'Recency', getValue: c => c.recencyScore, format: c => recencyLabel(c.recencyScore), higherIsBetter: true },
  {
    section: 'Commercial',
    label: 'Est. post price',
    getValue: c => c.recommendedPrice,
    format: c => (c.recommendedPrice > 0 ? currency(c.recommendedPrice) : 'N/A'),
    higherIsBetter: false,
  },
]

function winnerIndex(metric: MetricDef, creators: RankedCreator[]): number | null {
  if (!metric.higherIsBetter) return null
  const values = creators.map(c => metric.getValue(c))
  const max = Math.max(...values)
  if (values.filter(v => v === max).length > 1) return null
  return values.indexOf(max)
}

export default function VersusDialog({ creators, open, onOpenChange }: Props) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onOpenChange(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onOpenChange])

  if (!open || creators.length < 2 || typeof document === 'undefined') return null

  const cols = creators.length
  const gridTemplate = `180px repeat(${cols}, 1fr)`

  return createPortal(
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* Scroll container */}
      <div className="absolute inset-0 overflow-y-auto flex items-start justify-center p-4 sm:p-8">
        <div
          className="relative w-full max-w-4xl rounded-xl border bg-background shadow-2xl flex flex-col my-4"
          style={{ maxHeight: 'calc(100vh - 4rem)' }}
        >
          {/* Fixed title bar */}
          <div className="flex-shrink-0 border-b px-6 h-14 flex items-center justify-between rounded-t-xl bg-background">
            <div>
              <h2 className="text-base font-bold">Creator Comparison</h2>
              <p className="text-xs text-muted-foreground">
                Winners per metric highlighted in green
              </p>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Scrollable body */}
          <div className="overflow-y-auto overflow-x-auto flex-1">
            <div style={{ minWidth: `${180 + cols * 200}px` }}>

              {/* Sticky creator header row */}
              <div
                className="sticky top-0 z-10 bg-background border-b grid"
                style={{ gridTemplateColumns: gridTemplate }}
              >
                <div className="px-4 py-3" />
                {creators.map(c => (
                  <div
                    key={c.influencerId}
                    className="px-4 py-4 border-l flex flex-col items-center text-center gap-2"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={c.avatarUrl ?? undefined}
                        alt={c.name}
                        referrerPolicy="no-referrer"
                      />
                      <AvatarFallback
                        className="text-sm font-bold"
                        style={{ backgroundColor: '#d0d9ff', color: '#060666' }}
                      >
                        {initials(c.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm leading-tight">{c.name}</p>
                      <p className="text-xs text-muted-foreground">@{c.handle}</p>
                      <span
                        className="inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: '#d0d9ff', color: '#060666' }}
                      >
                        #{c.rank} in ranking
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Metric rows */}
              <div className="divide-y">
                {METRICS.map(metric => {
                  const winner = winnerIndex(metric, creators)
                  return (
                    <div key={metric.label}>
                      {/* Section label */}
                      {metric.section && (
                        <div className="bg-muted/40 px-4 py-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            {metric.section}
                          </span>
                        </div>
                      )}

                      <div className="grid" style={{ gridTemplateColumns: gridTemplate }}>
                        {/* Metric name */}
                        <div className="px-4 py-3 flex items-center">
                          <span className="text-xs text-muted-foreground">{metric.label}</span>
                        </div>

                        {/* Values per creator */}
                        {creators.map((c, ci) => {
                          const isWinner = winner === ci
                          return (
                            <div
                              key={c.influencerId}
                              className={cn(
                                'px-4 py-3 border-l flex flex-col items-center justify-center gap-1.5',
                                isWinner && 'bg-emerald-50 dark:bg-emerald-950/20',
                              )}
                            >
                              <span
                                className={cn(
                                  'text-sm font-semibold',
                                  isWinner
                                    ? 'text-emerald-700 dark:text-emerald-400'
                                    : 'text-foreground',
                                )}
                              >
                                {metric.format(c)}
                              </span>
                              {metric.showBar && (
                                <Progress
                                  value={metric.getValue(c) * 100}
                                  className={cn('h-1 w-full max-w-[80px]', !isWinner && 'opacity-40')}
                                />
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
