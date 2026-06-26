# Credits

The Credits API lets you monitor API token consumption and check your remaining available credits.

## Overview

Each API call that fetches influencer data consumes credits. You can use this endpoint to:

1. **Monitor consumption** — Track how many tokens you've used
2. **Check availability** — See your remaining token balance
3. **Plan usage** — Ensure you have sufficient credits for your workflows

## Endpoint

### Get API User Credits

```
GET https://identity.upfluence.co/credits
```

Retrieves the current token usage credits for an authenticated API user.

```bash
curl -X GET "https://identity.upfluence.co/credits" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Credit Consumption Rules

Credits are consumed by the following operations:

- `POST /v1/matches` — each influencer fetched consumes one credit
- `GET /v1/influencers/{id}` — each profile retrieved consumes one credit

Monthly credit counters reset automatically on the first day of each month.

## Usage Tracking via Response Headers

Every API response includes headers for real-time credit monitoring:

| Header | Purpose |
| --- | --- |
| `X-Endpoint-Limit` | Total monthly credit allocation |
| `X-Endpoint-Spent` | Credits used within the past 30 days |

When your credit allocation is exhausted, the API responds with HTTP `402 Payment Required` and:

```json
{"error": "Limit exceeded"}
```

Monitor the `X-Endpoint-Spent` header proactively to avoid hitting your limit unexpectedly.
