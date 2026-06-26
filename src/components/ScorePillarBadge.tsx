import { Badge } from '@/components/ui/badge'
import MetricTooltip from './MetricTooltip'
import { cn } from '@/lib/utils'

export type PillarTier = 'green' | 'amber' | 'red'

interface ScorePillarBadgeProps {
  r: number
  q: number
  a: number
  rTier?: PillarTier
  qTier?: PillarTier
  aTier?: PillarTier
}

const TIER_CLASSES: Record<PillarTier, string> = {
  green: 'text-emerald-700 border-emerald-200 bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800 dark:bg-emerald-950',
  amber: 'text-amber-700 border-amber-200 bg-amber-50 dark:text-amber-400 dark:border-amber-800 dark:bg-amber-950',
  red:   'text-rose-700 border-rose-200 bg-rose-50 dark:text-rose-400 dark:border-rose-800 dark:bg-rose-950',
}

function absoluteTier(score: number): PillarTier {
  if (score >= 0.7) return 'green'
  if (score >= 0.4) return 'amber'
  return 'red'
}

function PillarBadge({
  label, score, tier, tooltipField,
}: {
  label: string
  score: number
  tier: PillarTier
  tooltipField: 'reach' | 'quality' | 'activity'
}) {
  return (
    <Badge
      variant="outline"
      className={cn('text-xs font-mono gap-0.5 px-1.5', TIER_CLASSES[tier])}
    >
      {label} {score.toFixed(2)}
      <MetricTooltip field={tooltipField} />
    </Badge>
  )
}

export default function ScorePillarBadge({ r, q, a, rTier, qTier, aTier }: ScorePillarBadgeProps) {
  return (
    <div className="flex flex-wrap gap-1">
      <PillarBadge label="R" score={r} tier={rTier ?? absoluteTier(r)} tooltipField="reach" />
      <PillarBadge label="Q" score={q} tier={qTier ?? absoluteTier(q)} tooltipField="quality" />
      <PillarBadge label="A" score={a} tier={aTier ?? absoluteTier(a)} tooltipField="activity" />
    </div>
  )
}
