# Search

The Search category covers influencer discovery, profile retrieval, media access, list management, and all the building blocks (criterias, filters, ordering, audience filters) used to compose search queries.

---

## Influencer Search

Build sophisticated queries using full-text search criteria, demographic filters, and audience characteristics to discover creators matching your campaign needs.

### Find Influencers

```
POST https://api.upfluence.co/v1/matches
```

Search for influencers based on criteria, filters, ordering preferences, and audience characteristics.

**Request body parameters:**

| Parameter | Type | Description |
| --- | --- | --- |
| `page` | integer | Pagination page number |
| `per_page` | integer | Results per page |
| `social_media_matching_operator` | string | `"or"` or `"and"` logic across platforms |
| `criterias` | array | Full-text search conditions (see Criterias) |
| `filters` | array | Structured field filters (see Filters) |
| `audience_filters` | array | Audience demographic filters (see Audience Filters) |
| `ordering` | object | Sort field and direction (see Ordering) |

**Example request:**

```bash
curl -X POST "https://api.upfluence.co/v1/matches" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "page": 1,
    "per_page": 20,
    "social_media_matching_operator": "or",
    "criterias": [
      {"type": "should", "field": "all", "value": "fashion beauty"}
    ],
    "filters": [
      {"type": "multi-string", "field": "influencer.geo_country", "value": ["US"]},
      {"type": "range-int", "field": "instagram.followers", "value": {"from": 50000, "to": 500000}},
      {"type": "average-engagement", "field": "instagram", "order": ">", "isPercent": true, "value": 3}
    ],
    "audience_filters": [
      {"field": "audience.country.US", "value": 0.5, "order": ">"},
      {"field": "audience.gender.female", "value": 0.6, "order": ">"}
    ],
    "ordering": {"value": "relevancy", "direction": "desc"}
  }'
```

### Get Influencer Statistics

```
POST https://api.upfluence.co/v1/counts
```

Retrieve aggregated statistics and distributions for matching influencers, including counts and breakdowns across geography, language, reach, and audience demographics.

---

## Influencer Profile

### View Influencer Profile

```
GET https://api.upfluence.co/v1/influencers/{id}
```

Retrieve complete profile data for a specific influencer, including personal details, social media accounts, and cross-platform content.

```bash
curl -X GET "https://api.upfluence.co/v1/influencers/{influencer_id}" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Lookup Influencer by Social URL

```
GET https://api.upfluence.co/v1/influencers/lookup
```

Search for an influencer profile using a social media URL. Supports Instagram, YouTube, TikTok, Pinterest, Twitch, and Twitter. Returns `404` if no match is found.

```bash
curl -X GET "https://api.upfluence.co/v1/influencers/lookup?url=https://www.instagram.com/username" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Ingest Influencer Profile

```
POST https://api.upfluence.co/v1/influencers/ingest
```

Create or update an influencer profile by providing a valid social media URL. Returns `422` if the social profile cannot be processed.

```bash
curl -X POST "https://api.upfluence.co/v1/influencers/ingest" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.instagram.com/username"}'
```

### Fetch Audience Data

```
GET https://api.upfluence.co/v1/audience
```

Obtain detailed audience demographics including age distribution, gender split, geographic locations, and authenticity metrics (fake follower risk).

