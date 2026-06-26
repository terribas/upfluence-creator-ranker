import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { InfoIcon } from 'lucide-react'

const METRIC_DESCRIPTIONS: Record<string, string> = {
  cps: 'Creator Power Score — geometric mean of Reach, Quality, and Activity pillars. A creator must score well in all three to rank high.',
  reach: 'Reach Pillar — based on log(followers) + platform diversity bonus. Diminishing returns on raw follower count.',
  quality: 'Quality Pillar — engagement rate × average post reach ratio. Measures how much of the audience actually interacts.',
  activity: 'Activity Pillar — posts per week × recency score. Rewards consistent, recent posting.',
  engagement_rate: 'Average (likes + comments) / followers across recent posts. Null values are computed from post-level data.',
  posts_per_week: 'Average number of posts published per week over the last 30 days.',
  growth: 'Month-over-month follower growth rate. Negative values indicate a shrinking audience.',
}

interface MetricTooltipProps {
  field: keyof typeof METRIC_DESCRIPTIONS
}

export default function MetricTooltip({ field }: MetricTooltipProps) {
  const description = METRIC_DESCRIPTIONS[field]
  if (!description) return null

  return (
    <Tooltip>
      <TooltipTrigger className="cursor-help">
        <InfoIcon className="inline-block ml-1 h-3 w-3 text-muted-foreground shrink-0" />
      </TooltipTrigger>
      <TooltipContent className="max-w-56 text-xs">{description}</TooltipContent>
    </Tooltip>
  )
}
