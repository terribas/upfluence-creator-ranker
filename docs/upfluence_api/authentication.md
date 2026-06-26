# Authentication

The Upfluence API uses **Bearer access tokens** for authentication and authorization across all its applications. The system uses short-lived access tokens paired with renewable refresh tokens, each scoped to specific applications.

## Key Properties

| Property | Details |
| --- | --- |
| Auth Server | `https://identity.upfluence.co` |
| Token Endpoint | `/token` |
| Token Type | Bearer |
| Supported Grant Types | `client_credentials`, `refresh_token` |
| Default Lifetime | 15 minutes (configurable) |
| Maximum Lifetime | 30 days |

## Authentication Endpoints

Both operations use the same endpoint with different grant types:

- **Get Access Token** — `POST https://identity.upfluence.co/token`
- **Refresh Access Token** — `POST https://identity.upfluence.co/token`

### Get Access Token (client_credentials)

```bash
curl -X POST "https://identity.upfluence.co/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials&client_id=YOUR_CLIENT_ID&client_secret=YOUR_CLIENT_SECRET"
```

### Refresh Access Token

```bash
curl -X POST "https://identity.upfluence.co/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=refresh_token&refresh_token=YOUR_REFRESH_TOKEN&client_id=YOUR_CLIENT_ID"
```

## Using the Token

Once you've obtained a valid token, include it in the `Authorization` header for each request:

```bash
curl -H "Authorization: Bearer <ACCESS_TOKEN>" \
  https://api.upfluence.co/v1/influencers/42
```

Alternatively, you can pass the token as a URL query parameter (not recommended):

```bash
curl "https://api.upfluence.co/v1/influencers/42?access_token=<ACCESS_TOKEN>"
```

> **Important:** Always prefer the `Authorization` header. Tokens in URLs can be logged in server logs or browser history.

## Token Lifetime and Renewal

- Default validity: **15 minutes**
- Configurable up to **30 days** via the `token_lifetime` parameter
- Tokens are automatically revoked upon expiration
- Use the `refresh_token` grant type to obtain a new access token without re-authenticating with client credentials
- Always store both the `access_token` and `refresh_token` securely

## Revoking Tokens

Tokens are automatically revoked when they expire or are manually invalidated via the Upfluence platform. Contact your Upfluence admin if you need to revoke tokens manually.
