import CreatorCard from './CreatorCard'
import MetricTooltip from './MetricTooltip'
import type { RankedCreator } from '@/lib/types'

interface LeaderboardTableProps {
  creators: RankedCreator[]
  industryLabel?: string
}

export default function LeaderboardTable({ creators, industryLabel = '' }: LeaderboardTableProps) {
  return (
    <div className="space-y-2">
      {/* Column headers — desktop only */}
      <div className="hidden md:grid grid-cols-[2rem_3rem_1fr_8rem_6rem_6rem_10rem_7rem] items-center gap-3 px-4 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
        <span>#</span>
        <span />
        <span>Creator</span>
        <span className="text-right">Followers</span>
        <span className="text-right flex items-center justify-end gap-0.5">
          Eng. Rate <MetricTooltip field="engagement_rate" />
        </span>
        <span className="text-right flex items-center justify-end gap-0.5">
          Growth <MetricTooltip field="growth" />
        </span>
        <span>
          Pillars <MetricTooltip field="reach" />
        </span>
        <span className="text-right flex items-center justify-end gap-0.5">
          CPS <MetricTooltip field="cps" />
        </span>
      </div>

      {creators.map((creator) => (
        <CreatorCard key={creator.influencerId} creator={creator} industryLabel={industryLabel} />
      ))}
    </div>
  )
}
