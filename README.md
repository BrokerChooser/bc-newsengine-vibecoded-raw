# BrokerChooser News Engine

A news aggregation system that fetches broker and finance news from the [EventRegistry](https://eventregistry.org) API, enriches it with BrokerChooser metadata, and serves it as a React SPA with SEO-optimised article, category, and broker-specific pages.

This repository is a **vibecoded raw prototype** — built to prove the concept and establish all the core logic. The code is ready for a clean integration into the live BrokerChooser.com codebase.

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Directory Structure](#2-directory-structure)
3. [The Article Database](#3-the-article-database)
4. [Data Fetch Pipeline](#4-data-fetch-pipeline)
5. [Frontend — Pages & Routes](#5-frontend--pages--routes)
6. [Frontend — Components](#6-frontend--components)
7. [SEO Layer](#7-seo-layer)
8. [Broker Registry](#8-broker-registry)
9. [Running Locally](#9-running-locally)
10. [Deployment](#10-deployment)
11. [Cron / Scheduled Fetch](#11-cron--scheduled-fetch)
12. [Integration Guide for BC Production](#12-integration-guide-for-bc-production)
13. [Configuration Reference](#13-configuration-reference)

---

## 1. System Architecture

```
EventRegistry API
       │
       ▼
scripts/fetch-articles.mjs          ← runs on a cron (2× per day)
       │  filters, enriches, deduplicates
       ▼
public/data/articles.json           ← flat JSON database, ~200–500 articles
       │  served as a static file
       ▼
React SPA (Vite + TailwindCSS)
  /news                             ← news home, category filter, pagination
  /news/:slug                       ← individual article page
  /news/broker/:brokerSlug          ← broker-specific news feed
```

**Key design choice:** The article database is a plain JSON file served as a static asset. The frontend fetches it once on load and does all filtering client-side. There is no backend server or database. This keeps hosting simple (any static host or CDN works) and pages load instantly after the initial fetch.

The tradeoff is that the article list is only as fresh as the last cron run. For a news site refreshed 2× per day this is acceptable; the cron can run more frequently if needed.

---

## 2. Directory Structure

```
newsengine/
├── public/
│   ├── data/
│   │   └── articles.json          # Article database (git-ignored; built by fetch script)
│   ├── favicon.svg
│   ├── icons.svg                  # Sprite sheet used in UI
│   ├── robots.txt
│   ├── sitemap.xml                # Generated at build time
│   └── _redirects                 # Netlify SPA fallback: /* → /index.html 200
│
├── scripts/
│   ├── fetch-articles.mjs         # Main article fetcher (cron job)
│   ├── fetch-config.mjs           # Tunable filter config (edit to tune relevancy)
│   ├── generate-sitemap.mjs       # Build-time sitemap generator
│   ├── init-articles-json.mjs     # Bootstrap: creates empty articles.json if missing
│   └── retag-articles.mjs         # One-off: re-runs broker tagging on existing DB
│
├── src/
│   ├── App.tsx                    # Router setup, font loading
│   ├── main.tsx                   # React entry point
│   ├── index.css                  # Tailwind base + CSS variables (design tokens)
│   │
│   ├── pages/
│   │   ├── NewsHome.tsx           # /news — main listing with hero, category filter
│   │   ├── ArticlePage.tsx        # /news/:slug — article detail
│   │   └── BrokerNewsPage.tsx     # /news/broker/:brokerSlug — per-broker feed
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx         # Site header with BC logo and nav
│   │   │   └── Footer.tsx         # Site footer
│   │   ├── news/
│   │   │   ├── ArticleCard.tsx    # Article card (variants: small, medium)
│   │   │   ├── HeroCard.tsx       # Large featured article card
│   │   │   ├── BrokerCard.tsx     # Expanded broker info card (score, key data, CTA)
│   │   │   ├── BrokerCardCollapsed.tsx  # Collapsed broker row, expands on click
│   │   │   ├── RelatedBrokersSection.tsx # Orchestrates BrokerCard(s) on article page
│   │   │   ├── BCTakeBox.tsx      # "BrokerChooser Take" editorial callout box
│   │   │   └── TopBrokersBox.tsx  # Sidebar/widget showing top brokers
│   │   └── ui/
│   │       ├── Badge.tsx          # Category badge
│   │       ├── CategoryNav.tsx    # Horizontal category filter tabs
│   │       ├── LinkedText.tsx     # Auto-links broker names in body text
│   │       ├── Pagination.tsx     # Prev/next pagination
│   │       └── SentimentIndicator.tsx  # Positive/neutral/negative pill
│   │
│   ├── data/
│   │   ├── broker-data.ts         # Broker registry: logos, scores, key data, review URLs
│   │   ├── news-utils.ts          # Category metadata, article lookup helpers
│   │   ├── category-colors.ts     # Tailwind class map for category colours
│   │   └── dummy-articles.ts      # Static fallback articles (dev/demo only)
│   │
│   ├── hooks/
│   │   ├── useArticles.ts         # Fetches articles.json, caches in memory
│   │   └── useSEO.ts              # Manages <head> meta tags, canonical, JSON-LD
│   │
│   ├── types/
│   │   └── newsapi.ts             # TypeScript interfaces for EventRegistry response
│   │                              # + BCEnrichedArticle (our enriched type)
│   └── utils/
│       └── seo.ts                 # URL builders, schema.org JSON-LD generators
│
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## 3. The Article Database

**File:** `public/data/articles.json`

A JSON array of `BCEnrichedArticle` objects. Served as a static file. The SPA fetches it once on first load and caches it in memory for the session.

### Schema: `BCEnrichedArticle`

```typescript
interface BCEnrichedArticle {
  // ── EventRegistry fields (as returned by the API) ──
  uri: string;              // EventRegistry unique ID — used for deduplication
  lang: string;             // Always 'eng'
  isDuplicate: boolean;     // EventRegistry duplicate flag
  date: string;             // 'YYYY-MM-DD'
  time: string;             // 'HH:MM:SS'
  dateTime: string;         // EventRegistry index datetime
  dateTimePub: string;      // Publication datetime (ISO 8601) — used for display
  dataType: 'news' | 'pr' | 'blog';
  sim: number;              // EventRegistry similarity score
  url: string;              // Original article URL (external)
  title: string;            // Article headline
  body: string;             // Full article body text
  source: {
    uri: string;            // Domain, e.g. 'reuters.com'
    dataType: string;
    title: string;          // Publisher name, e.g. 'Reuters'
  };
  authors: Array<{ uri: string; name: string; type: string; isAgency: boolean }>;
  image: string;            // Hero image URL
  eventUri: string | null;
  sentiment: number | null; // Float −1 to +1 (EventRegistry NLP)
  wgt: number;
  relevance: number;

  // ── BrokerChooser enrichment (added by fetch-articles.mjs) ──
  bcCategory: 'broker-news' | 'markets' | 'regulation-safety' | 'analysis-insights';
  bcSlug: string;           // URL slug, e.g. 'saxo-bank-ai-portfolio-advisory'
  bcRelatedBrokers: string[];  // Broker slugs, e.g. ['saxo-bank', 'degiro']
  bcReadingTime: number;    // Estimated reading time in minutes
  bcTake?: {               // Optional editorial take (not yet populated by cron)
    authorName: string;
    authorRole: string;
    authorImage: string;
    summary: string;
    takeaway: string;
  };
}
```

### Sentiment

`sentiment` is a float provided directly by the EventRegistry API (their NLP pipeline). Values:
- `> 0.1` → Positive (green pill)
- `< -0.1` → Negative (red pill)
- `-0.1 to 0.1` → Neutral (grey pill)
- `null` → not shown

BrokerChooser does **not** compute sentiment — it comes from EventRegistry.

---

## 4. Data Fetch Pipeline

**Script:** `scripts/fetch-articles.mjs`
**Config:** `scripts/fetch-config.mjs`

### Running

```bash
EVENTREGISTRY_API_KEY=<key> node scripts/fetch-articles.mjs [options]

# Options
--hours <n>      Look-back window (default: 12; use 168 for initial 7-day backfill)
--max <n>        Max articles to keep in DB (default: 200; use 500 for backfill)
--output <path>  DB file path (default: public/data/articles.json)
--dry-run        Fetch and log counts without writing
```

### How it works

**Step 1 — Keyword list**

`BROKER_KEYWORD_TO_SLUG` in `fetch-articles.mjs` maps 123 search terms to broker slugs (covering 122 reviewed brokers; Admirals has two keywords). These are batched into groups of ≤9 keywords per API call (EventRegistry limit discovered in testing). Ambiguous broker names that also appear as common English words (e.g. "Admirals", "GO Markets") run as individual calls with a NOT clause.

**Step 2 — EventRegistry API call**

Each batch calls `POST https://eventregistry.org/api/v1/article/getArticles` with:
- `keywordLoc: "title"` — keyword must appear in the article title (high precision)
- `keywordSearchMode: "exact"` — phrase matching, not keyword soup
- `lang: "eng"` — English only (not fully reliable; see Layer 4)
- `isDuplicateFilter: "skipDuplicates"` — EventRegistry-level dedup
- `ignoreCategoryUri: [...]` — API-level exclusion of sports/entertainment categories (see `IGNORE_CATEGORY_URIS` in `fetch-config.mjs`)
- Date windowing based on `--hours`

**Step 3 — Five-layer filtering pipeline**

Articles pass through these filters before being written to the DB:

| Layer | What it does | Config location |
|-------|-------------|-----------------|
| **0** URI dedup | Drops articles whose `uri` already exists in the DB | Hardcoded in script |
| **3** Source blocklist | Drops articles from specific domains (sports sites, etc.) | `BLOCKED_SOURCE_DOMAINS` in `fetch-config.mjs` |
| **4** Non-English filter | Regex on extended-Latin chars to catch articles EventRegistry misclassifies as English | `NON_ENGLISH_CHAR_RE` in `fetch-config.mjs` |
| Title dedup | Normalises title to alphanumeric slug and deduplicates — catches same press release on multiple domains | Hardcoded in script |
| **2** Title guard | Requires a known broker name (word-boundary regex) in the title | `REQUIRE_BROKER_IN_TITLE`, `TITLE_MATCH_DENYLIST` in `fetch-config.mjs` |
| **5** False-positive patterns | Per-broker regex checks for known false-positive patterns (e.g. "Admirals" matching military context) | `SLUG_FALSE_POSITIVE_PATTERNS` in `fetch-config.mjs` |

> **Why exclusion-based, not whitelist?** EventRegistry's categorisation is inconsistent. A strict finance-category whitelist would silently drop legitimate broker articles that EventRegistry hasn't categorised as Business/Finance. The current approach keeps recall high while blocking known bad sources.

**Step 4 — Enrichment**

Each article that passes filtering gets BC-specific fields added:

- `bcCategory` — rule-based categorisation from title/body keywords (see `assignCategory()` in the script)
- `bcSlug` — URL-safe slug generated from the title
- `bcRelatedBrokers` — word-boundary regex scan of title + first 200 chars of body against all broker names
- `bcReadingTime` — word count ÷ 200 wpm

**Step 5 — Merge and write**

New articles are prepended to the existing DB (newest first). The DB is trimmed to `--max` articles.

### Tuning relevancy

Edit `scripts/fetch-config.mjs` — it is the single configuration file for all filter tuning. The file is heavily commented. Key levers:

- **Add a NOT clause** for an ambiguous broker name → `KEYWORD_NOT_CLAUSES`
- **Block a domain** → `BLOCKED_SOURCE_DOMAINS`
- **Force a common-word broker name to require its qualifier in titles** → `TITLE_MATCH_DENYLIST`
- **Add a per-broker false-positive regex** → `SLUG_FALSE_POSITIVE_PATTERNS`
- **Add/edit API-level category exclusions** → `IGNORE_CATEGORY_URIS`

---

## 5. Frontend — Pages & Routes

The SPA is a Vite + React 19 + TailwindCSS 4 app. All routing is client-side via React Router v7.

| Route | Component | Description |
|-------|-----------|-------------|
| `/news` | `NewsHome` | Main news feed. Page 1 "all": hero card + 4 top stories + article grid. Category filter and pagination via URL params (`?category=`, `?page=`). |
| `/news/:slug` | `ArticlePage` | Article detail. Full body text, hero image, sentiment, source attribution, related broker cards, related articles. |
| `/news/broker/:brokerSlug` | `BrokerNewsPage` | Per-broker news feed. Filters all articles by `bcRelatedBrokers` match (tag-based) plus optional text match in title/body for unambiguous broker names. Paginated. Includes broker header with logo, score, review link. |
| `*` | redirect | Anything else → `/news` |

### Data loading

`useArticles()` hook (`src/hooks/useArticles.ts`):
- Fetches `/data/articles.json` on first use
- Uses a module-level cache — fetched once per session regardless of how many components call the hook
- Returns `{ articles, loading }`
- Articles are stored newest-first; no client-side sorting needed

### Category system

Four fixed categories (`bcCategory` field):

| Key | Display label |
|-----|--------------|
| `broker-news` | Broker News |
| `markets` | Markets |
| `regulation-safety` | Regulation & Safety |
| `analysis-insights` | Analysis & Insights |

---

## 6. Frontend — Components

### Article display

**`ArticleCard`** — two variants:
- `small` — compact list row (used on broker news page)
- `medium` — card with image (used on home grid and related articles)

**`HeroCard`** — large featured article. Image fills left side on desktop, category badge, title, excerpt, source/date.

### Broker cards (on article page)

`RelatedBrokersSection` reads `article.bcRelatedBrokers`, looks up each slug in `BROKER_REGISTRY` (from `broker-data.ts`), and renders:
- First broker → `BrokerCard` (always expanded): logo, name, trust badges, "Best for" text, score with stars, key data table (min deposit, fees, account opening), "Visit [Broker]" CTA, "Read review" link
- Additional brokers → `BrokerCardCollapsed` (click to expand): compact row with logo, name, score, chevron

**`SentimentIndicator`** — maps EventRegistry `sentiment` float to Positive / Neutral / Negative pill.

**`LinkedText`** — scans body text for broker names and wraps them in links to `/news/broker/<slug>`.

### UI components

- **`CategoryNav`** — horizontal pill tabs for category filtering
- **`Pagination`** — prev/next with ellipsis for large page counts
- **`Badge`** — coloured category label

---

## 7. SEO Layer

### Per-page meta tags

`useSEO()` hook (`src/hooks/useSEO.ts`) manages all head tags imperatively via `document.head`:
- `<title>`, `<meta name="description">`, `<meta name="robots">`
- `<link rel="canonical">`
- `<link rel="prev">` / `<link rel="next">` for paginated pages
- All Open Graph (`og:*`) and Twitter Card tags
- `<script type="application/ld+json">` for JSON-LD structured data
- Cleans up on unmount — no stale tags when navigating between routes

### Structured data (JSON-LD)

Three schema types built in `src/utils/seo.ts`:

| Page | Schema type |
|------|------------|
| `/news` | `WebSite` + `Organization` + `CollectionPage` |
| `/news/:slug` | `NewsArticle` + `BreadcrumbList` |
| `/news/broker/:slug` | `CollectionPage` (about the broker) + `BreadcrumbList` |

### Canonical URLs

- Article pages: `https://brokerchooser.com/news/<bcSlug>`
- Broker pages: `https://brokerchooser.com/news/broker/<canonicalSlug>`
- `SLUG_CANONICAL` map in `broker-data.ts` handles alias slugs (e.g. `capital-com` → `capitalcom`) to avoid duplicate canonicals

### Sitemap

`scripts/generate-sitemap.mjs` runs at build time and writes `public/sitemap.xml` containing:
- `/news` (homepage)
- `/news?category=<key>` for each of the 4 categories
- `/news/broker/<slug>` for all 122 broker slugs (extracted from `broker-data.ts`)
- `/news/<bcSlug>` for every article in the DB

---

## 8. Broker Registry

**File:** `src/data/broker-data.ts`

A TypeScript object (`BROKER_REGISTRY`) keyed by broker display name (e.g. `'Saxo Bank'`) containing:

```typescript
interface BrokerInfo {
  name: string;
  logo: string;        // URL to broker logo (brokerchooser.com/storage/...)
  score: number;       // BC review score, e.g. 4.9
  bestFor: string;     // One-sentence "best for" description
  badges: string[];    // e.g. ['Available in HU', 'Trusted', 'Tested']
  awarded: boolean;    // Show "Best Broker" award badge
  keyData: Array<{
    label: string;     // e.g. 'Minimum deposit'
    value: string;     // e.g. '$0'
    highlight?: boolean; // Highlight this row (e.g. 'No' inactivity fee)
  }>;
  reviewUrl: string;   // https://brokerchooser.com/broker-reviews/<slug>-review
  visitUrl: string;    // https://brokerchooser.com/go-to-broker/<slug>
}
```

Also exports:
- `SLUG_TO_NAME: Record<string, string>` — broker URL slug → display name (used on broker news pages)
- `SLUG_CANONICAL: Record<string, string>` — alias slug → canonical slug (SEO)
- `getBrokerInfo(nameOrSlug)` — looks up a broker by name or slug
- `getBrokerLogo(nameOrSlug)` — returns just the logo URL

---

## 9. Running Locally

```bash
# Install dependencies
npm install

# Bootstrap the article database (creates empty articles.json)
npm run init-articles

# Populate with articles (requires EventRegistry API key)
EVENTREGISTRY_API_KEY=<your-key> node scripts/fetch-articles.mjs --hours 168 --max 500

# Start dev server
npm run dev
# → http://localhost:5173/news
```

### Initial backfill

On first setup, fetch the last 7 days with a high max to populate the DB:

```bash
EVENTREGISTRY_API_KEY=<key> node scripts/fetch-articles.mjs --hours 168 --max 500
```

Ongoing cron fetch (add new articles, default 12h window):

```bash
EVENTREGISTRY_API_KEY=<key> node scripts/fetch-articles.mjs --hours 12
```

---

## 10. Deployment

### Current prototype

Deployed to Netlify at `https://bc-newsengine.netlify.app`.

`public/_redirects` contains the SPA fallback rule:
```
/*    /index.html   200
```

`public/robots.txt` references the sitemap at the Netlify URL — **update both for production**.

### Build

```bash
npm run build
```

The build script:
1. `node scripts/init-articles-json.mjs` — ensures `articles.json` exists
2. `node scripts/generate-sitemap.mjs` — regenerates sitemap from current DB
3. `tsc -b` — TypeScript type check
4. `vite build` — bundles to `dist/`

The `dist/` output is a standard static site. The `articles.json` is **not** bundled — it is served from `public/data/articles.json` at runtime and fetched by the SPA on load.

---

## 11. Cron / Scheduled Fetch

The fetch script is designed to run on a schedule. It is idempotent — running it multiple times with overlapping windows only adds new articles (URI dedup prevents doubles).

**Recommended schedule: twice daily (07:00 and 19:00 UTC)**

```cron
0 7,19 * * * cd /var/www/newsengine && EVENTREGISTRY_API_KEY=xxx node scripts/fetch-articles.mjs >> /var/log/newsengine-fetch.log 2>&1
```

The script writes directly to `public/data/articles.json`. The SPA fetches this file at runtime — no rebuild or redeploy is needed when articles are updated.

**If the SPA is deployed on a CDN with caching**, the `articles.json` should be served with a short cache TTL (e.g. `Cache-Control: max-age=3600`) or invalidated after each fetch run.

**EventRegistry API usage:** Each cron run makes ~27 API calls (25 batches + 2 individual for ambiguous brokers). EventRegistry plans are priced by call count — a twice-daily schedule uses ~54 calls/day.

---

## 12. Integration Guide for BC Production

This section describes what needs to change to integrate the news engine into `brokerchooser.com`.

### What to keep as-is

- `scripts/fetch-articles.mjs` — the fetch, filter, and enrichment logic is production-ready
- `scripts/fetch-config.mjs` — the tuning config; update as new false positives are found in production
- `scripts/generate-sitemap.mjs` — update `BASE_URL` constant only
- `src/types/newsapi.ts` — the data types
- `src/data/news-utils.ts` — category helpers
- All React components in `src/components/` — UI is complete

### Required changes

#### 1. Update `BASE_URL` and brand constants

In `src/utils/seo.ts`, change:

```typescript
// BEFORE (prototype)
export const BASE_URL = 'https://bc-newsengine.netlify.app';

// AFTER (production)
export const BASE_URL = 'https://brokerchooser.com';
```

Other constants in the same file to verify (already correct for production):
```typescript
export const SITE_NAME = 'BrokerChooser News';
export const ORG_NAME = 'BrokerChooser';
export const ORG_URL = 'https://brokerchooser.com';
export const ORG_LOGO = 'https://brokerchooser.com/favicon.svg';
export const DEFAULT_OG_IMAGE = 'https://brokerchooser.com/images/og-image.jpg';
```

Also update `BASE_URL` in `scripts/generate-sitemap.mjs` (line 16).

#### 2. Update `robots.txt`

Change the sitemap URL from `bc-newsengine.netlify.app` to `brokerchooser.com`.

#### 3. Replace Header and Footer

`src/components/layout/Header.tsx` and `Footer.tsx` are placeholder components. Replace them with BC's actual header/footer, or remove them if the news section will live inside BC's existing layout wrapper.

#### 4. Populate broker logos in `broker-data.ts`

Most broker `logo` fields are empty strings `''` in the prototype. The `BrokerCard` component hides the logo gracefully when it's missing, but production should populate these with actual logo URLs from `brokerchooser.com/storage/...`.

The BC review score (`score`) and key data values (`keyData`) should be kept in sync with the live BC review database rather than remaining as hardcoded static values.

#### 5. Route mounting

The SPA currently mounts at the root (`/`). For integration into BC's existing site:

- Mount the React app only under the `/news/*` path
- In `src/App.tsx`, all routes already use `/news` as the base — no route changes needed
- For a Next.js or similar SSR stack: consider SSR for article pages for better SEO (full HTML in initial response), rather than serving them as a pure client-side SPA

#### 6. SPA fallback rule

The `public/_redirects` file is Netlify-specific. For other hosts:
- **Nginx:** `try_files $uri /index.html;`
- **Apache:** `.htaccess` with `FallbackResource /index.html`
- **Next.js/Nuxt:** wrap in a catch-all route that serves the React bundle

#### 7. `articles.json` delivery

Options for how the article database reaches the frontend:

| Option | Pros | Cons |
|--------|------|------|
| Static file on CDN (current approach) | Simple, fast, no backend | Stale until CDN cache expires or is invalidated after each fetch |
| API endpoint returning the JSON | Always fresh | Requires backend; adds latency on page load |
| Build-time data injection (SSG) | Fastest page load; best for SEO (HTML in initial response) | Requires a rebuild triggered after each fetch run |

For production SEO, SSG (option 3) is recommended for article detail pages. The fetch script's output format does not need to change regardless of the delivery method chosen.

#### 8. Font

IBM Plex Sans is loaded via inline `@font-face` rules in `src/App.tsx` pointing to Google Fonts CDN. Replace with BC's design system font if different.

#### 9. EventRegistry API key

Store `EVENTREGISTRY_API_KEY` as a server environment variable or in a secrets manager. Never commit it to the repo. The current key in use: contact the project owner.

---

## 13. Configuration Reference

### `scripts/fetch-config.mjs` — all tunable constants

| Export | Type | Purpose |
|--------|------|---------|
| `IGNORE_CATEGORY_URIS` | `string[]` | EventRegistry category URIs sent as `ignoreCategoryUri` — blocks sports/entertainment at API level before download |
| `KEYWORD_NOT_CLAUSES` | `Record<string, string>` | Per-keyword NOT clauses for ambiguous broker names (e.g. Admirals) |
| `REQUIRE_BROKER_IN_TITLE` | `boolean` | When true, articles must have a known broker name in the title. Recommended: `true` |
| `TITLE_MATCH_DENYLIST` | `Set<string>` | Stripped broker names that are also common English words — forces the full qualifier phrase to appear in the title instead |
| `BLOCKED_SOURCE_DOMAINS` | `Set<string>` | Domains to always drop regardless of content (sports sites, non-finance aggregators) |
| `NON_ENGLISH_CHAR_RE` | `RegExp` | Extended-Latin character regex to filter articles EventRegistry misclassifies as English |
| `SLUG_FALSE_POSITIVE_PATTERNS` | `Record<string, Pattern[]>` | Per-broker regex checks for known false-positive title patterns |

### `scripts/fetch-articles.mjs` — constants that rarely change

| Constant | Value | Notes |
|----------|-------|-------|
| `API_URL` | `https://eventregistry.org/api/v1/article/getArticles` | EventRegistry endpoint |
| `FALLBACK_IMAGE` | `https://brokerchooser.com/images/og-image.jpg` | Used when an article has no hero image |
| `BROKER_KEYWORD_TO_SLUG` | 123-entry map | Edit to add/remove/rename brokers; must match the reviewed broker list |
| Batch size | 9 keywords per call | Hard limit discovered in testing with EventRegistry |

---

## External dependencies

| Service | Used for | Credential |
|---------|----------|------------|
| **EventRegistry** (newsapi.ai) | Article search and fetch | `EVENTREGISTRY_API_KEY` env var |
| **Google Fonts CDN** | IBM Plex Sans font | None — public CDN |
| **BrokerChooser CDN** | Fallback article image, broker logos | None — public URLs |

No other external services. No database. No backend server.