```bash
curl -X GET "https://api.upfluence.co/v1/audience?influencer_id={influencer_id}" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Influencer Overlays

Overlays let you add tags for categorization, merge fields for personalized templating, and custom attributes to extend profile data with business-specific information without modifying the core profile structure.

### Tags

**Fetch Tags**
```
GET https://api.upfluence.co/v1/influencers/{id}/tags
```

**Manage Tags**
```
POST https://api.upfluence.co/v1/influencers/{id}/tags
```

Body:
```json
{
  "upsert_tags": ["fashion", "lifestyle", "vip-tier"],
  "delete_tags": ["pending-review"]
}
```

Tags in `upsert_tags` are added or updated; tags in `delete_tags` are removed. Both operations are atomic. Tags must be non-empty strings.

### Merge Fields

**Fetch Merge Fields**
```
GET https://api.upfluence.co/v1/influencers/{id}/merge_fields
```

**Manage Merge Fields**
```
POST https://api.upfluence.co/v1/influencers/{id}/merge_fields
```

Body:
```json
{
  "upsert_merge_fields": [
    {"slug": "instagram_recommend_price", "name": "Instagram Recommended Price", "value": "125€"}
  ],
  "delete_merge_fields": ["old_field_slug"]
}
```

Validation rules: `name`, `value`, and `slug` must all be non-empty strings; `slug` must not contain whitespace.

### Custom Attributes

**Fetch Attributes**
```
GET https://api.upfluence.co/v1/influencers/{id}/attributes
```

**Manage Attributes**
```
POST https://api.upfluence.co/v1/influencers/{id}/attributes
```

Body:
```json
{
  "upsert_fields": [
    {"key": "email", "value": "contact@influencer.com"},
    {"key": "rating", "value": 5},
    {"key": "gender", "value": "female"}
  ],
  "discard_fields": ["last_name"]
}
```

Valid attribute keys: `email`, `name`, `first_name`, `last_name`, `address`, `phone_number`, `country`, `rating` (1–5), `gender` (male/female/other), `shipping_address`.

---

## Lists

Organize influencers into custom collections aligned with campaigns, niches, or other workflow preferences.

### Endpoints

| Operation | Method | URL |
| --- | --- | --- |
| View all lists | GET | `https://api.upfluence.co/v1/lists` |
| Create a list | POST | `https://api.upfluence.co/v1/lists` |
| View a list | GET | `https://api.upfluence.co/v1/lists/{id}` |
| Update a list | PUT | `https://api.upfluence.co/v1/lists/{id}` |
| Delete a list | DELETE | `https://api.upfluence.co/v1/lists/{id}` |

**Create a list:**
```bash
curl -X POST "https://api.upfluence.co/v1/lists" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"list": {"name": "Summer Fashion Campaign 2024"}}'
```

---

## List Entries

Control the membership of your influencer collections with granular entry-level operations.

### Endpoints

| Operation | Method | URL |
| --- | --- | --- |
| View list entries | GET | `https://api.upfluence.co/v1/list_entries` |
| Add influencer to list | POST | `https://api.upfluence.co/v1/list_entries` |
| View a list entry | GET | `https://api.upfluence.co/v1/list_entries/{id}` |
| Delete a list entry | DELETE | `https://api.upfluence.co/v1/list_entries/{id}` |

**Add influencer to list:**
```bash
curl -X POST "https://api.upfluence.co/v1/list_entries" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"list_entry": {"list_id": 153395, "influencer_id": 12986860}}'
```

List entries are created with a `selected` status by default. The same influencer can be added to multiple lists.

---

## Medias (Social Posts)

Access social media content from influencers across multiple platforms to analyze engagement patterns and content performance.

### Endpoints

| Platform | Method | URL |
| --- | --- | --- |
| Instagram | GET | `https://api.upfluence.co/v1/instagram_medias` |
| YouTube | GET | `https://api.upfluence.co/v1/youtube_videos` |
| Pinterest | GET | `https://api.upfluence.co/v1/pins` |
| Twitter | GET | `https://api.upfluence.co/v1/tweets` |
| TikTok | GET | `https://api.upfluence.co/v1/tiktok_videos` |
| Twitch | GET | `https://api.upfluence.co/v1/twitch_streams` |

Each endpoint accepts the platform-specific ID (e.g., `instagram_id`, `youtube_id`) as a query parameter.

**Example — fetch Instagram posts:**
```bash
curl -X GET "https://api.upfluence.co/v1/instagram_medias?instagram_id={instagram_id}&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Media Analytics

Analyze engagement patterns, growth trends, and content performance metrics across social media platforms.

### Retrieve Brand Mentions

```
GET https://api.upfluence.co/v1/media/mentions
```

Provides insights about brand mentions for a social media account. Currently supports Instagram and TikTok.

Query parameters:
- `media_type` — `instagram` or `tiktok`
- `media_id` — the platform-specific identifier (e.g., `instagram_id`, `tiktok_id`)

```bash
curl -X GET "https://api.upfluence.co/v1/media/mentions?media_type=instagram&media_id={instagram_id}" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Retrieve Time-Series Statistics

