import type { RankedCreator, RawCreatorSignals } from '../types'

// ─── Pass 2: normalize across full cohort, compute CPS, return top 10 ────────
// Pure sync function — full cohort in, ranked list out.
// Implements the Geometric Mean of 3 Pillars formula from CLAUDE.md exactly:
//   CPS = (R × Q × A)^(1/3)
//   R = norm( log(followers) + 0.3 × cross_platform_bonus )
//   Q = norm( engagement_rate × avg_reach_ratio )
//   A = norm( posts_per_week × recency_score )
export function rankCohort(signals: RawCreatorSignals[]): RankedCreator[] {
  if (signals.length === 0) return []

  // ── Compute raw pillar inputs for each creator ────────────────────────────
  const raw = signals.map((s) => ({
    rRaw: Math.log(s.instagramFollowers + 1) + 0.3 * s.crossPlatformBonus,
    qRaw: s.engagementRate * s.avgReachRatio,
    aRaw: s.postsPerWeek * s.recencyScore,
  }))

  // ── Collect min/max across cohort for each pillar ─────────────────────────
  const rVals = raw.map((r) => r.rRaw)
  const qVals = raw.map((r) => r.qRaw)
  const aVals = raw.map((r) => r.aRaw)

  const rMin = Math.min(...rVals), rMax = Math.max(...rVals)
  const qMin = Math.min(...qVals), qMax = Math.max(...qVals)
  const aMin = Math.min(...aVals), aMax = Math.max(...aVals)

  // ── Normalize (min-max), clamp to [0,1]; if range is 0, everyone gets 0.5 ─
  const norm = (x: number, min: number, max: number): number => {
    if (max === min) return 0.5
    return Math.max(0, Math.min(1, (x - min) / (max - min)))
  }

  // ── Score each creator ────────────────────────────────────────────────────
  const scored: RankedCreator[] = signals.map((s, i) => {
    const r = norm(raw[i].rRaw, rMin, rMax)
    const q = norm(raw[i].qRaw, qMin, qMax)
    const a = norm(raw[i].aRaw, aMin, aMax)
    const cps = Math.cbrt(r * q * a)

    return { ...s, rank: 0, r, q, a, cps }
  })

  // ── Sort descending by CPS, assign ranks, return top 10 ──────────────────
  scored.sort((a, b) => b.cps - a.cps)
  return scored.slice(0, 10).map((c, i) => ({ ...c, rank: i + 1 }))
}
