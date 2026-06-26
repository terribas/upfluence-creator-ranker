# Stream

Streams allow you to monitor and collect social media posts based on specific filters like keywords, influencers, post types, and date ranges. They function as automated monitoring systems that continuously track social media content based on your specified criteria.

---

## Stream Management

Create, configure, and manage streams to monitor influencer activity and social media content.

### How Streams Work

Streams match posts against specified filters and conditions:

- **Keywords** — track hashtags, usernames, or text strings
- **Influencers** — monitor specific influencer accounts
- **Post Types** — filter by content type (tweets, Instagram posts, YouTube videos, etc.)
- **Date Ranges** — set publication date boundaries
- **Analytics** — configure CPM and campaign expenses to calculate EMV and ROI

**Keyword matching logic:**
- A post containing "My #car is awesome" **will** match keywords `[car, otherkeywords]`
- The same post **won't** match if keywords are `[car]` with exclude condition `[awesome]`

### Endpoints

| Operation | Method | URL |
| --- | --- | --- |
| Fetch all streams | GET | `https://analytics.upfluence.co/api/v1/streams` |
| Fetch stream | GET | `https://analytics.upfluence.co/api/v1/streams/{id}` |
| Create stream | POST | `https://analytics.upfluence.co/api/v1/streams` |
| Edit stream | PUT | `https://analytics.upfluence.co/api/v1/streams/{id}` |
| Toggle stream state | PUT | `https://analytics.upfluence.co/api/v1/streams/{id}/toggle` |
| Archive stream | DELETE | `https://analytics.upfluence.co/api/v1/streams/{id}` |

### Fetch All Streams

```
GET https://analytics.upfluence.co/api/v1/streams
```

Fetch multiple streams with optional pagination and search filtering.

```bash
curl -X GET "https://analytics.upfluence.co/api/v1/streams?page=1&per_page=20" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Fetch Stream

```
GET https://analytics.upfluence.co/api/v1/streams/{id}
```

Retrieve the full definition and configuration of a specific stream, including its filters and settings.

```bash
curl -X GET "https://analytics.upfluence.co/api/v1/streams/{stream_id}" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Create Stream

```
POST https://analytics.upfluence.co/api/v1/streams
```

Create a new stream to monitor social media posts based on filters.

```bash
curl -X POST "https://analytics.upfluence.co/api/v1/streams" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Brand Mentions Monitor",
    "post_types": ["instagram_media", "tweet", "tiktok_video", "youtube_video"],
    "keyword_filters": [
      {"field_type": "content", "condition": "include", "value": "yourbrand"}
    ],
    "auto_start": true
  }'
```

Accepted `post_types`: `instagram_media`, `tweet`, `tiktok_video`, `youtube_video`

### Edit Stream

```
PUT https://analytics.upfluence.co/api/v1/streams/{id}
```

Edit a stream to update its filters and configuration.

### Toggle Stream State

```
PUT https://analytics.upfluence.co/api/v1/streams/{id}/toggle
```

Turn on or off the recording of the stream to pause or resume data collection without deleting it.

### Archive Stream

```
DELETE https://analytics.upfluence.co/api/v1/streams/{id}
```

Archive a stream to stop data collection and mark it as archived.

---

## Stream Following

Manage which influencers a stream monitors.

### Fetch Stream Followings

```
GET https://analytics.upfluence.co/api/v1/followings
```

Retrieve the list of influencers being followed by a stream, along with their complete profile data and social media accounts.

```bash
curl -X GET "https://analytics.upfluence.co/api/v1/followings?stream_id={stream_id}" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Add Followings to Stream

```
POST https://analytics.upfluence.co/api/v1/followings
```

Add influencers to follow in a stream. The stream will monitor posts from these influencers based on the configured filters.

```bash
curl -X POST "https://analytics.upfluence.co/api/v1/followings" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "stream_id": "{stream_id}",
    "influencer_id": "{influencer_id}"
  }'
