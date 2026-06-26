# Workflow Campaign

The Workflow Campaign category provides tools to create and manage influencer marketing campaigns, track influencer contributions, and monitor e-commerce orders linked through discount codes.

---

## Campaigns

Create and manage influencer marketing campaigns programmatically. Features include customizable briefs, compensation management, and engagement tracking.

### Fetch All Campaigns

```
GET https://publishr.upfluence.co/private/api/v1/campaigns
```

Retrieve multiple campaigns with pagination and optional search filtering.

Query parameters:
- `s` — filter by campaign name (search string)
- `page` — pagination page number
- `per_page` — results per page

```bash
curl -X GET "https://publishr.upfluence.co/private/api/v1/campaigns?page=1&per_page=20" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Fetch Campaign by ID

```
GET https://publishr.upfluence.co/private/api/v1/campaigns/{id}
```

Retrieve detailed information about a specific campaign, including the total number of influencers contacted through this campaign and its associated `stream_id`.

```bash
curl -X GET "https://publishr.upfluence.co/private/api/v1/campaigns/{campaign_id}" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Create a Campaign

```
POST https://publishr.upfluence.co/private/api/v1/campaigns
```

Create a campaign entity with the minimum required attributes. All fields can be updated later through the Upfluence web app.

```bash
curl -X POST "https://publishr.upfluence.co/private/api/v1/campaigns" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Summer Collection 2024",
    "description": "Promoting our summer fashion line"
  }'
```

---

## Contributions

View and manage influencer contributions to campaigns. Each contribution record represents a single influencer's involvement in a specific campaign initiative.

### List Contributions

```
GET https://publishr.upfluence.co/private/api/v1/contributions
```

Retrieve contribution records filtered by campaign or influencer. At least one of `campaign_id` or `influencer_id` must be provided.

Query parameters:
- `campaign_id` — filter by campaign
- `influencer_id` — filter by influencer
- `page` — pagination page number
- `per_page` — results per page

```bash
curl -X GET "https://publishr.upfluence.co/private/api/v1/contributions?campaign_id={campaign_id}" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Response data includes:**
- Influencer interest and engagement levels
- Approval status for each participation
- Pricing information
- Payment tracking details

**Contribution status values:**
- `influencer_applied` — influencer has applied
- `processing` — under review
- `client_approved` — approved by client
- `publishing` — content being published
- `payment_request_submitted` — payment requested

---

## Orders

Track e-commerce orders linked to campaigns through discount codes. Monitor order statuses, commission calculations, and influencer-driven sales metrics.

### List Campaign Orders

```
GET https://publishr.upfluence.co/private/api/v1/orders
```

Retrieves all orders associated with a campaign through discount codes, including matched discount codes and related influencer details.

Query parameters:
- `campaign_id` — filter by campaign
- `page` — pagination page number
- `per_page` — results per page

```bash
curl -X GET "https://publishr.upfluence.co/private/api/v1/orders?campaign_id={campaign_id}" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Order status values:**
- `pending` — transient state, not yet approved by the shop
- `paid` — order has been paid (partially or fully)
- `refunded` — a refund has been issued

Orders with `paid` or `pending` status count toward commission calculations.

---

## Example: Monitor Campaign Performance

A five-step workflow for tracking the performance of an active campaign.

### Step 1: Fetch All Campaigns

```bash
curl -X GET "https://publishr.upfluence.co/private/api/v1/campaigns?page=1&per_page=20" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

Use the `s` parameter to filter by campaign name.

### Step 2: Retrieve Campaign Details

```bash
curl -X GET "https://publishr.upfluence.co/private/api/v1/campaigns/{campaign_id}" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

Returns contribution statistics broken down by status.

### Step 3: View Campaign Contributions

```bash
curl -X GET "https://publishr.upfluence.co/private/api/v1/contributions?campaign_id={campaign_id}" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Step 4: Track Campaign Orders

```bash
curl -X GET "https://publishr.upfluence.co/private/api/v1/orders?campaign_id={campaign_id}" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Step 5: Analyze Influencer Performance

Cross-reference contributions with orders to calculate ROI metrics per influencer. Use unique discount codes per influencer to accurately attribute orders.

**Best practices:**
- Monitor regularly during active campaigns
- Benchmark performance across campaigns
- Segment influencers based on metrics
- Implement unique codes per influencer for accurate attribution

---

## Example: Track Campaign Content Performance

Use Upfluence Streams (linked to campaigns) to monitor social media activity and engagement metrics.

### Step 1: Fetch Campaign Details (to get stream_id)

```bash
curl -X GET "https://publishr.upfluence.co/private/api/v1/campaigns/{campaign_id}" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

The response contains a `stream_id` that connects the campaign to its monitoring stream.

### Step 2: Get Stream Information

```bash
curl -X GET "https://analytics.upfluence.co/api/v1/streams/{stream_id}" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

Returns stream configuration, followed influencers, and active keyword filters.

### Step 3: Fetch Stream Statistics

```bash
curl -X GET "https://analytics.upfluence.co/api/v1/streams/{stream_id}/stats?from=1750802400&to=1755813608" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

Returns aggregate engagement data, reach, and earned media value (EMV) for the specified time period.

### Step 4: Retrieve Stream Matches (Actual Posts)

```bash
curl -X GET "https://analytics.upfluence.co/api/v1/matches?stream_id={stream_id}&page=1&per_page=50&ordering_key=timestamp&ordering_direction=desc" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Recommended practices:**
- Monitor stream matches daily during campaigns
- Cross-reference stream posts with contribution records
- Analyze time-series engagement data for optimization insights
- Integrate stream data into external analytics platforms