```
GET https://api.upfluence.co/v1/media/stats
```

Returns comprehensive time series statistics including engagement patterns throughout the week, follower growth trends, and posting frequency.

Query parameters:
- `media_id` — the platform-specific identifier

```bash
curl -X GET "https://api.upfluence.co/v1/media/stats?media_id={instagram_id}" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Tags

Tags help categorize and organize influencers and content across the platform.

### Get Available Tags

```
GET https://api.upfluence.co/v1/tags
```

Retrieve all tags available within the system.

```bash
curl -X GET "https://api.upfluence.co/v1/tags" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Search Terminology

### Criterias

A **criteria** is a predicate enabling full-text search across specific influencer profile fields or the complete profile. It affects both matching and relevancy in search requests.

**Payload structure:**
```json
{
  "field": "all",
  "type": "should",
  "weight": 1,
  "value": "technology"
}
```

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `field` | string | No | Profile field to search; `"all"` searches every indexed field |
| `type` | string | No | Clause type: `should`, `must`, or `must_not` |
| `weight` | number | No | Relevancy boost (positive float); higher = more important |
| `value` | string | Yes | The search term(s) to locate |

**Searchable fields include:**
- `all` (full profile search)
- `social_media.username`, `influencer.name`, `influencer.hashtags`
- YouTube: channel name, username, description, video titles/descriptions
- Instagram: username, website, biography, post captions
- Twitter: name, screen_name, bio, tweet content
- Twitch: username, description, stream titles/games
- Pinterest: username, bio, pin titles/descriptions
- TikTok: display name, nickname, biography, video titles

**Clause types:**
- `should` — optional; boosts relevancy without requiring a match
- `must` — required; only returns results that match
- `must_not` — filters out results that match

---

### Filters

Filters apply exact-match constraints on structured data fields. They are commonly paired with criterias in `POST /v1/matches` requests.

#### String Filter

Matches an exact string value within a specified field.

```json
{
  "type": "string",
  "field": "influencer.geo_country",
  "value": "US",
  "negative": false
}
```

Valid fields: `influencer.lang`, `influencer.geo_country`

---

#### Multi String Filter

Matches one of several string values (SQL `IN` logic).

```json
{
  "type": "multi-string",
  "field": "influencer.geo_country",
  "value": ["CA", "US", "GB"]
}
```

Valid fields: `influencer.lang`, `influencer.geo_country`, `influencer.age_bracket`

---

#### Int Filter

Performs integer comparisons on numeric fields.

```json
{
  "type": "int",
  "field": "twitter.followers",
  "value": 1500,
  "order": ">",
  "negative": false
}
```

`order` options: `>`, `<`, `=`

Valid fields span follower counts, engagement rates, average views/likes/comments/engagements, content timestamps, and growth rates across YouTube, Instagram, Twitter, Pinterest, Twitch, and TikTok.

---

#### Multi Int Filter

Matches one of several integer values; ideal for specific influencer ID targeting.

```json
{
  "type": "multi-int",
  "field": "influencer.id",
  "value": [1757, 575752, 37575],
  "negative": false
}
```

---

#### Existence Filter

Validates whether a specified field contains data.

```json
{
  "type": "existence",
  "field": "influencer.email",
  "value": "with"
}
```

`value` options: `"with"` (field is populated) or `"without"` (field is empty)

---

#### Geocoded Filter

Locates influencers within a geographic radius.

```json
{
  "type": "geocoded",
  "field": "influencer.geo_coordinates",
  "value": "San Francisco",
  "radius": 100
}
```

`radius` is in kilometers.

---

#### Range Int Filter

Filters numeric values within specified boundaries.

```json
{
  "type": "range-int",
  "field": "instagram.followers",
  "value": {"from": 1000, "to": 20000}
}
```

---

#### Range Date Filter

Filters content by creation timestamp within relative time windows.

```json
{
  "type": "range-date",
  "field": "instagram.medias.timestamp",
  "order": ">",
  "value": "3mo"
}
```

Valid time ranges: `week` (7 days), `month` (30 days), `3mo` (90 days), `year` (365 days)

