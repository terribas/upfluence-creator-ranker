# Introduction

Welcome to the **Upfluence Public API** — a set of HTTP endpoints that allow you to interact with the Upfluence platform programmatically. You can search for creators, retrieve audience and content insights, manage influencer lists, and integrate Upfluence data into your own tools and workflows.

## Overview

All requests are made over **HTTPS** and return **JSON**-encoded responses.

| Property | Description |
| --- | --- |
| **Base URL** | `https://api.upfluence.co/v1` |
| **Protocol** | HTTPS only (TLS 1.2+) |
| **Format** | JSON |
| **Auth method** | Bearer tokens (with refresh) |
| **Rate limiting** | Yes — see Rate Limits |

## Request Headers

All API requests must include the following header:

```http
Content-Type: application/json
```

This header ensures that request bodies are properly parsed and interpreted by the API.

## Core Concepts

The API is structured around a few main entities:

| Entity | Description |
| --- | --- |
| **Creator** | Represents a creator or social profile in Upfluence's database. |
| **Media** | A social post, story, or video published by an influencer. |
| **Audience** | Aggregated demographic and behavioral data related to an influencer's followers. |
| **List** | A collection of influencers created by users to manage collaborations or campaigns. |
| **Attribute / Tag** | Custom metadata you can attach to influencers to organize your data. |

You can query, filter, and combine these entities to build advanced influencer discovery and analytics workflows.

## Authentication

All API requests require a valid **access token**, issued via the Upfluence Identity Service. Each access token is scoped to a specific Upfluence application (e.g. `facade_api`, `publishr_api`, `analytics_api`).

Typical flow:

1. Request an access token using your client credentials or refresh token.
2. Use the token in the `Authorization` header of subsequent API calls.

Example:

```bash
curl -H "Authorization: Bearer <ACCESS_TOKEN>" \
  https://api.upfluence.co/v1/influencers/123
```

## Data Model and Responses

All API responses are JSON objects. A successful request returns an HTTP status `200` and a body like:

```json
{
  "id": "12345",
  "type": "influencer",
  "name": "Jane Doe",
  "platforms": ["instagram", "youtube"],
  "country": "FR"
}
```

If an error occurs, you'll receive an appropriate HTTP status code and error object.

## Versioning

All endpoints are versioned through the URL path. The current stable version is **v1**:

```http
https://api.upfluence.co/v1/
```

Breaking changes are introduced only in new versions (e.g., `/v2`).

## Rate Limits

Each application and token is subject to rate limiting. API calls are limited to approximately **20 requests per second** and/or **100 concurrent requests**. Exceeding these limits will return a `429 Too Many Requests` response.
