## Assignment

Check `docs/assignment.md` for the full brief.


## Upfluence API Integration

The official Upfluence API documentation has been scraped and stored locally in Markdown format within the directory: `docs/upfluence_api`
This documentation is segregated into different `.md` files based on the category or resource (e.g., Authentication, Search, Stream, etc.).

**Mandatory rules when working with Upfluence API:**

1. **Zero hallucinations:** NEVER attempt to guess or assume the endpoints, HTTP methods, required parameters, or the JSON/Payload structures of this API. Always use the local documentation as your single source of truth.
2. **Explore the directory:** If I ask you to work on an Upfluence feature and you are unsure which file to consult, first list and review the contents of the `docs/upfluence_api` directory to identify the correct `.md` file for that category.
3. **Read before coding:** Before writing, suggesting, or modifying any code related to Upfluence, you must read the specific `.md` file of the corresponding category to ensure the implementation is perfectly accurate and up to date.
4. **Environment Variables:** All authentication with the Upfluence API must use the environment variables `UPFLUENCE_CLIENT_ID` and `UPFLUENCE_SECRET_KEY` loaded from the `.env` file. Never hardcode these keys in the source code.


## Environment Variables & Security

**Mandatory rules for handling sensitive data:**

1. **No Hardcoded Secrets:** NEVER hardcode API keys, tokens, passwords, database URIs, or any sensitive credentials directly in the source code.
2. **Use `.env` File:** Always load credentials from environment variables. Assume the project uses a `.env` file for local development. 
3. **Maintain `.env.example`:** Whenever you suggest adding a new environment variable to the project, you MUST also remind me to add it to the `.env.example` file using dummy values or descriptive placeholders (e.g., `API_KEY=your_api_key_here`).
4. **Descriptive Naming:** Always prefix environment variables with the service name to prevent collisions (e.g., use `STRIPE_SECRET_KEY` instead of just `SECRET_KEY`).


## Ranking Methodology & Scoring Pipeline

### Formula: Geometric Mean of 3 Pillars

Each creator receives a **Creator Power Score (CPS)**:

```
CPS = (R × Q × A) ^ (1/3)

Pillar R — Reach:    norm( log(followers) + 0.3 × cross_platform_bonus )
Pillar Q — Quality:  norm( engagement_rate × avg_reach_ratio )
Pillar A — Activity: norm( posts_per_week × recency_score )
```

- `avg_reach_ratio` = mean(post.reach / followers) across last ~9 posts
- `recency_score` = 1.0 if posted ≤14 days ago, 0.5 if 15–30 days, 0.0 if >30 days
- `cross_platform_bonus` = count of platforms with >1k followers
- All pillars are min-max normalized (0–1) **across the full industry cohort** before scoring

### Mandatory Two-Pass Pipeline

The API returns `null` for `engagement_rate`, `average_likes`, and `average_comments` on some profiles. Always implement scoring in two separate passes:

**Pass 1 — Raw Signal Extraction (per creator):**
1. Read `engagement_rate`, `average_likes`, `average_comments` from the platform object
2. If any are `null`, compute from `instagram_medias[]` as fallback:
   - `avg_likes = mean(post.likes)`
   - `avg_comments = mean(post.comments)`
   - `engagement_rate = (avg_likes + avg_comments) / followers`
   - `avg_reach_ratio = mean(post.reach / followers)`
3. Derive `posts_per_week` from `timestamp` fields: count posts in last 30 days ÷ 4
4. Store `community_growth_rate` (clamp to 0 minimum for growth bonus use)

Output: flat signal record per creator — **no scoring at this stage**.

**Pass 2 — Normalization & Scoring (full cohort only):**
1. Compute min/max per signal across all creators in the industry
2. Apply min-max normalization
3. Compute R, Q, A pillar scores
4. Compute `CPS = (R × Q × A) ^ (1/3)` and rank descending

**Key constraint:** Never score a creator in isolation. Normalization requires the full cohort range. Treat fetch and score as strictly separate pipeline stages.

### Confirmed Available Signals (live API test, 2026-06-24)

| Signal | API field | Nullable? |
|---|---|---|
| Followers | `instagrams[0].followers` | No |
| Engagement rate | `instagrams[0].engagement_rate` | **Yes** |
| Avg likes | `instagrams[0].average_likes` | **Yes** |
| Avg comments | `instagrams[0].average_comments` | **Yes** |
| Follower growth rate | `instagrams[0].community_growth_rate` | No |
| Engagement growth rate | `instagrams[0].engagement_growth_rate` | Yes |
| Estimated post price | `instagrams[0].recommended_price` | No |
| Per-post likes/comments/views | `instagram_medias[].likes` | No |
| Per-post reach/impressions | `instagram_medias[].reach` | No |
| Per-post timestamp | `instagram_medias[].timestamp` | No |
| TikTok/YouTube/Twitch IDs | `influencer.tiktok_id`, etc. | Yes (platform may be absent) |



## Automatic Memory & Challenge Tracking

One of the strict deliverables for this assignment is documenting "Challenges encountered and how they were solved". To ensure we don't forget anything, you must act as an automated logging system.

Whenever we experience any of the following during our coding sessions:
1. We encounter and successfully fix a complex bug.
2. We discover a limitation, strict rate limit, or unexpected data structure in the Upfluence API.
3. We make a technical tradeoff (e.g., sacrificing real-time data for performance).

**YOUR INSTRUCTION:** 
You must AUTOMATICALLY append a brief summary of the issue and our solution to the `MEMORY.md` file. You do not need to ask for my permission to do this. Just write it to the file using the following format:

- **Challenge:** [Brief description of the bug or API limitation]
- **Solution/Tradeoff:** [How we fixed it or the decision we made]