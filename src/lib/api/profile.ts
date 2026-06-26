import type { UpfluenceProfile } from '../types'

export async function fetchCreatorProfile(
  id: number,
  token: string,
): Promise<UpfluenceProfile | null> {
  const res = await fetch(`https://api.upfluence.co/v1/influencers/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 86400 },
  })

  if (res.status === 404) return null
  if (res.status === 429) {
    throw new Error(`Rate limit hit fetching profile ${id}`)
  }
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Profile fetch failed for ${id} (${res.status}): ${text}`)
  }

  return res.json() as Promise<UpfluenceProfile>
}
