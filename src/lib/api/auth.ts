// Module-level token cache — survives within a single ISR build invocation.
// At runtime, ISR revalidations are infrequent (≤once per 24h per route),
// so the token is re-acquired at most once per pipeline run.
let _cache: { token: string; expiresAt: number } | null = null

export async function getAccessToken(): Promise<string> {
  const now = Date.now()
  const safetyBufferMs = 60_000 // re-fetch 1 minute before expiry

  if (_cache && now < _cache.expiresAt - safetyBufferMs) {
    return _cache.token
  }

  const clientId = process.env.UPFLUENCE_CLIENT_ID
  const secretKey = process.env.UPFLUENCE_SECRET_KEY

  if (!clientId || !secretKey) {
    throw new Error('Missing UPFLUENCE_CLIENT_ID or UPFLUENCE_SECRET_KEY env vars')
  }

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: secretKey,
  })

  let res: Response | null = null
  for (let attempt = 1; attempt <= 3; attempt++) {
    res = await fetch('https://identity.upfluence.co/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
      cache: 'no-store',
    })
    if (res.status !== 429) break
    await new Promise((r) => setTimeout(r, attempt * 2000)) // 2s, 4s backoff
  }

  if (!res || !res.ok) {
    const text = await res?.text()
    throw new Error(`Upfluence auth failed (${res?.status}): ${text}`)
  }

  const data = await res.json()
  const token: string = data.access_token
  const expiresIn: number = data.expires_in ?? 900 // default 15 min

  _cache = { token, expiresAt: now + expiresIn * 1000 }
  return token
}
