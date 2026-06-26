'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Users, Sparkles, Zap, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const PILLARS = [
  {
    icon: Users,
    letter: 'R',
    name: 'Reach',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    tagline: 'How far can this creator spread your message?',
    benefit: 'Goes beyond raw follower count — creators with a presence across multiple platforms get a bonus, because their content reaches wider audiences.',
    factors: [
      { label: 'Follower count', desc: 'Size of their primary Instagram audience, scaled to reduce the advantage of outliers with inflated numbers.' },
      { label: 'Multi-platform presence', desc: 'Bonus for each additional platform (TikTok, YouTube, Twitch…) where they have over 1K followers.' },
    ],
  },
  {
    icon: Sparkles,
    letter: 'Q',
    name: 'Quality',
    color: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
    tagline: 'Is their audience genuinely paying attention?',
    benefit: 'Measures real engagement against actual post reach, not just follower count. A creator with 50K active fans can outrank one with 500K passive followers.',
    factors: [
      { label: 'Engagement rate', desc: 'Average likes and comments per post relative to their follower count.' },
      { label: 'Post reach ratio', desc: 'How many of their followers actually see each post — not just how many could.' },
    ],
  },
  {
    icon: Zap,
    letter: 'A',
    name: 'Activity',
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    tagline: 'Are they consistently showing up?',
    benefit: 'Rewards creators who post regularly and recently. An influencer who hasn\'t posted in over a month scores lower — because stale content means less visibility for your brand.',
    factors: [
      { label: 'Posting frequency', desc: 'Average number of posts per week over the last 30 days.' },
      { label: 'Recency', desc: 'Full score if they posted in the last 2 weeks, half if within a month, zero if inactive beyond that.' },
    ],
  },
]

export default function CpsInfoModal({ open, onOpenChange }: Props) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onOpenChange(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onOpenChange])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      <div className="absolute inset-0 overflow-y-auto flex items-start justify-center p-4 sm:p-8">
        <div className="relative w-full max-w-2xl rounded-xl border bg-background shadow-2xl my-4">

          {/* Header */}
          <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b">
            <div>
              <h2 className="text-base font-bold">Creator Power Score (CPS)</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                A smarter way to find creators who actually deliver results
              </p>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-5">

            {/* Value prop */}
            <p className="text-sm text-muted-foreground leading-relaxed">
              Follower counts alone are misleading. CPS combines <strong className="text-foreground">reach</strong>,{' '}
              <strong className="text-foreground">audience quality</strong>, and{' '}
              <strong className="text-foreground">posting consistency</strong> into a single score —
              so you can compare creators fairly within their industry.
            </p>

            {/* Pillars */}
            <div className="space-y-3">
              {PILLARS.map(({ icon: Icon, letter, name, color, tagline, benefit, factors }) => (
                <div key={letter} className="rounded-lg border px-4 py-3.5 space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className={`inline-flex items-center justify-center h-7 w-7 rounded-md shrink-0 ${color}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold leading-tight">{name}</p>
                      <p className="text-xs text-muted-foreground">{tagline}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground pl-9 leading-relaxed">{benefit}</p>
                  <ul className="pl-9 space-y-1.5">
                    {factors.map(f => (
                      <li key={f.label} className="text-xs flex gap-1.5">
                        <span className="shrink-0 font-medium text-foreground">{f.label}:</span>
                        <span className="text-muted-foreground">{f.desc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Why geometric mean */}
            <div className="rounded-md border px-4 py-3 flex gap-3">
              <ShieldCheck className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">No shortcuts.</span>{' '}
                The three pillars are multiplied together — so a creator who excels at one but fails
                at the others won&apos;t rank high. Every dimension must be strong.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
