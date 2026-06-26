// ─── Raw Upfluence API shapes ────────────────────────────────────────────────

export interface UpfluenceInstagram {
  id: number
  username: string
  followers: number
  engagement_rate: number | null
  average_likes: number | null
  average_comments: number | null
  community_growth_rate: number
  recommended_price: number
}

export interface UpfluenceInstagramMedia {
  likes: number
  comments: number
  reach: number
  timestamp: number // Unix seconds
}

export interface UpfluenceTikTok {
  followers: number
}

export interface UpfluenceYoutube {
  followers: number
}

export interface UpfluenceTwitter {
  followers: number
}

export interface UpfluenceTwitch {
  followers: number
}

export interface UpfluencePinterest {
  followers: number
}

export interface UpfluenceInfluencer {
  id: number
  name: string
  avatar_url: string | null
  description: string | null
}

export interface UpfluenceProfile {
  influencer: UpfluenceInfluencer
  instagrams: UpfluenceInstagram[]
  instagram_medias: UpfluenceInstagramMedia[]
  tiktoks: UpfluenceTikTok[]
  youtubes: UpfluenceYoutube[]
  twitters: UpfluenceTwitter[]
  twitches: UpfluenceTwitch[]
  pinterests: UpfluencePinterest[]
}

// ─── Search response ──────────────────────────────────────────────────────────

export interface UpfluenceSearchResult {
  id: number
  name: string
}

// ─── Pipeline intermediate: output of Pass 1 ─────────────────────────────────

export interface RawCreatorSignals {
  influencerId: number
  name: string
  handle: string
  avatarUrl: string | null
  bio: string | null           // influencer.description from the API
  instagramFollowers: number
  tiktokFollowers: number | null
  youtubeFollowers: number | null
  twitterFollowers: number | null
  twitchFollowers: number | null
  pinterestFollowers: number | null
  engagementRate: number       // derived or direct; always a valid number
  avgReachRatio: number        // mean(post.reach / followers) over last posts
  postsPerWeek: number
  recencyScore: number         // 1.0 | 0.5 | 0.0
  crossPlatformBonus: number   // count of non-Instagram platforms with >1k followers
  communityGrowthRate: number  // for display only; not scored
  recommendedPrice: number     // for display only; not scored
}

// ─── Pipeline output: result of Pass 2 ───────────────────────────────────────

export interface RankedCreator extends RawCreatorSignals {
  rank: number
  r: number    // normalized Reach pillar score (0–1)
  q: number    // normalized Quality pillar score (0–1)
  a: number    // normalized Activity pillar score (0–1)
  cps: number  // Creator Power Score = (r × q × a)^(1/3)
}

// ─── Configuration ────────────────────────────────────────────────────────────

export interface IndustryConfig {
  slug: string
  label: string
  emoji: string
  keywords: string[]
  followerRange: { from: number; to: number }
  insight: string
}
