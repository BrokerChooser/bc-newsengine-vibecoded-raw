/**
 * fetch-config.mjs — Tunable relevancy configuration for the article fetch pipeline.
 *
 * Five layers of filtering control article quality:
 *
 *   1. API-level (query)    — EventRegistry receives `keywordSearchMode:"exact"` with
 *                             an OR string: e.g. 'eToro OR "CMC Markets"'.
 *                             Multi-word keywords are quoted so they're matched as phrases.
 *                             For ambiguous broker names, a NOT clause is appended.
 *                             Configured via KEYWORD_NOT_CLAUSES below.
 *
 *   2. Title guard          — REQUIRE_BROKER_IN_TITLE re-validates that a known broker
 *                             phrase appears in the title (word-boundary regex) after fetch.
 *                             TITLE_MATCH_DENYLIST forces common-word broker names (e.g.
 *                             "stake") to require their full qualifier phrase in the title.
 *
 *   3. Source blocklist     — BLOCKED_SOURCE_DOMAINS drops articles from non-finance or
 *                             non-English sources regardless of title content.
 *
 *   4. Language filter      — NON_ENGLISH_CHAR_RE filters articles whose titles contain
 *                             extended-Latin characters typical of Danish/Spanish/German etc.
 *                             Catches sources that EventRegistry misclassifies as English.
 *
 *   5. False-pos patterns   — SLUG_FALSE_POSITIVE_PATTERNS catches articles that slip
 *                             through layers 1–4 but are about a different referent.
 *
 * To fine-tune relevancy in production:
 *   - Add/edit KEYWORD_NOT_CLAUSES to tighten at the API level (layer 1)
 *   - Add common-word broker bare names to TITLE_MATCH_DENYLIST (layer 2)
 *   - Add domain strings to BLOCKED_SOURCE_DOMAINS (layer 3)
 *   - Extend NON_ENGLISH_CHAR_RE if new language edge cases appear (layer 4)
 *   - Add/edit SLUG_FALSE_POSITIVE_PATTERNS for remaining edge cases (layer 5)
 *   - Add broker name variants to BROKER_KEYWORD_TO_SLUG in fetch-articles.mjs
 */

// ── Layer 0: API-level category filter ───────────────────────────────────────
/**
 * EventRegistry category URIs to exclude from every API call.
 * These are sent as `ignoreCategoryUri` in the getArticles payload, so the API
 * drops articles in these topics before they are even downloaded.
 *
 * This is more robust than a local domain blocklist: a single sports category
 * exclusion blocks ALL sports sources rather than requiring individual domain entries.
 *
 * Category URI format follows the DMOZ/EventRegistry taxonomy: "dmoz/<Category>".
 * To find additional URIs: https://eventregistry.org/documentation?tab=sources
 * or use the EventRegistry getCategoryUri endpoint.
 *
 * Note: EventRegistry's categorisation is imperfect — some legitimate broker articles
 * may not carry a Business/Finance category, which is why this is an *exclusion* list
 * rather than an inclusion whitelist. That keeps recall high while cutting obvious noise.
 */
export const IGNORE_CATEGORY_URIS = [
  'dmoz/Sports',
  'dmoz/Games',
  'dmoz/Recreation',
  'dmoz/Arts',
  'dmoz/Entertainment',
];

// ── Layer 1: per-keyword API NOT clauses ──────────────────────────────────────
/**
 * Brokers with ambiguous names get their own API call with a NOT clause appended.
 * This is the most efficient filter — it reduces API result set before downloading.
 *
 * Key: the exact keyword string from BROKER_KEYWORD_TO_SLUG in fetch-articles.mjs
 * Value: a NOT clause string in EventRegistry "exact" query syntax.
 *   Supported operators: NOT, AND, OR, parentheses.
 *   Multi-word phrases must be in double quotes.
 *
 * Example — to add a new ambiguous broker "Sprint":
 *   'Sprint': 'NOT (telecom OR wireless OR carrier OR "5G" OR "mobile plan")',
 */
export const KEYWORD_NOT_CLAUSES = {
  // Admirals: broker vs. military rank / Norfolk Admirals hockey
  'Admirals': 'NOT (navy OR naval OR military OR warship OR "Norfolk Admirals" OR "vice admiral" OR "rear admiral" OR "talks in")',
  'Admiral Markets': 'NOT (navy OR naval OR military OR warship OR "vice admiral" OR "rear admiral")',
};