```

### Remove Following from Stream

```
DELETE https://analytics.upfluence.co/api/v1/followings/{id}
```

Remove an influencer from a stream's following list. The stream will stop monitoring posts from this influencer.

```bash
curl -X DELETE "https://analytics.upfluence.co/api/v1/followings/{following_id}" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

---

## Stream Content

Fetch matched posts or manually import specific posts into your streams.

### Retrieve Stream Matches

```
GET https://analytics.upfluence.co/api/v1/matches
```

Obtain posts that matched stream filter criteria, including full social profile details and performance metrics.

```bash
curl -X GET "https://analytics.upfluence.co/api/v1/matches?stream_id={stream_id}&page=1&per_page=50&ordering_key=timestamp&ordering_direction=desc" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

Query parameters:
- `stream_id` — the stream to query
- `page` — pagination page number
- `per_page` — results per page
- `ordering_key` — `timestamp` (latest) or `engagement` (top-performing)
- `ordering_direction` — `asc` or `desc`

### Add Posts to Stream

```
POST https://analytics.upfluence.co/api/v1/matches/import
```

Manually add a specific social media post to your stream using its URL. The system validates the URL format and assesses post-type compatibility.

```bash
curl -X POST "https://analytics.upfluence.co/api/v1/matches/import" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.instagram.com/p/POST_ID/"}'
```

---

## Stream Analytics

Access comprehensive performance metrics including engagement rates, reach, impressions, EMV (Earned Media Value), and ROI calculations with time-series breakdowns.

### Fetch Stream Stats

```
GET https://analytics.upfluence.co/api/v1/streams/{id}/stats
```

Obtain comprehensive statistics for a specific stream, including engagement data, audience reach, and earned media value categorized by post type.

```bash
curl -X GET "https://analytics.upfluence.co/api/v1/streams/{stream_id}/stats?from=1750802400&to=1755813608" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

Query parameters:
- `from` — Unix UTC timestamp for start of period
- `to` — Unix UTC timestamp for end of period
- `influencer_ids` — (optional) filter stats for specific creators

---

## Example: Brand Social Listening

A five-step workflow for monitoring brand mentions across social platforms.

### Step 1: Create a Brand Monitoring Stream

```bash
curl -X POST "https://analytics.upfluence.co/api/v1/streams" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Brand Mention Tracker",
    "post_types": ["instagram_media", "tweet", "tiktok_video", "youtube_video"],
    "keyword_filters": [
      {"field_type": "content", "condition": "include", "value": "yourbrand"},
      {"field_type": "content", "condition": "include", "value": "@yourbrand"},
      {"field_type": "content", "condition": "include", "value": "#yourbrand"}
    ],
    "auto_start": true
  }'
```

Include multiple keyword variations: brand name, @handles, hashtags, and common misspellings.

### Step 2: Add Key Influencers to Track

```bash
curl -X POST "https://analytics.upfluence.co/api/v1/followings" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"stream_id": "{stream_id}", "influencer_id": "{influencer_id}"}'
```

The stream will monitor all posts from followed influencers, even if they don't explicitly mention your brand keywords.

### Step 3: Retrieve Stream Matches

```bash
curl -X GET "https://analytics.upfluence.co/api/v1/matches?stream_id={stream_id}&page=1&per_page=50" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

Returns posts with complete engagement data: likes, comments, shares, views, influencer profile information.

### Step 4: Analyze Brand Mention Performance

```bash
curl -X GET "https://analytics.upfluence.co/api/v1/streams/{stream_id}/stats?from=UNIX_FROM&to=UNIX_TO" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

Returns aggregate statistics: total impressions, engagement rates, earned media value (EMV) by post type.

### Step 5: Monitor Stream Configuration

```bash
curl -X GET "https://analytics.upfluence.co/api/v1/streams/{stream_id}" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

Verify stream settings, active keyword filters, followed influencers, and total post counts.

**Best practices:**
- Include multiple keyword variations (brand name, @handles, hashtags, misspellings)
- Configure platform-specific filters (each platform uses different field types)
- Create separate streams for competitor monitoring
- Prioritize responses to high-engagement content
