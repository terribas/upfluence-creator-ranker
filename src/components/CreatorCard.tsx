'use client'

import { useState } from 'react'
import { Scale } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import ScorePillarBadge, { type PillarTier } from './ScorePillarBadge'
import MetricTooltip from './MetricTooltip'
import CreatorDetailSheet from './CreatorDetailSheet'
import { cn } from '@/lib/utils'
import type { RankedCreator } from '@/lib/types'

interface CreatorCardProps {
  creator: RankedCreator
  industryLabel: string
  selected?: boolean
  onToggleSelect?: () => void
  selectDisabled?: boolean
  rTier?: PillarTier
  qTier?: PillarTier
  aTier?: PillarTier
}

function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

function formatPercent(n: number): string {
  return `${(n * 100).toFixed(2)}%`
}

function formatPrice(n: number): string {
  if (n <= 0) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

export default function CreatorCard({ creator, industryLabel, selected, onToggleSelect, selectDisabled, rTier, qTier, aTier }: CreatorCardProps) {
  const [open, setOpen] = useState(false)
  const initials = creator.name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <>
    <div
      role="button"
      tabIndex={0}
      onClick={() => setOpen(true)}
      onKeyDown={(e) => e.key === 'Enter' && setOpen(true)}
      className={cn(
        "group grid grid-cols-[2rem_3rem_1fr_auto] md:grid-cols-[2rem_3rem_1fr_8rem_6rem_10rem_7rem_3rem] items-center gap-3 px-4 py-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors cursor-pointer select-none",
        selected && "ring-2 ring-primary/60 ring-offset-1 bg-primary/5 hover:bg-primary/5 border-primary/40",
      )}>

      {/* Rank — colored for top 3 */}
      <span className={cn(
        "text-sm font-bold w-6 text-center tabular-nums",
        creator.rank === 1 && "text-amber-500",
        creator.rank === 2 && "text-slate-400",
        creator.rank === 3 && "text-orange-500",
        creator.rank > 3 && "text-muted-foreground",
      )}>
        #{creator.rank}
      </span>

      {/* Avatar */}
      <div className="shrink-0">
        <Avatar className="h-9 w-9">
          <AvatarImage
            src={creator.avatarUrl ?? undefined}
            alt={creator.name}
            referrerPolicy="no-referrer"
          />
          <AvatarFallback className="text-xs font-bold" style={{ backgroundColor: '#d0d9ff', color: '#060666' }}>{initials}</AvatarFallback>
        </Avatar>
      </div>

      {/* Name + handle + bio */}
      <div className="min-w-0">
        <p className="font-medium text-sm truncate">{creator.name}</p>
        <p className="text-xs text-muted-foreground truncate">@{creator.handle}</p>
        {creator.bio && (
          <p className="text-xs text-muted-foreground/70 truncate hidden sm:block">{creator.bio}</p>
        )}
      </div>

      {/* Followers — hidden on mobile */}
      <div className="hidden md:block text-right">
        <p className="text-sm font-medium">{formatFollowers(creator.instagramFollowers)}</p>
        <div className="flex items-center justify-end gap-1 mt-0.5">
          {creator.tiktokFollowers !== null && creator.tiktokFollowers > 0 && (
            <span title={`TikTok: ${formatFollowers(creator.tiktokFollowers)}`} className="text-muted-foreground/60 hover:text-muted-foreground transition-colors">
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.27 8.27 0 0 0 4.84 1.55V6.79a4.85 4.85 0 0 1-1.07-.1z"/></svg>
            </span>
          )}
          {creator.youtubeFollowers !== null && creator.youtubeFollowers > 0 && (
            <span title={`YouTube: ${formatFollowers(creator.youtubeFollowers)}`} className="text-muted-foreground/60 hover:text-muted-foreground transition-colors">
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </span>
          )}
          {creator.twitterFollowers !== null && creator.twitterFollowers > 0 && (
            <span title={`Twitter: ${formatFollowers(creator.twitterFollowers)}`} className="text-muted-foreground/60 hover:text-muted-foreground transition-colors">
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </span>
          )}
          {creator.twitchFollowers !== null && creator.twitchFollowers > 0 && (
            <span title={`Twitch: ${formatFollowers(creator.twitchFollowers)}`} className="text-muted-foreground/60 hover:text-muted-foreground transition-colors">
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg>
            </span>
          )}
          {creator.pinterestFollowers !== null && creator.pinterestFollowers > 0 && (
            <span title={`Pinterest: ${formatFollowers(creator.pinterestFollowers)}`} className="text-muted-foreground/60 hover:text-muted-foreground transition-colors">
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>
            </span>
          )}
          {!creator.tiktokFollowers && !creator.youtubeFollowers && !creator.twitterFollowers && !creator.twitchFollowers && !creator.pinterestFollowers && (
            <p className="text-xs text-muted-foreground">followers</p>
          )}
        </div>
      </div>

      {/* Engagement rate — hidden on mobile */}
      <div className="hidden md:block text-right">
        <p className="text-sm font-medium">{formatPercent(creator.engagementRate)}</p>
        <p className="text-xs text-muted-foreground flex items-center justify-end gap-0.5">
          eng. rate <MetricTooltip field="engagement_rate" />
        </p>
      </div>

      {/* Pillar badges — hidden on mobile */}
      <div className="hidden md:block">
        <ScorePillarBadge r={creator.r} q={creator.q} a={creator.a} rTier={rTier} qTier={qTier} aTier={aTier} />
      </div>

      {/* CPS score + bar */}
      <div className="text-right min-w-[5rem]">
        <div className="flex items-center justify-end gap-1 mb-1">
          <span className="text-sm font-bold">{creator.cps.toFixed(3)}</span>
          <MetricTooltip field="cps" />
        </div>
        <Progress value={creator.cps * 100} className="h-1.5" />
        <p className="text-xs text-muted-foreground mt-0.5">CPS</p>
      </div>

      {/* Compare toggle — always visible on desktop */}
      {onToggleSelect && (
        <div className="hidden md:flex items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (!selectDisabled || selected) onToggleSelect()
            }}
            className={cn(
              "p-1.5 rounded-md transition-all",
              selected
                ? "text-primary bg-primary/10 hover:bg-primary/20"
                : selectDisabled
                  ? "text-muted-foreground/25 cursor-not-allowed"
                  : "text-muted-foreground/40 hover:text-primary hover:bg-primary/10",
            )}
            aria-label={selected ? "Remove from comparison" : "Add to comparison"}
            title={
              selected ? "Remove from comparison"
              : selectDisabled ? "Max 3 creators selected"
              : "Add to comparison"
            }
          >
            <Scale className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
    <CreatorDetailSheet creator={creator} industryLabel={industryLabel} open={open} onOpenChange={setOpen} />
    </>
  )
}
