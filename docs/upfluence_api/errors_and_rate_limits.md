# Errors & Rate Limits

## HTTP Status Codes

The Upfluence API uses conventional HTTP response codes to communicate request outcomes:

| Status Code | Meaning |
| --- | --- |
| `200 OK` | Successful request. |
| `400 Bad Request` | The request was unacceptable, often due to a missing required parameter. |
| `401 Unauthorized` | No valid access token provided. |
| `402 Payment Required` | You exceeded your allocated number of API calls. |
| `404 Not Found` | The requested resource doesn't exist. |
| `500`, `502`, `503`, `504` | Something went wrong on Upfluence's end. These errors are rare. |

## Rate Limits

API calls are limited to approximately **20 requests per second** and/or **100 concurrent requests**. Exceeding these limits returns a `429 Too Many Requests` response.

### Credit-Based Limits

In addition to per-second rate limits, specific endpoints consume credits from a monthly allocation. The number of credits spent equals the number of influencers fetched (displayed or exported).

**Endpoints subject to credit limits:**

- `POST /v1/matches`
- `GET /v1/influencers/{id}`

Monthly counters reset automatically at the start of each month.

### Tracking Your Usage

Every response from a credit-consuming endpoint includes these headers:

| Header | Purpose |
| --- | --- |
| `X-Endpoint-Limit` | Total monthly credit allowance |
| `X-Endpoint-Spent` | Credits used within the past 30 days |

### Exceeding Credit Limits

When the credit allocation is exhausted the API responds with:

```
HTTP 402 Payment Required
```

```json
{"error": "Limit exceeded"}
```

Monitor the `X-Endpoint-Spent` header to track your usage and avoid hitting your limit unexpectedly.
