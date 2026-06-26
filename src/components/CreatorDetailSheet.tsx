'use client'

import { useState } from 'react'
import { Sparkles, RotateCcw, TrendingUp, Users, Zap } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { RankedCreator } from '@/lib/types'

interface Props {
  creator: RankedCreator
  industryLabel: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}
function pct(n: number) { return `${(n * 100).toFixed(2)}%` }
function currency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}
function recencyLabel(score: number) {
  if (score >= 1) return { label: 'Active', color: '#16a34a', bg: '#f0fdf4' }
  if (score >= 0.5) return { label: 'Slowing', color: '#d97706', bg: '#fffbeb' }
  return { label: 'Inactive', color: '#dc2626', bg: '#fef2f2' }
}

function StatChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 flex-1 py-2.5 px-1">
      <div className="text-muted-foreground/60">{icon}</div>
      <span className="text-sm font-bold tabular-nums">{value}</span>
      <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</span>
    </div>
  )
}

function PillarRow({
  letter, score, color, label, signals,
}: {
  letter: string
  score: number
  color: string
  label: string
  signals: { name: string; value: string }[]
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold" style={{ color }}>
          {letter} · {label}
        </span>
        <span className="text-xs font-bold tabular-nums" style={{ color }}>{score.toFixed(3)}</span>
      </div>
      <Progress value={score * 100} className="h-1.5" />
      <div className="flex flex-wrap gap-x-4 gap-y-0.5">
        {signals.map((s) => (
          <span key={s.name} className="text-[11px] text-muted-foreground">
            {s.name}: <span className="font-medium text-foreground">{s.value}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

function MetricRow({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex justify-between items-start py-2 border-b last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="text-right">
        <span className="text-xs font-semibold">{value}</span>
        {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
      </div>
    </div>
  )
}

type InsightState = 'idle' | 'loading' | 'done' | 'error'

export default function CreatorDetailSheet({ creator, industryLabel, open, onOpenChange }: Props) {
  const initials = creator.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
  const recency = recencyLabel(creator.recencyScore)
  const [insightState, setInsightState] = useState<InsightState>('idle')
  const [insightText, setInsightText] = useState('')

  async function generateInsight() {
    setInsightState('loading')
    setInsightText('')
    try {
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creator, industryLabel }),
      })
      if (!res.ok || !res.body) throw new Error('Request failed')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let text = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        text += decoder.decode(value, { stream: true })
        setInsightText(text)
      }
      setInsightState('done')
    } catch {
      setInsightState('error')
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col p-0 gap-0 overflow-hidden">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="px-6 pt-6 pb-4 border-b shrink-0">
          <SheetHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 shrink-0">
                <AvatarImage src={creator.avatarUrl ?? undefined} alt={creator.name} referrerPolicy="no-referrer" />
                <AvatarFallback className="text-base font-bold" style={{ backgroundColor: '#d0d9ff', color: '#060666' }}>
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <SheetTitle className="text-base leading-tight truncate">{creator.name}</SheetTitle>
                <SheetDescription className="text-xs">@{creator.handle}</SheetDescription>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-bold">
                    #{creator.rank} in {industryLabel || 'industry'}
                  </Badge>
                  <span
                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                    style={{ color: recency.color, backgroundColor: recency.bg }}
                  >
                    {recency.label}
                  </span>
                </div>
              </div>
            </div>
          </SheetHeader>
        </div>

        {/* ── Scrollable body ────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">

          {/* Quick stats bar */}
          <div className="flex divide-x border-b bg-muted/30">
            <StatChip icon={<Users className="h-3.5 w-3.5" />} label="Followers" value={fmt(creator.instagramFollowers)} />
            <StatChip icon={<Zap className="h-3.5 w-3.5" />} label="Eng. Rate" value={pct(creator.engagementRate)} />
            <StatChip icon={<TrendingUp className="h-3.5 w-3.5" />} label="Posts/wk" value={creator.postsPerWeek.toFixed(1)} />
          </div>

          <div className="px-6 py-5 space-y-5">

            {/* ── AI Brand Insight ─────────────────────────── */}
            <div className="rounded-xl border-2 p-4 space-y-3" style={{ borderColor: '#0d0de630', background: '#f5f5ff' }}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest flex items-center gap-1.5" style={{ color: '#0d0de6' }}>
                  <Sparkles className="h-3.5 w-3.5" />
                  AI Brand Insight
                </p>
                {insightState === 'done' && (
                  <button
                    onClick={generateInsight}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Regenerate
                  </button>
                )}
              </div>

              {insightState === 'idle' && (
                <Button
                  size="sm"
                  onClick={generateInsight}
                  className="w-full text-white gap-2"
                  style={{ backgroundColor: '#0d0de6' }}
                >
                  <Sparkles className="h-4 w-4" />
                  Generate insight for {creator.name.split(' ')[0]}
                </Button>
              )}

              {insightState === 'loading' && !insightText && (
                <div className="space-y-2">
                  <div className="h-3 rounded-full bg-indigo-100 animate-pulse w-full" />
                  <div className="h-3 rounded-full bg-indigo-100 animate-pulse w-5/6" />
                  <div className="h-3 rounded-full bg-indigo-100 animate-pulse w-4/6" />
                </div>
              )}

              {(insightState === 'loading' || insightState === 'done') && insightText && (
                <p className="text-sm leading-relaxed text-gray-800">
                  {insightText}
                  {insightState === 'loading' && (
                    <span className="inline-block w-0.5 h-3.5 bg-indigo-600 ml-0.5 animate-pulse align-middle" />
                  )}
                </p>
              )}

              {insightState === 'error' && (
                <div className="space-y-2">
                  <p className="text-xs text-destructive">Could not generate insight. Check your OpenAI API key.</p>
                  <Button variant="outline" size="sm" onClick={generateInsight} className="w-full">
                    Try again
                  </Button>
                </div>
              )}
            </div>

            {/* ── CPS Hero ─────────────────────────────────── */}
            <div className="rounded-xl p-4 text-white" style={{ background: 'linear-gradient(135deg, #060666, #0d0de6)' }}>
              <div className="flex items-end justify-between mb-2">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest opacity-70">Creator Power Score</p>
                  <p className="text-3xl font-extrabold tracking-tight">{creator.cps.toFixed(4)}</p>
                </div>
                {creator.recommendedPrice > 0 && (
                  <div className="text-right">
                    <p className="text-[10px] opacity-60">Est. post price</p>
                    <p className="text-base font-bold">{currency(creator.recommendedPrice)}</p>
                  </div>
                )}
              </div>
              <Progress value={creator.cps * 100} className="h-1.5 opacity-70" />
              <p className="text-[10px] opacity-50 mt-1">Geometric mean · Reach × Quality × Activity</p>
            </div>

            {/* ── Pillar breakdown ─────────────────────────── */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Score Pillars</p>
              <div className="space-y-4 rounded-xl border p-4">
                <PillarRow
                  letter="R" label="Reach" score={creator.r} color="#0d0de6"
                  signals={[
                    { name: 'Followers', value: fmt(creator.instagramFollowers) },
                    { name: 'Cross-platform', value: `+${creator.crossPlatformBonus}` },
                  ]}
                />
                <div className="border-t" />
                <PillarRow
                  letter="Q" label="Quality" score={creator.q} color="#535efc"
                  signals={[
                    { name: 'Eng. rate', value: pct(creator.engagementRate) },
                    { name: 'Reach ratio', value: pct(creator.avgReachRatio) },
                  ]}
                />
                <div className="border-t" />
                <PillarRow
                  letter="A" label="Activity" score={creator.a} color="#2cb3de"
                  signals={[
                    { name: 'Posts/wk', value: creator.postsPerWeek.toFixed(1) },
                    { name: 'Recency', value: recency.label },
                  ]}
                />
              </div>
            </div>

            {/* ── Bio ──────────────────────────────────────── */}
            {creator.bio && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5">About</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{creator.bio}</p>
              </div>
            )}

            {/* ── Platform presence ────────────────────────── */}
            {(() => {
              const platforms: { label: string; followers: number | null; icon: React.ReactNode; color: string }[] = [
                { label: 'Instagram', followers: creator.instagramFollowers, icon: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>, color: '#e1306c' },
                { label: 'TikTok', followers: creator.tiktokFollowers, icon: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.27 8.27 0 0 0 4.84 1.55V6.79a4.85 4.85 0 0 1-1.07-.1z"/></svg>, color: '#000000' },
                { label: 'YouTube', followers: creator.youtubeFollowers, icon: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>, color: '#ff0000' },
                { label: 'Twitter/X', followers: creator.twitterFollowers, icon: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>, color: '#000000' },
                { label: 'Twitch', followers: creator.twitchFollowers, icon: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg>, color: '#9146ff' },
                { label: 'Pinterest', followers: creator.pinterestFollowers, icon: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>, color: '#e60023' },
              ]
              const active = platforms.filter(p => p.followers !== null && p.followers > 0)
              if (active.length <= 1) return null
              return (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Platforms</p>
                  <div className="grid grid-cols-2 gap-2">
                    {active.map(p => (
                      <div key={p.label} className="flex items-center gap-2 rounded-lg border px-3 py-2">
                        <span style={{ color: p.color }}>{p.icon}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate">{p.label}</p>
                          <p className="text-[11px] text-muted-foreground tabular-nums">{fmt(p.followers!)} followers</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}

            {/* ── All Signals ──────────────────────────────── */}
            <div className="pb-2">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">All Signals</p>
              <div className="rounded-xl border px-4">
                <MetricRow label="Instagram followers" value={fmt(creator.instagramFollowers)} />
                <MetricRow label="Engagement rate" value={pct(creator.engagementRate)} />
                <MetricRow label="Avg reach ratio" value={pct(creator.avgReachRatio)} sub="mean(post reach ÷ followers)" />
                <MetricRow label="Posts / week" value={creator.postsPerWeek.toFixed(1)} sub="last 30 days" />
                <MetricRow label="Follower growth" value={pct(creator.communityGrowthRate)} />
                <MetricRow label="Cross-platform" value={`${creator.crossPlatformBonus} extra platform${creator.crossPlatformBonus !== 1 ? 's' : ''}`} sub=">1k followers each" />
                <MetricRow
                  label="Est. post price"
                  value={creator.recommendedPrice > 0 ? currency(creator.recommendedPrice) : 'N/A'}
                  sub="Upfluence estimate"
                />
              </div>
            </div>

          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