// ── Layer 2a: title guard toggle ──────────────────────────────────────────────
/**
 * When true: an article is kept only if at least one known broker phrase appears
 * in the title (word-boundary regex match).
 * Default: true — recommended for production.
 */
export const REQUIRE_BROKER_IN_TITLE = true;

// ── Layer 2b: title match denylist ────────────────────────────────────────────
/**
 * Bare broker names (after stripping disambiguation qualifiers) that are also common
 * English words. For these, the title gate uses the FULL keyword phrase (including the
 * qualifier) rather than the bare name — preventing matches on unrelated phrases.
 *
 * Example: 'Stake broker' strips to 'stake', which matches "billions at stake".
 * Adding 'stake' here forces the title gate to require 'stake broker' instead.
 *
 * Values must be the stripped bare name (lowercase), not the original keyword.
 */
export const TITLE_MATCH_DENYLIST = new Set([
  'stake',    // "at stake", "stakeholder", etc.
  'royal',    // "Royal Academy", "royal family", etc.
]);

// ── Layer 3: source domain blocklist ─────────────────────────────────────────
/**
 * Articles from these domains are discarded regardless of title content.
 * Use for: sports/entertainment sites, general news aggregators that produce
 * broker-name false positives, and non-English sources not caught by layer 4.
 *
 * Values must match `article.source.uri` exactly (lowercase domain string).
 * Add domains as new false positives are discovered in production.
 */
export const BLOCKED_SOURCE_DOMAINS = new Set([
  // Sports / entertainment — not finance-related
  'sportingnews.com',
  'bleacherreport.com',

  // General news aggregators producing false positives
  'pagenews.gr',
]);

// ── Layer 4: non-English title filter ────────────────────────────────────────
/**
 * EventRegistry occasionally misclassifies non-English articles as lang:"eng",
 * particularly from sites like ugebrev.dk (Danish) or es-us.finanzas.yahoo.com
 * (Spanish Yahoo Finance). This regex matches extended-Latin characters that are
 * absent from standard English text, catching those mislabelled articles.
 *
 * The regex is intentionally conservative — it targets characters that are
 * diagnostic of non-English content (ø, å, æ, ü, ñ, é with accents etc.)
 * while avoiding false positives on legitimate English broker names.
 */
export const NON_ENGLISH_CHAR_RE = /[àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿœšžßÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸŒŠŽ]/u;

// ── Layer 5: false-positive patterns ─────────────────────────────────────────
/**
 * Per-slug list of { test, reason } objects.
 * An article is discarded as a false positive if ANY entry's `test` function
 * returns true for that article's title.
 *
 * `test` receives the raw article title string (original casing).
 * `reason` is a description shown when debugging.
 *
 * To add a new pattern for broker "foo-bar":
 *   'foo-bar': [
 *     { test: (t) => /\bfoo\b/i.test(t) && /\b(bar|baz)\b/i.test(t), reason: 'foo context' },
 *   ],
 *
 * Broker slugs match the values in BROKER_KEYWORD_TO_SLUG in fetch-articles.mjs.
 */
export const SLUG_FALSE_POSITIVE_PATTERNS = {

  'admirals-admiral-markets': [
    {
      test: (t) =>
        /\badmirals?\b/i.test(t) &&
        !/\badmirals? markets?\b/i.test(t) &&
        /\b(navy|naval|military|warship|fleet|commander|regiment|norfolk admirals|admiral cove|mariners|predators|talks in|in seoul|in beijing|in tokyo|vice admiral|rear admiral|beltway)\b/i.test(t),
      reason: 'military admirals or Norfolk Admirals hockey',
    },
  ],

  'vanguard': [
    {
      test: (t) => /\bvanguard\b/i.test(t) && /\b(military|troops|army|battalion|regiment)\b/i.test(t),
      reason: 'military vanguard context',
    },
  ],

  'go-markets': [
    {
      test: (t) => /\bgo markets?\b/i.test(t) && /\b(go-to-market|gtm|go to market strategy)\b/i.test(t),
      reason: 'go-to-market / GTM strategy article',
    },
  ],

};
