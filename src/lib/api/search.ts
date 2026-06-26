import type { IndustryConfig, UpfluenceSearchResult } from '../types'

export async function searchIndustryCreators(
  config: IndustryConfig,
  token: string,
): Promise<number[]> {
  const body = {
    page: 1,
    per_page: 20,
    social_media_matching_operator: 'or',
    criterias: [
      // Primary keyword gets weight 2; additional keywords weight 1
      { type: 'must', field: 'all', value: config.keywords[0], weight: 2 },
      ...config.keywords.slice(1).map((kw) => ({
        type: 'should',
        field: 'all',
        value: kw,
        weight: 1,
      })),
    ],
    filters: [
      {
        type: 'range-int',
        field: 'instagram.followers',
        value: config.followerRange,
      },
      {
        type: 'average-engagement',
        field: 'instagram',
        order: '>',
        isPercent: true,
        value: 1,
      },
    ],
    ordering: { value: 'relevancy', direction: 'desc' },
  }

  const res = await fetch('https://api.upfluence.co/v1/matches', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    next: { revalidate: 86400 },
  })

  if (res.status === 429) {
    throw new Error(`Rate limit hit searching ${config.slug} creators`)
  }
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Search failed for ${config.slug} (${res.status}): ${text}`)
  }

  const data = await res.json()
  const influencers: UpfluenceSearchResult[] = data.influencers ?? []
  return influencers.map((i) => i.id)
}
