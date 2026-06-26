import { unstable_cache } from 'next/cache'
import { promises as fs } from 'fs'
import path from 'path'
import { getAccessToken } from './api/auth'
import { fetchCreatorProfile } from './api/profile'
import { searchIndustryCreators } from './api/search'
import { getIndustryBySlug } from './config/industries'
import { extractRawSignals } from './scoring/signals'
import { rankCohort } from './scoring/rank'
import type { RankedCreator, RawCreatorSignals } from './types'

const BATCH_SIZE = 4      // concurrent requests per batch
const BATCH_DELAY_MS = 200 // pause between batches — keeps burst well under 20 req/s

// Persist successful pipeline results outside .next so they survive rebuilds.
const DATA_DIR = path.join(process.cwd(), '.pipeline-cache')

async function readDiskCache(slug: string): Promise<RankedCreator[] | null> {
  try {
    const file = path.join(DATA_DIR, `${slug}.json`)
    const raw = await fs.readFile(file, 'utf-8')
    return JSON.parse(raw) as RankedCreator[]
  } catch {
    return null
  }
}

async function writeDiskCache(slug: string, data: RankedCreator[]): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
    await fs.writeFile(
      path.join(DATA_DIR, `${slug}.json`),
      JSON.stringify(data),
      'utf-8',
    )
  } catch {
    // Non-fatal: write failure just means no disk backup
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchBatch(ids: number[], token: string): Promise<RawCreatorSignals[]> {
  const results = await Promise.all(
    ids.map(async (id) => {
      const profile = await fetchCreatorProfile(id, token)
      if (!profile) return null
      return extractRawSignals(profile)
    }),
  )
  return results.filter((s): s is RawCreatorSignals => s !== null)
}

async function _runPipeline(slug: string): Promise<RankedCreator[]> {
  const config = getIndustryBySlug(slug)
  if (!config) throw new Error(`Unknown industry slug: ${slug}`)

  let token: string
  try {
    token = await getAccessToken()
  } catch {
    // Auth failed — fall back to disk cache
    return (await readDiskCache(slug)) ?? []
  }

  let ids: number[]
  try {
    ids = await searchIndustryCreators(config, token)
  } catch {
    // Search failed (rate limit / credits) — fall back to disk cache
    return (await readDiskCache(slug)) ?? []
  }

  // Pass 1 — fetch profiles in parallel batches and extract signals
  const signals: RawCreatorSignals[] = []
  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const batch = ids.slice(i, i + BATCH_SIZE)
    const batchSignals = await fetchBatch(batch, token)
    signals.push(...batchSignals)
    if (i + BATCH_SIZE < ids.length) await sleep(BATCH_DELAY_MS)
  }

  if (signals.length === 0) {
    return (await readDiskCache(slug)) ?? []
  }

  // Pass 2 — normalize across cohort and rank (no API calls from here)
  const ranked = rankCohort(signals)

  // Persist to disk so future failures can serve last known good data
  await writeDiskCache(slug, ranked)

  return ranked
}

// Cache pipeline results in Next.js's server-side data cache.
// First call per slug fetches from Upfluence (~30s); subsequent calls return
// the cached result instantly until the 24h TTL expires.
export const runIndustryPipeline = unstable_cache(
  _runPipeline,
  ['industry-pipeline'],
  { revalidate: 86400 },
)
