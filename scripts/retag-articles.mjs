/**
 * retag-articles.mjs — Re-run extractRelatedBrokers on all articles.
 *
 * Usage: node scripts/retag-articles.mjs
 *
 * Fixes articles that have bcRelatedBrokers: [] due to the old space-padded
 * matching bug. Also upgrades existing tags when new keyword→slug pairs are added.
 * Safe to run repeatedly (idempotent on already-tagged articles that need no change).
 */
import { readFileSync, writeFileSync } from 'fs';

const DB_PATH = 'public/data/articles.json';

// Broker name patterns → slug (longest first for greedy matching)
// Keep in sync with BROKER_KEYWORD_TO_SLUG in fetch-articles.mjs.
// Only needs entries for brokers where extractRelatedBrokers would miss due to
// punctuation/possessives, but including the full list is safe.
const PAIRS = [
  // sorted longest-first so multi-word matches win over single-word subsets
  ['interactive brokers', 'interactive-brokers'],
  ['admiral markets', 'admirals-admiral-markets'],
  ['hargreaves lansdown', 'hargreaves-lansdown'],
  ['interactive investor', 'interactive-investor'],
  ['blackbull markets', 'blackbull-markets'],
  ['charles schwab', 'charles-schwab'],
  ['moneta markets', 'moneta-markets'],
  ['scalable capital', 'scalable-capital'],
  ['trade republic', 'trade-republic'],
  ['trading 212', 'trading-212'],
  ['tastyworks', 'tastytrade'],
  ['tastytrade', 'tastytrade'],
  ['tradestation', 'tradestation'],
  ['cmc markets', 'cmc-markets'],
  ['fp markets', 'fp-markets'],
  ['go markets', 'go-markets'],
  ['bnp paribas', 'bnp-paribas'],
  ['easy equities', 'easyequities'],
  ['easyequities', 'easyequities'],
  ['city index', 'city-index'],
  ['ig group', 'ig'],
  ['aj bell', 'aj-bell-youinvest'],
  ['vt markets', 'vt-markets'],
  ['swissquote', 'swissquote'],
  ['wealthsimple', 'wealthsimple'],
  ['pepperstone', 'pepperstone'],
  ['questrade', 'questrade'],
  ['tradestation', 'tradestation'],
  ['tastytrade', 'tastytrade'],
  ['robinhood', 'robinhood'],
  ['zerodha', 'zerodha'],
  ['lightspeed', 'lightspeed-trading'],
  ['lightyear', 'lightyear'],
  ['webull', 'webull'],
  ['freetrade', 'freetrade'],
  ['firstrade', 'firstrade'],
  ['bitstamp', 'bitstamp'],
  ['coinbase', 'coinbase'],
  ['bitpanda', 'bitpanda'],
  ['avatrade', 'avatrade'],
  ['revolut', 'revolut'],
  ['degiro', 'degiro'],
  ['etoro', 'etoro'],
  ['oanda', 'oanda'],
  ['exness', 'exness'],
  ['tickmill', 'tickmill'],
  ['libertex', 'libertex'],
  ['roboforex', 'roboforex'],
  ['flatex', 'flatex'],
  ['admirals', 'admirals-admiral-markets'],
  ['tradier', 'tradier'],
  ['schwab', 'charles-schwab'],
  ['fidelity', 'fidelity'],
  ['moomoo', 'moomoo'],
  ['kucoin', 'kucoin'],
  ['gemini', 'gemini'],
  ['etrade', 'e-trade'],
  ['vanguard', 'vanguard'],
  ['saxo', 'saxo-bank'],
  ['fxcm', 'fxcm'],
  ['lmax', 'lmax'],
  ['plus500', 'plus500'],
  ['sofi', 'sofi'],
  ['hfm', 'hfm'],
  ['axi', 'axi'],
  ['fbs', 'fbs'],
  ['xtb', 'xtb'],
  ['xm', 'xm'],
];

const EXTRACTION_MAP = PAIRS.map(([pattern, slug]) => ({
  slug,
  regex: new RegExp(`\\b${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i'),
}));

function extractRelatedBrokers(title, body200) {
  const text = title + ' ' + (body200 || '');
  const found = new Set();
  for (const { regex, slug } of EXTRACTION_MAP) {
    if (regex.test(text)) found.add(slug);
  }
  return [...found].slice(0, 5);
}

const articles = JSON.parse(readFileSync(DB_PATH, 'utf8'));
let fixed = 0;
let unchanged = 0;

for (const a of articles) {
  if (a.bcRelatedBrokers?.length) { unchanged++; continue; }
  const body200 = (a.body || '').slice(0, 200);
  const brokers = extractRelatedBrokers(a.title, body200);
  if (brokers.length) {
    a.bcRelatedBrokers = brokers;
    fixed++;
    console.log(`  [${brokers.join(', ')}]: ${a.title.slice(0, 70)}`);
  }
}

writeFileSync(DB_PATH, JSON.stringify(articles, null, 2));
const remaining = articles.filter(a => !a.bcRelatedBrokers?.length).length;
console.log(`\nFixed: ${fixed} | Unchanged: ${unchanged} | Still zero-broker: ${remaining}`);
