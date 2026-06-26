
# Making of — Upfluence Creator Ranker

## Step 1 - Security first!

Before writing a single line of app code, let's talk about secrets. The project needed an Upfluence API client ID and secret key, and the temptation to just paste them directly into the source is real — but also a great way to accidentally push credentials to a public repo and have a bad day.

So the first thing I did was create a `.env` file at the project root and drop the keys in there. Standard stuff. But since I was working with an AI assistant throughout the project, I also added a dedicated **"Environment Variables & Security"** section to `CLAUDE.md` (the file Claude reads as its project-level instructions) to make it crystal clear that secrets must always live in `.env` and never be hardcoded. No exceptions, no shortcuts. Claude got the memo and followed it throughout every session.

This matters more than it sounds. By experience, if you don't set this boundary explicitly, Claude will sometimes just drop a placeholder directly in the source - something like `const API_KEY = "your_api_key_here"` right there in the file. Technically it compiles, but it's one distracted commit away from leaking credentials, and it sets a bad precedent for the rest of the codebase.


## Step 2 - Scraping the API into readable markdowns

We all know Claude's token usage is getting more expensive over time, so feeding it the full Upfluence API documentation on every single request wasn't really an option. Instead, I had Claude scrape the official docs and save them locally as `.md` files — one per category (Authentication, Search, Influencers, etc.) — inside `docs/upfluence_api/`.

The idea: read once, reference many times. Every future prompt that needs to know how an endpoint works can just point to the local file instead of burning tokens re-fetching or (worse) hallucinating an endpoint that doesn't exist.

The prompt was something along these lines:

```
Go to https://docs.upfluence.co/docs/introduction and scrape the full API documentation.
Save it locally under docs/upfluence_api/, splitting the content into separate .md files by category
(e.g., authentication.md, search.md, influencers.md, stream.md, etc.).
Keep the content faithful to the source — don't summarize, just clean up the formatting for readability.
```

I then added a rule to `CLAUDE.md` instructing Claude to always consult these files before writing any API-related code. Zero hallucinations, zero guessing — the local docs are the single source of truth.


## Step 3 - (Letting Claude) Explore the API

Here's something a lot of people skip: actually checking what data the API returns before designing the whole application around assumptions.

In this case, I handed that job straight to Claude. Before touching the app architecture, I asked it to write a throwaway test script, hit the Upfluence API with a few real creator profiles, and report back on what signals were actually available. Then, based on that live data, I asked it to propose different mathematical formulas for a "Creator Power Score" with pros and cons for each.

The prompt:

```
Act as a Sr. Growth Engineer. For my technical assessment detailed in the assignment, I need to define a solid ranking methodology using multiple creator signals.
Before designing the web architecture, we need to validate what actual data the Upfluence API provides.
1. Write a quick, temporary script (e.g., test-api.ts) that fetches the API for 2 or 3 creators in a test industry (e.g., Fitness).
2. Help me run it so we can see the actual JSON payload it returns.
3. Once we see the JSON and the real available 'signals' (metrics like engagement, followers, posting frequency, etc.), propose 2 or 3 different mathematical formulas to calculate a 'Creator Power Score'.
Provide the pros and cons for each formula so I can make an informed decision and document the tradeoffs.
```

Claude ran the script, authenticated against the API, and came back with the full payload structure. The key insight was that `engagement_rate`, `average_likes`, and `average_comments` can be `null` on some profiles — but the per-post `instagram_medias[]` array is always populated with likes, comments, reach, and timestamps, so there's always a fallback path.

From there, Claude proposed three formulas:

- **Formula A — Weighted Linear Composite:** Assign percentage weights to each signal and sum them. Transparent and easy to tweak per industry, but weights are inherently subjective and linear math doesn't capture the interaction between signals.
- **Formula B — Engagement-Anchored × Reach Multiplier:** `(ER ^ 0.7) × log10(followers) × (1 + growth_rate)`. Fraud-resistant (fake followers don't engage, so inflated counts collapse under a low ER) but harder to explain to non-technical stakeholders, and breaks entirely when engagement is null.
- **Formula C — Geometric Mean of 3 Pillars (Reach × Quality × Activity)^(1/3):** The most rigorous option. A creator must perform well across all three dimensions to rank high — a pillar at zero kills the whole score. Maps cleanly to how brands actually think about influencers: how many people do they reach? Does their audience act? Are they consistently active?

The recommendation was **Formula C**, using Formula B's engagement computation as the internal building block for Pillar Q. The geometric mean enforces balanced excellence and mathematically punishes the vanity-metric creators brands keep getting burned by.

I took that recommendation and locked it into `CLAUDE.md` as the canonical ranking methodology, so every future session would build on it without re-deriving it.

> **Important note:** The specific weights, exponents, and pillar definitions in this formula are an informed engineering proposal — but in a real-world deployment, this methodology should be reviewed and validated by domain experts (marketing team, data analysts with campaign performance data) before being used to drive actual budget decisions. The math is sound; the calibration is a conversation.


## Step 4 - Letting Claude learn

The assignment explicitly asks to document "Challenges encountered and how they were solved." My first instinct was to keep a running log myself — but then I thought: why not make Claude do it?

After all, Claude is the one in the room when bugs happen, when API quirks surface, when tradeoffs get made. So I added a section to `CLAUDE.md` that turns it into an automated challenge logger. Whenever we hit a real obstacle and solve it, Claude is instructed to append a structured entry to `MEMORY.md` without being asked:

```markdown
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
```

The result: the challenge log essentially writes itself as the project progresses. No context switching, no trying to remember what happened three commits ago. Claude observes, solves, and documents — all in one step.


## Step 5 - Plan mode

With the API explored, the ranking formula decided, and the project context locked into `CLAUDE.md`, it was time to actually design the application. I activated Plan mode and gave Claude this prompt:

```
I want to build the architecture for the Next.js + Typescript application. The goal is to display 5 industries with the Top 10 creators in each.

Important: Before outlining the plan, please read the 'Ranking Methodology' section in my README.md. All data fetching and backend calculation logic must be based on the exact formula I have documented there.

Please outline the blueprint for the components and the file structure we will need.
```

Note the explicit mention of Next.js and TypeScript in the prompt — that's intentional. By experience, if you don't specify a stack upfront, Claude will often default to whatever requires the least scaffolding: plain HTML, a `<style>` block, and some vanilla JS. Perfectly functional, but a dead end the moment you need routing, component reuse, or type safety. Next.js + TypeScript is also simply where Claude shines.


## Step 6 - Iterate!

Here's where the upfront work paid off. Because we'd already explored the API in detail and locked the architecture in Plan Mode before writing a single line of production code, the core functionality (fetching creators, running the two-pass scoring pipeline, ranking by CPS, etc.) worked correctly from the very first run. No major structural surprises.

The iteration that did happen was the fun kind: UI polish. Things like a component that rendered fine in isolation but looked off in the actual layout, tweaking the creator detail sheet to surface insights in a cleaner way, adjusting how the pillar badges displayed relative scores. The classic ping-pong of "this almost looks right, move this, make that smaller, now it's good."

Minor things. Quick rounds. Exactly the kind of iteration you want — not "the data pipeline is broken" but "this panel could open with a smoother transition."
