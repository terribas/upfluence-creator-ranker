import OpenAI from 'openai'
import type { RankedCreator } from '@/lib/types'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

function recencyLabel(score: number) {
  if (score >= 1) return 'active (posted within 14 days)'
  if (score >= 0.5) return 'slowing (last post 15–30 days ago)'
  return 'inactive (no posts in 30+ days)'
}

function buildPrompt(creator: RankedCreator, industryLabel: string): string {
  return `You are a brand partnership analyst at Upfluence. Write a 2-3 sentence brand fit analysis for a marketing manager evaluating this creator for a campaign.

Creator: ${creator.name} (@${creator.handle})
Industry: ${industryLabel}
Instagram followers: ${fmt(creator.instagramFollowers)}
Engagement rate: ${(creator.engagementRate * 100).toFixed(2)}%
Avg reach ratio: ${(creator.avgReachRatio * 100).toFixed(2)}%
Posts per week: ${creator.postsPerWeek.toFixed(1)}
Recent activity: ${recencyLabel(creator.recencyScore)}
Follower growth rate: ${(creator.communityGrowthRate * 100).toFixed(2)}%
Cross-platform: ${creator.crossPlatformBonus} additional platform(s) with >1k followers
Estimated post price: $${creator.recommendedPrice.toLocaleString('en-US', { maximumFractionDigits: 0 })}
Creator Power Score: #${creator.rank} in their ${industryLabel} cohort (score: ${creator.cps.toFixed(3)})

Be specific. Reference actual numbers from the data. Focus on what makes this creator a strong or weak partner for brands in this space. No fluff, no generic statements.`
}

export async function POST(req: Request) {
  const { creator, industryLabel } = (await req.json()) as {
    creator: RankedCreator
    industryLabel: string
  }

  if (!creator || !industryLabel) {
    return new Response('Missing creator or industryLabel', { status: 400 })
  }

  const stream = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: buildPrompt(creator, industryLabel) }],
    max_tokens: 200,
    temperature: 0.7,
    stream: true,
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? ''
        if (text) controller.enqueue(encoder.encode(text))
      }
      controller.close()
    },
  })

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