Valid fields: `youtube.videos.timestamp`, `instagram.medias.timestamp`, `twitter.tweets.timestamp`, `pinterest.pins.timestamp`, `twitch.streams.timestamp`, `tiktok.tiktok_videos.timestamp`

---

#### Average Engagement Filter

Evaluates platform engagement metrics using percentage or absolute values.

```json
{
  "type": "average-engagement",
  "field": "instagram",
  "order": ">",
  "isPercent": true,
  "value": 1
}
```

Valid fields: `instagram`, `youtube`, `twitter`, `tiktok`, `pinterest`

---

#### Exclude Lists Filter

Removes influencers from specified saved lists.

```json
{
  "type": "exclude-lists",
  "value": [229264]
}
```

---

#### Include Lists Filter

Restricts results to influencers within specified lists.

```json
{
  "type": "include-lists",
  "value": [229264]
}
```

---

### Audience Filters

Audience Filters allow you to search influencers based on specific characteristics of their audience, such as geographic location, gender distribution, or age demographics.

**Payload structure:**
```json
{
  "field": "audience.country.US",
  "value": 0.9,
  "order": ">"
}
```

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `field` | string | Yes | Demographic characteristic to filter on |
| `value` | number | Yes | Decimal between 0–1 (e.g., `0.75` = 75%); maximum value is 1 |
| `order` | string | Yes | Comparison operator: `>`, `<`, or `=` |

**Available fields:**

| Field | Purpose |
| --- | --- |
| `audience.gender.male` | Male audience percentage |
| `audience.gender.female` | Female audience percentage |
| `audience.age.18-24` | Audience aged 18–24 |
| `audience.age.25-34` | Audience aged 25–34 |
| `audience.age.35-54` | Audience aged 35–54 |
| `audience.country.{CODE}` | Audience percentage by country (2-letter ISO code) |

---

### Ordering

Defines the sorting direction for influencer search results. When no ordering is specified, results default to `relevancy`.

**Payload structure:**
```json
{
  "value": "relevancy",
  "direction": "desc"
}
```

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `value` | string | No | Field/metric to sort by. Default: `relevancy` |
| `direction` | string | No | `asc` or `desc`. Default: `desc` |

**Sortable fields (46 total):**

- `relevancy`, `influencer.score`
- **YouTube:** `youtube.engagement_rate`, `youtube.views`, `youtube.followers`, `youtube.average_views`, `youtube.average_engagements`, `youtube.average_likes`, `youtube.videos.timestamp`, `youtube.community_growth_rate`, `youtube.engagement_growth_rate`
- **Instagram:** `instagram.engagement_rate`, `instagram.followers`, `instagram.average_engagements`, `instagram.average_comments`, `instagram.average_likes`, `instagram.medias.timestamp`, `instagram.community_growth_rate`, `instagram.engagement_growth_rate`
- **Twitter:** `twitter.engagement_rate`, `twitter.followers`, `twitter.average_engagements`, `twitter.average_retweets`, `twitter.tweets.timestamp`, `twitter.community_growth_rate`, `twitter.engagement_growth_rate`
- **Pinterest:** `pinterest.engagement_rate`, `pinterest.followers`, `pinterest.average_repins`, `pinterest.average_engagements`, `pinterest.average_likes`, `pinterest.pins.timestamp`, `pinterest.community_growth_rate`, `pinterest.engagement_growth_rate`
- **Twitch:** `twitch.followers`, `twitch.views`, `twitch.streams.timestamp`
- **TikTok:** `tiktok.followers`, `tiktok.average_engagements`, `tiktok.average_likes`, `tiktok.average_comments`, `tiktok.average_shares`, `tiktok.average_plays`, `tiktok.tiktok_videos.timestamp`, `tiktok.community_growth_rate`, `tiktok.engagement_growth_rate`

> Sort by `relevancy` to get the most relevant influencers first based on your search criteria.

---

## Example: Search and Analyze Influencers

A five-step workflow for discovering and vetting fashion influencers.

### Step 1: Search for Influencers

