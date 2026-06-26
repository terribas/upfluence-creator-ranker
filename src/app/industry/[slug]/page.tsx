import { notFound } from 'next/navigation'
import { INDUSTRIES, getIndustryBySlug } from '@/lib/config/industries'
import { runIndustryPipeline } from '@/lib/pipeline'
import LeaderboardWithCompare from '@/components/LeaderboardWithCompare'
import InsightPanel from '@/components/InsightPanel'
import IndustryHeader from '@/components/IndustryHeader'
import type { RankedCreator } from '@/lib/types'

// ISR: regenerate at most once every 24 hours
export const revalidate = 86400

export async function generateStaticParams() {
  return INDUSTRIES.map((i) => ({ slug: i.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const industry = getIndustryBySlug(slug)
  if (!industry) return {}
  return {
    title: `Top ${industry.label} Creators — Upfluence`,
    description: `The top 10 ${industry.label.toLowerCase()} creators ranked by Creator Power Score.`,
  }
}

export default async function IndustryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const industry = getIndustryBySlug(slug)
  if (!industry) notFound()

  let creators: RankedCreator[] = []
  try {
    creators = await runIndustryPipeline(slug)
  } catch {
    // API unavailable or rate-limited — show empty state rather than crashing
  }

  return (
    <div className="space-y-6">
      <IndustryHeader emoji={industry.emoji} label={industry.label} />

      <InsightPanel insight={industry.insight} industryLabel={industry.label} />

      {creators.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center">
          No creators found for this industry. Try again later.
        </p>
      ) : (
        <LeaderboardWithCompare creators={creators} industryLabel={industry.label} />
      )}
    </div>
  )
}
