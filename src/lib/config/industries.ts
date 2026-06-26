import type { IndustryConfig } from '../types'

export const INDUSTRIES: IndustryConfig[] = [
  {
    slug: 'beauty',
    label: 'Beauty',
    emoji: '💄',
    keywords: ['beauty', 'makeup', 'skincare', 'cosmetics'],
    followerRange: { from: 50_000, to: 5_000_000 },
    insight:
      'Beauty brands see the strongest ROI with creators in the 100k–500k range — large enough to matter, small enough to still have genuine audience trust. Prioritize creators with consistently high engagement rates over raw follower count, since beauty purchase decisions are driven by perceived authenticity. Cross-platform presence (Instagram + TikTok) signals a creator who understands both short-form conversion and long-form discovery.',
  },
  {
    slug: 'fashion',
    label: 'Fashion',
    emoji: '👗',
    keywords: ['fashion', 'style', 'ootd', 'streetwear'],
    followerRange: { from: 50_000, to: 5_000_000 },
    insight:
      'Fashion influencers who post 5+ times per week drive significantly higher referral traffic and product discovery than those posting less frequently. Brands should look for creators whose follower growth rate is still positive — a stagnant or shrinking audience suggests reduced algorithmic distribution. Reach ratio (actual post reach vs. follower count) is the key signal for campaign forecasting.',
  },
  {
    slug: 'fitness',
    label: 'Fitness',
    emoji: '💪',
    keywords: ['fitness', 'workout', 'gym', 'health'],
    followerRange: { from: 30_000, to: 3_000_000 },
    insight:
      'Fitness creators command strong conversion rates for supplement, apparel, and equipment brands because their audience has high purchase intent. Look for creators with multi-platform presence — those who are active on both Instagram and Twitch or TikTok signal dedicated community building beyond passive followers. High posting frequency paired with strong engagement (not just volume) is the gold standard for fitness partnerships.',
  },
  {
    slug: 'food',
    label: 'Food',
    emoji: '🍽️',
    keywords: ['food', 'recipe', 'cooking', 'chef'],
    followerRange: { from: 30_000, to: 3_000_000 },
    insight:
      'Food creators typically achieve the highest average reach ratios of any category — recipe and cooking content is highly shareable, and Instagram\'s algorithm favors it in Explore. Brands in kitchenware, grocery, and meal-kit spaces benefit most from creators who post consistently and recently. Watch for creators with strong video engagement (reels/videos) vs. static posts, as cooking content performs dramatically better in motion.',
  },
  {
    slug: 'gaming',
    label: 'Gaming',
    emoji: '🎮',
    keywords: ['gaming', 'streamer', 'esports', 'gamer'],
    followerRange: { from: 50_000, to: 10_000_000 },
    insight:
      'Gaming creators are uniquely cross-platform by nature — successful ones maintain simultaneous presence on Instagram, Twitch, and YouTube. The cross-platform bonus in the CPS score is especially meaningful in this category. Brands targeting Gen Z should prioritize creators with high TikTok activity alongside their main gaming platforms, as discovery in gaming increasingly happens on short-form video before live streams.',
  },
]

export function getIndustryBySlug(slug: string): IndustryConfig | undefined {
  return INDUSTRIES.find((i) => i.slug === slug)
}
