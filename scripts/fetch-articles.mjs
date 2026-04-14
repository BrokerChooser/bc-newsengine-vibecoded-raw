#!/usr/bin/env node
/**
 * fetch-articles.mjs — EventRegistry article fetcher for BrokerChooser News
 *
 * Fetches the latest broker/finance news, enriches with BC metadata, merges
 * with the existing article database, and writes the result to a JSON file
 * that the React SPA serves at runtime (no rebuild required).
 *
 * Usage:
 *   EVENTREGISTRY_API_KEY=<key> node scripts/fetch-articles.mjs [options]
 *
 * Options:
 *   --hours <n>        Look-back window in hours (default: 12)
 *   --output <path>    Output JSON path (default: public/data/articles.json)
 *   --max <n>          Max articles to keep (default: 200)
 *   --dry-run          Fetch and report counts but do not write file
 *
 * Cron example — runs at 07:00 and 19:00 UTC every day:
 *   0 7,19 * * * cd /var/www/newsengine && EVENTREGISTRY_API_KEY=xxx node scripts/fetch-articles.mjs >> /var/log/newsengine-fetch.log 2>&1
 *
 * Notes on the EventRegistry query strategy:
 *   - Uses getArticles with keywordLoc:"title" (title-only matching = high precision)
 *   - Broker keywords batched at ≤9 per call (safe limit found in testing)
 *   - Ambiguous broker names use disambiguating qualifiers (e.g. "Skilling broker")
 *   - Each call uses dateStart/dateEnd windowing — no re-processing of old articles
 *   - Weekend volume is ~40–50 % of weekday; script handles gracefully (adds fewer)
 *   - Dedup by EventRegistry `uri` field before merging with existing database
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  REQUIRE_BROKER_IN_TITLE,
  SLUG_FALSE_POSITIVE_PATTERNS,
  KEYWORD_NOT_CLAUSES,
  BLOCKED_SOURCE_DOMAINS,
  NON_ENGLISH_CHAR_RE,
  TITLE_MATCH_DENYLIST,
  IGNORE_CATEGORY_URIS,
} from './fetch-config.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ── CLI args ──────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const getArg = (flag, def) => {
  const i = argv.indexOf(flag);
  return i !== -1 ? argv[i + 1] : def;
};
const HOURS_BACK  = parseInt(getArg('--hours', '12'), 10);
const OUTPUT_PATH = getArg('--output', join(ROOT, 'public/data/articles.json'));
const MAX_ARTICLES = parseInt(getArg('--max', '200'), 10);
const DRY_RUN     = argv.includes('--dry-run');

// ── API config ────────────────────────────────────────────────────────────────
const API_KEY = process.env.EVENTREGISTRY_API_KEY;
if (!API_KEY) {
  console.error('[fetch-articles] ERROR: EVENTREGISTRY_API_KEY env var not set');
  process.exit(1);
}
const API_URL = 'https://eventregistry.org/api/v1/article/getArticles';
const FALLBACK_IMAGE = 'https://brokerchooser.com/images/og-image.jpg';

// ── Broker keyword → URL slug mapping ────────────────────────────────────────
// Keys are the exact search terms sent to EventRegistry (keywordLoc:"title").
// Ambiguous names are disambiguated with a qualifier so they don't match generic content.
// This list must exactly match the 122 reviewed brokers in brokers.csv.
// Entries also in KEYWORD_NOT_CLAUSES (fetch-config.mjs) run as individual API calls.
const BROKER_KEYWORD_TO_SLUG = {
  // A
  'ActivTrades':              'activtrades',
  'Admirals':                 'admirals-admiral-markets',  // in KEYWORD_NOT_CLAUSES
  'Admiral Markets':          'admirals-admiral-markets',  // in KEYWORD_NOT_CLAUSES
  'AJ Bell':                  'aj-bell-youinvest',
  'Ally Invest':              'ally-invest',
  'Alpaca Trading':           'alpaca-trading',
  'AMP Futures':              'amp-futures',
  'ARMO Broker':              'armo-broker',
  'AvaFutures':               'avafutures',
  'AvaTrade':                 'avatrade',
  'Axi broker':               'axitrader',         // "Axi" alone matches too broadly
  // B
  'Banca Sella':              'banca-sella',
  'Barclays investing':       'barclays',           // disambiguated from generic banking
  'BlackBull Markets':        'blackbull-markets',
  'BNP Paribas':              'bnp-paribas',
  'Brokerpoint':              'brokerpoint',
  // C
  'Capital.com':              'capitalcom',
  'CapTrader':                'captrader',
  'Charles Schwab':           'charles-schwab',
  'Charles Stanley Direct':   'charles-stanley-direct',
  'ChoiceTrade':              'choicetrade',
  'CITIC Securities':         'citic-securities',
  'City Index':               'city-index',
  'CMC Markets':              'cmc-markets',
  'Comdirect':                'comdirect',
  'Consorsbank':              'consorsbank',
  // D
  'Davy Select':              'davy-select',
  'DEGIRO':                   'degiro',
  'Directa SIM':              'directa',           // Italian broker — official company name
  'DKB broker':               'dkb',               // German bank/broker — disambiguated
  // E
  'E*TRADE':                  'e-trade',
  'EasyEquities':             'easyequities',
  'Eightcap':                 'eightcap',
  'Erste Broker':             'erste-broker',
  'eToro':                    'etoro',
  'Exness':                   'exness',
  // F
  'FBS broker':               'fbs',               // disambiguated — FBS alone is ambiguous
  'Fidelity Investments':     'fidelity',
  'Fidelity International':   'fidelity-international',
  'finanzen ZERO':            'finanzennet-zero',   // finanzen.net ZERO — dot removed from keyword
  'Fineco Bank':              'fineco-bank',
  'Firstrade':                'firstrade',
  'flatex':                   'flatex',
  'Forex.com':                'forex.com',
  'FP Markets':               'fp-markets',
  'Freetrade':                'freetrade',
  'Fusion Markets':           'fusion-markets',
  'FXCM':                     'fxcm',
  'FxPro':                    'fxpro',
  'FXTM':                     'fxtm',
  'FXTRADING.com':            'fxtradingcom',
  // G
  'Global Prime':             'global-prime',
  'GO Markets':               'go-markets',         // see SLUG_FALSE_POSITIVE_PATTERNS
  // H
  'Halifax Share Dealing':    'halifax',            // disambiguated from Halifax bank
  'Hantec Markets':           'hantec-markets',
  'Hargreaves Lansdown':      'hargreaves-lansdown',
  'HYCM':                     'hycm',
  // I
  'IC Markets':               'ic-markets',
  'IG':                       'ig',
  'ING Direkt':               'ing-direkt-depot',   // ING Direkt Depot (Germany)
  'ING Italia':               'ing-italia',
  'Interactive Brokers':      'interactive-brokers',
  'Interactive Investor':     'interactive-investor',
  'InvestoPro':               'investopro',
  // J
  'J.P. Morgan investing':    'jp-morgan-self-directed-investing',
  'Joe Broker':               'joe-broker',
  // K
  'K&H broker':               'kbc-equitas',        // K&H Értékpapír (formerly KBC Equitas)
  // L
  'Lightyear investing':      'lightyear',          // disambiguated from generic
  'LYNX broker':              'lynx',
  // M
  'Markets.com':              'marketsx',
  'maxblue':                  'maxblue',            // Deutsche Bank's online broker
  'Mediolanum':               'mediolanum',
  'Merrill Edge':             'merrill-edge',
  'MEXEM':                    'mexem',
  'Moneta Markets':           'moneta-markets',
  'moomoo':                   'moomoo',
  'MultiBank Group':          'multibank',
  // N
  'NinjaTrader':              'ninjatrader',
  // O
  'OANDA':                    'oanda',
  'Optimus Futures':          'optimus-futures',
  // P
  'Pepperstone':              'pepperstone',
  'Plus500':                  'plus500',
  'Plus500 Futures':          'plus500-futures',
  'Plus500 Invest':           'plus500-invest',
  'Public.com':               'publiccom',
  // Q
  'Questrade':                'questrade',
  'Qtrade':                   'qtrade-direct-investing',
  // R
  'RBC Direct Investing':     'rbc-direct-investing',
  'Revolut trading':          'revolut',            // disambiguated from Revolut banking
  'Robinhood':                'robinhood',
  'Royal broker':             'royal',              // highly ambiguous — requires qualifier
  // S
  'S Broker':                 's-broker',           // Sparkasse's online broker
  'Saxo Bank':                'saxo-bank',
  'Sharekhan':                'sharekhan',
  'Skilling broker':          'skilling',           // disambiguated — "skilling" alone = 10k+ noise
  'Smartbroker':              'smartbroker',
  'SoFi Invest':              'sofi-invest',
  'SogoTrade':                'sogotrade',
  'Spreadex':                 'spreadex',
  'Stake broker':             'stake',              // disambiguated from generic "stake"
  'Swissquote':               'swissquote',
  // T
  'tastyfx':                  'tastyfx',
  'tastytrade':               'tastytrade',
  'Tickmill':                 'tickmill',
  'Tio Markets':              'tio-markets',
  'TMGM':                     'tmgm',
  'Trade Nation':             'trade-nation',
  'Trade Republic':           'trade-republic',
  'TradeStation':             'tradestation',
  'TradeStation Global':      'tradestation-global',
  'Trading 212':              'trading-212',
  'Trading.com':              'tradingcom',
  'TradeZero':                'tradezero',
  'Tradier':                  'tradier',
  // V
  'Vanguard investing':       'vanguard',           // disambiguated from military "vanguard"
  'Vantage Markets':          'vantage-markets',
  'VT Markets':               'vt-markets',
  // W
  'Webull':                   'webull',
  'Webank Italy':             'webank-italy',
  // X
  'XM broker':                'xm',
  'XTB':                      'xtb',
  // Z
  'Zacks Trade':              'zacks-trade',
  'Zerodha':                  'zerodha',
};

// Strip disambiguation qualifiers from a keyword to get the bare broker name.
// These suffixes are appended to keywords to reduce API noise but aren't part
// of the broker's actual name (e.g. "Axi broker" → "Axi").
function stripQualifiers(kw) {
  return kw
    .replace(/ broker$/i, '')
    .replace(/ investing$/i, '')
    .replace(/ trading$/i, '')
    .replace(/ share dealing$/i, '')  // Halifax Share Dealing → Halifax
    .replace(/ sim$/i, '')            // Directa SIM → Directa
    .replace(/\*/g, '')               // E*TRADE → ETRADE
    .trim();
}

