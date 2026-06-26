interface InsightPanelProps {
  insight: string
  industryLabel: string
}

export default function InsightPanel({ insight, industryLabel }: InsightPanelProps) {
  return (
    <div className="rounded-lg border bg-muted/40 p-4 border-l-4" style={{ borderLeftColor: '#0d0de6' }}>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
        Brand Insight · {industryLabel}
      </p>
      <p className="text-sm leading-relaxed">{insight}</p>
    </div>
  )
}
