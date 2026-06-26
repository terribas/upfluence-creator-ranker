import type { RawCreatorSignals, UpfluenceProfile } from '../types'

const THIRTY_DAYS_S = 30 * 24 * 60 * 60
const FOURTEEN_DAYS_S = 14 * 24 * 60 * 60

// ─── Pass 1: extract all raw signals from one profile ────────────────────────
// Pure sync function — no API calls, no scoring.
// Implements the null fallback required by CLAUDE.md:
//   if engagement_rate/average_likes/average_comments are null on the platform
//   object, compute them from instagram_medias[].
export function extractRawSignals(profile: UpfluenceProfile): RawCreatorSignals | null {
  const ig = profile.instagrams?.[0]
  if (!ig || !ig.followers || ig.followers === 0) return null

  const { followers } = ig
  const posts = profile.instagram_medias ?? []
  const nowS = Math.floor(Date.now() / 1000)

  // ── Engagement signals ────────────────────────────────────────────────────
  let engagementRate: number
  let avgReachRatio: number

  if (
    ig.engagement_rate !== null &&
    ig.average_likes !== null &&
    ig.average_comments !== null
  ) {
    // API provided direct values
    engagementRate = ig.engagement_rate
    avgReachRatio =
      posts.length > 0
        ? posts.reduce((sum, p) => sum + p.reach / followers, 0) / posts.length
        : 0
  } else {
    // Null fallback: derive from per-post data
    if (posts.length === 0) {
      engagementRate = 0
      avgReachRatio = 0
    } else {
      const avgLikes = posts.reduce((s, p) => s + p.likes, 0) / posts.length
      const avgComments = posts.reduce((s, p) => s + p.comments, 0) / posts.length
      engagementRate = (avgLikes + avgComments) / followers
      avgReachRatio = posts.reduce((s, p) => s + p.reach / followers, 0) / posts.length
    }
  }

  // ── Posting frequency ─────────────────────────────────────────────────────
  const recentPosts = posts.filter((p) => nowS - p.timestamp <= THIRTY_DAYS_S)
  const postsPerWeek = recentPosts.length / 4

  // ── Recency score ─────────────────────────────────────────────────────────
  const latestTimestamp = posts.length > 0 ? Math.max(...posts.map((p) => p.timestamp)) : 0
  const ageS = nowS - latestTimestamp
  let recencyScore: number
  if (ageS <= FOURTEEN_DAYS_S) recencyScore = 1.0
  else if (ageS <= THIRTY_DAYS_S) recencyScore = 0.5
  else recencyScore = 0.0

  // ── Cross-platform followers ──────────────────────────────────────────────
  const tiktokFollowers = profile.tiktoks?.[0]?.followers ?? null
  const youtubeFollowers = profile.youtubes?.[0]?.followers ?? null
  const twitterFollowers = profile.twitters?.[0]?.followers ?? null
  const twitchFollowers = profile.twitches?.[0]?.followers ?? null
  const pinterestFollowers = profile.pinterests?.[0]?.followers ?? null

  const PLATFORM_THRESHOLD = 1_000
  let crossPlatformBonus = 0
  if (tiktokFollowers !== null && tiktokFollowers > PLATFORM_THRESHOLD) crossPlatformBonus++
  if (youtubeFollowers !== null && youtubeFollowers > PLATFORM_THRESHOLD) crossPlatformBonus++
  if (twitterFollowers !== null && twitterFollowers > PLATFORM_THRESHOLD) crossPlatformBonus++
  if (twitchFollowers !== null && twitchFollowers > PLATFORM_THRESHOLD) crossPlatformBonus++
  if (pinterestFollowers !== null && pinterestFollowers > PLATFORM_THRESHOLD) crossPlatformBonus++

  return {
    influencerId: profile.influencer.id,
    name: profile.influencer.name,
    handle: ig.username,
    avatarUrl: profile.influencer.avatar_url,
    bio: profile.influencer.description ?? null,
    instagramFollowers: followers,
    tiktokFollowers,
    youtubeFollowers,
    twitterFollowers,
    twitchFollowers,
    pinterestFollowers,
    engagementRate,
    avgReachRatio,
    postsPerWeek,
    recencyScore,
    crossPlatformBonus,
    communityGrowthRate: ig.community_growth_rate ?? 0,
    recommendedPrice: ig.recommended_price ?? 0,
  }
}