```bash
curl -X POST "https://api.upfluence.co/v1/matches" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "page": 1,
    "per_page": 20,
    "social_media_matching_operator": "or",
    "criterias": [
      {"type": "should", "field": "all", "value": "fashion beauty"}
    ],
    "filters": [
      {"type": "multi-string", "field": "influencer.geo_country", "value": ["US"]},
      {"type": "range-int", "field": "instagram.followers", "value": {"from": 50000, "to": 500000}},
      {"type": "average-engagement", "field": "instagram", "order": ">", "isPercent": true, "value": 3}
    ],
    "audience_filters": [
      {"field": "audience.country.US", "value": 0.5, "order": ">"},
      {"field": "audience.gender.female", "value": 0.6, "order": ">"}
    ],
    "ordering": {"value": "relevancy", "direction": "desc"}
  }'
```

### Step 2: Get Detailed Profile

```bash
curl -X GET "https://api.upfluence.co/v1/influencers/{influencer_id}" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Step 3: Analyze Audience Demographics

```bash
curl -X GET "https://api.upfluence.co/v1/audience?influencer_id={influencer_id}" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Step 4: Examine Instagram Content

```bash
curl -X GET "https://api.upfluence.co/v1/instagram_medias?instagram_id={instagram_id}&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Step 5: Analyze Brand Partnerships

```bash
curl -X GET "https://api.upfluence.co/v1/media/mentions?media_type=instagram&media_id={instagram_id}&limit=5" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Example: Manage Influencer Lists

### 1. Create a New List

```bash
curl -X POST "https://api.upfluence.co/v1/lists" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"list": {"name": "Summer Fashion Campaign 2024"}}'
```

### 2. Add Influencers to the List

```bash
curl -X POST "https://api.upfluence.co/v1/list_entries" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"list_entry": {"list_id": 153395, "influencer_id": 12986860}}'
```

### 3. View All List Entries

```bash
curl -X GET "https://api.upfluence.co/v1/list_entries?list_id={list_id}&page=1&per_page=50" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### 4. Update List Information

```bash
curl -X PUT "https://api.upfluence.co/v1/lists/{list_id}" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"list": {"name": "Summer Fashion Campaign 2024 - Final Selection"}}'
```

### 5. Remove an Influencer from the List

```bash
curl -X DELETE "https://api.upfluence.co/v1/list_entries/{list_entry_id}" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

---

## Example: Enrich an Influencer Profile

### Step 1: View Current Tags

```bash
curl -X GET "https://api.upfluence.co/v1/influencers/{influencer_id}/tags" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Step 2: Add and Remove Tags

```bash
curl -X POST "https://api.upfluence.co/v1/influencers/{influencer_id}/tags" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "upsert_tags": ["fashion", "lifestyle", "vip-tier"],
    "delete_tags": ["pending-review"]
  }'
```

### Step 3: View Current Merge Fields

```bash
curl -X GET "https://api.upfluence.co/v1/influencers/{influencer_id}/merge_fields" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Step 4: Add Merge Fields (Pricing, etc.)

```bash
curl -X POST "https://api.upfluence.co/v1/influencers/{influencer_id}/merge_fields" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "upsert_merge_fields": [
      {"slug": "instagram_recommend_price", "name": "Instagram Recommended Price", "value": "125€"},
      {"slug": "preferred_contact_method", "name": "Preferred Contact Method", "value": "email"}
    ],
    "delete_merge_fields": ["old_pricing_field"]
  }'
```

### Step 5: View Custom Attributes

```bash
curl -X GET "https://api.upfluence.co/v1/influencers/{influencer_id}/attributes" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Step 6: Add Custom Attributes

```bash
curl -X POST "https://api.upfluence.co/v1/influencers/{influencer_id}/attributes" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "upsert_fields": [
      {"key": "first_name", "value": "Sarah"},
      {"key": "email", "value": "sarah.influencer@example.com"},
      {"key": "rating", "value": 5},
      {"key": "phone_number", "value": "+33102030405"}
    ],
    "discard_fields": ["last_name"]
  }'
```

**Best practices:**
- Use tags for high-level categorization (niches, campaigns, tiers, statuses)
- Use merge fields for structured metadata (pricing, preferences, campaign-specific data)
- Use attributes to override or supplement profile data with verified contact information
- Establish naming conventions for tags and merge field slugs across your organization
- Merge field slugs must not contain whitespace