// Keyword name → slug for related-broker extraction (strip qualifiers for matching)
const EXTRACTION_MAP = Object.entries(BROKER_KEYWORD_TO_SLUG).map(([kw, slug]) => {
  const pattern = stripQualifiers(kw).toLowerCase();
  const regex = pattern.length > 2
    ? new RegExp(`\\b${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
    : null;
  return { pattern, slug, regex };
}).sort((a, b) => b.pattern.length - a.pattern.length); // longest match first

// Derive the phrase used by hasBrokerInTitle for a given keyword.
// 1. Strip disambiguation qualifiers (e.g. "Stake broker" → "stake").
// 2. If the stripped name is in TITLE_MATCH_DENYLIST (common English words like "stake",
//    "royal"), fall back to the full keyword so the qualifier must appear in the title too.
// 3. If the stripped name is < 3 chars, fall back to the full keyword (e.g. "XM broker").
// 4. If even the full keyword is < 3 chars (only 'ig' currently), exclude from title gate.
function titleMatchPhrase(kw) {
  const stripped = stripQualifiers(kw).toLowerCase();
  const useFull  = stripped.length < 3 || TITLE_MATCH_DENYLIST.has(stripped);
  if (!useFull) return stripped;
  const full = kw.toLowerCase();
  return full.length >= 3 ? full : null;
}
const BROKER_TITLE_REGEXES = Object.keys(BROKER_KEYWORD_TO_SLUG)
  .map(titleMatchPhrase)
  .filter(Boolean)
  .map(p => new RegExp(`\\b${p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i'));

function hasBrokerInTitle(title) {
  return BROKER_TITLE_REGEXES.some(re => re.test(title));
}

// Build an EventRegistry "exact" mode keyword token for a single broker name.
// Multi-word names are quoted so they match as phrases.
// Special chars that break exact mode are stripped:
//   * → wildcard (e.g. "E*TRADE" matches everything starting with E)
// Returns null for keywords that can't be safely searched (skip them).
function toExactKeyword(kw) {
  const clean = kw.replace(/\*/g, '').trim(); // strip wildcard char
  if (!clean) return null;
  return clean.includes(' ') ? `"${clean}"` : clean;
}

// Token-aware batching for EventRegistry "exact" mode.
// The API counts every space-separated token in the query string (including OR operators)
// against a per-subscription limit (~15 tokens). Multi-word quoted phrases count all
// their words. We cap at MAX_TOKENS per batch to stay safely under that limit.
const MAX_TOKENS = 12;
function buildTokenAwareBatches(keywords) {
  const wordCount = (kw) => kw.trim().split(/\s+/).length;
  const batches = [];
  let current = [];
  let tokens  = 0;
  for (const kw of keywords) {
    const t      = wordCount(kw);
    const needed = current.length === 0 ? t : t + 1; // +1 for OR separator
    if (current.length > 0 && tokens + needed > MAX_TOKENS) {
      batches.push(current);
      current = [kw];
      tokens  = t;
    } else {
      current.push(kw);
      tokens += needed;
    }
  }
  if (current.length > 0) batches.push(current);
  return batches;
}

// Keywords with NOT clauses run as individual calls to avoid their NOT clause
// suppressing articles from other brokers in the same batch.
const AMBIGUOUS_KEYWORDS = new Set(Object.keys(KEYWORD_NOT_CLAUSES));
const regularKeywords    = Object.keys(BROKER_KEYWORD_TO_SLUG)
  .filter(kw => !AMBIGUOUS_KEYWORDS.has(kw))
  .filter(kw => toExactKeyword(kw) !== null); // skip unsearchable keywords (e.g. "E*TRADE")
const KEYWORD_BATCHES    = buildTokenAwareBatches(regularKeywords);
// Each ambiguous keyword becomes its own call with its NOT clause.
const INDIVIDUAL_CALLS   = Object.entries(KEYWORD_NOT_CLAUSES).map(([kw, notClause]) => ({
  label:   kw,
  keyword: toExactKeyword(kw) ? `${toExactKeyword(kw)} ${notClause}` : null,
})).filter(c => c.keyword !== null);

// ── Category assignment ───────────────────────────────────────────────────────
// Regulation signals take highest priority; if the article title contains them,
// it's classified as regulation-safety even if a broker name is present.
const REGULATION_SIGNALS = [
  'fined', 'fines', ' fine ', 'penalty', 'penalised', 'penalized', 'enforcement',
  'banned', 'ban ', 'lawsuit', 'court', 'settlement', 'sanction', 'fraud', 'scam',
  'warning', 'investigation', 'license revoked', 'licence revoked',
  ' sec ', ' fca ', ' esma ', ' cftc ', ' bafin ', ' cysec ', ' asic ',
  'mifid', 'finra', ' regulation ', 'compliance', 'regulatory',
];
const GUIDE_SIGNALS = [
  'how to ', 'guide to ', 'tutorial', ' beginners', 'for beginners', 'explained',
  'learn to ', 'step-by-step', 'step by step', "what is a ", "what's the difference",
  'tips for ', 'checklist', ' vs ', ' versus ',
];
const MARKET_SIGNALS = [
  'stock market', 'forex market', 'earnings report', 'etf flows', 'etf inflow',
  'market volatility', 'market rally', 'market crash', 'selloff', 'bull market',
  'bear market', 'federal reserve', 'interest rate', 'inflation', 'gdp growth',
  'recession', 'ipo ', 'quarterly results', 'quarterly earnings',
];
const ANALYSIS_SIGNALS = [
  'outlook', 'forecast', 'prediction', 'analyst ', 'opinion', 'commentary',
  'expert view', 'market analysis', 'technical analysis', 'fundamental analysis',
  'investment strategy', 'portfolio strategy',
];

function assignCategory(title, body200) {
  const t = ` ${title.toLowerCase()} `;
  const b = ` ${(body200 || '').toLowerCase()} `;
  const c = t + b;

  if (REGULATION_SIGNALS.some(s => c.includes(s))) return 'regulation-safety';
  if (GUIDE_SIGNALS.some(s => t.includes(s)))       return 'analysis-insights';
  if (MARKET_SIGNALS.some(s => c.includes(s)))      return 'markets';
  if (ANALYSIS_SIGNALS.some(s => c.includes(s)))    return 'analysis-insights';
  return 'broker-news';
}

// ── Related broker extraction ─────────────────────────────────────────────────
function extractRelatedBrokers(title, body200) {
  const text = title + ' ' + (body200 || '');
  const found = new Set();
  for (const { regex, slug } of EXTRACTION_MAP) {
    if (regex && regex.test(text)) found.add(slug);
  }
  return [...found].slice(0, 5);
}

// ── False positive detection ──────────────────────────────────────────────────
// Driven by SLUG_FALSE_POSITIVE_PATTERNS from fetch-config.mjs.
// Each broker slug has an array of { test(title) → bool, reason } entries.
// Edit fetch-config.mjs to tune without touching this file.
function isFalsePositive(article) {
  const title = article.title;
  for (const patterns of Object.values(SLUG_FALSE_POSITIVE_PATTERNS)) {
    for (const entry of patterns) {
      if (entry.test(title)) return true;
    }
  }
  return false;
}

// ── Slug generation ───────────────────────────────────────────────────────────
function toBaseSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

function makeSlug(title, uri, existingSlugs) {
  const base = toBaseSlug(title);
  if (!existingSlugs.has(base)) return base;
  // Disambiguate with last 6 chars of URI
  const suffix = String(uri).replace(/\D/g, '').slice(-6) || String(uri).slice(-6);
  return `${base.slice(0, 73)}-${suffix}`;
}

// ── Reading time ──────────────────────────────────────────────────────────────
function calcReadingTime(body) {
  return Math.max(1, Math.round(((body || '').split(/\s+/).length) / 200));
}

// ── EventRegistry API call ────────────────────────────────────────────────────
// keywordString: an "exact" mode query, e.g. 'eToro OR "CMC Markets" OR Binance'
//   or with NOT: 'Kraken NOT (NHL OR hockey OR "Golden Knights")'
// See EventRegistry docs: keywordSearchMode:"exact" supports AND/OR/NOT + quoted phrases.
async function fetchBatch(keywordString, dateStart, dateEnd) {
  const payload = {
    action: 'getArticles',
    keyword: keywordString,
    keywordLoc: 'title',
    keywordSearchMode: 'exact',   // quoted phrases matched as phrases; supports NOT
    lang: 'eng',
    dateStart,
    dateEnd,
    articlesCount: 100,
    articlesSortBy: 'date',
    articlesSortByAsc: false,
    dataType: ['news'],
    ignoreCategoryUri: IGNORE_CATEGORY_URIS,  // exclude sports/entertainment/gaming at API level
    resultType: 'articles',
    articleBodyLen: -1,           // full body
    includeArticleImage: true,
    includeArticleSentiment: true,
    includeArticleCategories: false,
    includeArticleConcepts: false,
    isDuplicateFilter: 'skipDuplicates',
    apiKey: API_KEY,
  };

  let res;
  try {
    res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.warn(`  [warn] network error: ${err.message}`);
    return [];
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.warn(`  [warn] API ${res.status}: ${text.slice(0, 200)}`);
    return [];
  }

  const data = await res.json();
  return data?.articles?.results ?? [];
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const endDate   = new Date();
  const startDate = new Date(endDate.getTime() - HOURS_BACK * 3600 * 1000);
  const fmt = (d) => d.toISOString().slice(0, 10); // API requires YYYY-MM-DD only
  const dateStart = fmt(startDate);
  const dateEnd   = fmt(endDate);

  const totalCalls = KEYWORD_BATCHES.length + INDIVIDUAL_CALLS.length;
  console.log(`[fetch-articles] ${new Date().toISOString()}`);
  console.log(`[fetch-articles] window: ${dateStart} → ${dateEnd} (${HOURS_BACK}h)`);
  console.log(`[fetch-articles] calls: ${KEYWORD_BATCHES.length} batches + ${INDIVIDUAL_CALLS.length} individual (ambiguous), max: ${MAX_ARTICLES}`);

  // Load existing database
  const existingArticles = existsSync(OUTPUT_PATH)
    ? JSON.parse(readFileSync(OUTPUT_PATH, 'utf8'))
    : [];

  const existingUris   = new Set(existingArticles.map(a => a.uri));
  const existingSlugs  = new Set(existingArticles.map(a => a.bcSlug));

  const rawNew = [];
  let callIdx  = 0;

  // Fetch regular batches (multi-keyword OR strings, keywordSearchMode:"exact")
  for (const batch of KEYWORD_BATCHES) {
    callIdx++;
    const kwString = batch.map(toExactKeyword).join(' OR ');
    process.stdout.write(`  [${String(callIdx).padStart(2)}/${totalCalls}] ${batch[0]}… `);

    const results = await fetchBatch(kwString, dateStart, dateEnd);
    const fresh   = results.filter(a => !existingUris.has(a.uri));
    console.log(`${results.length} fetched, ${fresh.length} new`);
    rawNew.push(...fresh);

    if (callIdx < totalCalls) await new Promise(r => setTimeout(r, 350));
  }

  // Fetch ambiguous brokers individually with their NOT clauses
  for (const { label, keyword } of INDIVIDUAL_CALLS) {
    callIdx++;
    process.stdout.write(`  [${String(callIdx).padStart(2)}/${totalCalls}] ${label} (NOT clause)… `);

    const results = await fetchBatch(keyword, dateStart, dateEnd);
    const fresh   = results.filter(a => !existingUris.has(a.uri));
    console.log(`${results.length} fetched, ${fresh.length} new`);
    rawNew.push(...fresh);

    if (callIdx < totalCalls) await new Promise(r => setTimeout(r, 350));
  }

  // ── Layer 0: URI dedup within the fresh batch ────────────────────────────────
  // Same article can appear in multiple keyword batches; dedup by EventRegistry URI.
  const seenUris = new Set();
  const dedupedNew = rawNew.filter(a => {
    if (seenUris.has(a.uri)) return false;
    seenUris.add(a.uri);
    return true;
  });

  // ── Layer 3: source domain blocklist ─────────────────────────────────────────
  // Drop articles from non-finance or non-English source domains.
  // Configure in fetch-config.mjs → BLOCKED_SOURCE_DOMAINS.
  const sourcePassed = dedupedNew.filter(a => !BLOCKED_SOURCE_DOMAINS.has(a.source?.uri));

  // ── Layer 4: non-English title filter ────────────────────────────────────────
  // EventRegistry misclassifies some non-English articles as lang:"eng".
  // Catch them by looking for extended-Latin characters in the title.
  // Configure in fetch-config.mjs → NON_ENGLISH_CHAR_RE.
  const langPassed = sourcePassed.filter(a => !NON_ENGLISH_CHAR_RE.test(a.title));

  // ── Title-based dedup ────────────────────────────────────────────────────────
  // Catches the same article syndicated to multiple sources with different URIs.
  // Normalises the title to a short alphanumeric key and deduplicates against both
  // newly-fetched articles and the existing DB.
  function normTitle(t) {
    return t.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 60);
  }
  const seenTitles = new Set(existingArticles.map(a => normTitle(a.title)));
  const titleDeduped = langPassed.filter(a => {
    const key = normTitle(a.title);
    if (seenTitles.has(key)) return false;
    seenTitles.add(key);
    return true;
  });

  // ── Layer 2: title guard ──────────────────────────────────────────────────────
  // Discard articles where no broker name appears in the title (word-boundary regex).
  // Configure in fetch-config.mjs → REQUIRE_BROKER_IN_TITLE, TITLE_MATCH_DENYLIST.
  const titleValidated = REQUIRE_BROKER_IN_TITLE
    ? titleDeduped.filter(a => hasBrokerInTitle(a.title))
    : titleDeduped;

  // ── Layer 5: false-positive patterns ─────────────────────────────────────────
  // Config-driven per-broker regex checks; see fetch-config.mjs.
  const filtered = titleValidated.filter(a => !isFalsePositive(a));

  console.log(
    `[fetch-articles] ${dedupedNew.length} deduped` +
    ` → ${sourcePassed.length} source OK` +
    ` → ${langPassed.length} English` +
    ` → ${titleDeduped.length} title-deduped` +
    ` → ${titleValidated.length} broker in title` +
    ` → ${filtered.length} after false-positive filter`
  );

  if (DRY_RUN) {
    console.log('[fetch-articles] --dry-run: skipping write');
    console.log(`[fetch-articles] would add ${filtered.length} articles to ${existingArticles.length} existing`);
    return;
  }

  // Enrich with BC fields
  const enriched = filtered.map(a => {
    const body200      = (a.body || '').slice(0, 200);
    const bcCategory   = assignCategory(a.title, body200);
    const bcRelatedBrokers = extractRelatedBrokers(a.title, body200);
    const bcSlug       = makeSlug(a.title, a.uri, existingSlugs);
    existingSlugs.add(bcSlug); // track to prevent intra-batch slug collisions

    return {
      uri:           a.uri,
      lang:          a.lang ?? 'eng',
      isDuplicate:   a.isDuplicate ?? false,
      date:          (a.dateTimePub || a.dateTime || '').slice(0, 10),
      time:          (a.dateTimePub || '').slice(11, 19),
      dateTime:      a.dateTime ?? a.dateTimePub,
      dateTimePub:   a.dateTimePub,
      dataType:      a.dataType ?? 'news',
      sim:           a.sim ?? 0,
      url:           a.url,
      title:         a.title,
      body:          a.body ?? '',
      source:        a.source,
      authors:       a.authors ?? [],
      image:         a.image || FALLBACK_IMAGE,
      eventUri:      a.eventUri ?? null,
      sentiment:     a.sentiment ?? null,
      wgt:           a.wgt ?? 1,
      relevance:     a.relevance ?? 1,
      concepts:      [],
      categories:    [],
      links:         [],
      videos:        [],
      socialScore:   { facebookShares: 0, twitterShares: 0 },
      location:      null,
      extractedDates: [],
      storyUri:      null,
      bcCategory,
      bcSlug,
      bcReadingTime: calcReadingTime(a.body),
      bcRelatedBrokers,
    };
  });

  // Merge, sort by date (newest first), cap at MAX_ARTICLES
  const merged = [...enriched, ...existingArticles]
    .sort((a, b) => new Date(b.dateTimePub).getTime() - new Date(a.dateTimePub).getTime())
    .slice(0, MAX_ARTICLES);

  // Write
  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, JSON.stringify(merged, null, 2));

  console.log(`[fetch-articles] ✓ +${enriched.length} new | ${merged.length} total → ${OUTPUT_PATH}`);
  console.log(`[fetch-articles] category breakdown: ${
    ['broker-news','markets','regulation-safety','analysis-insights']
      .map(c => `${c}=${merged.filter(a => a.bcCategory === c).length}`)
      .join(' | ')
  }`);
}

main().catch(err => {
  console.error('[fetch-articles] FATAL:', err.message);
  console.error(err.stack);
  process.exit(1);
});
