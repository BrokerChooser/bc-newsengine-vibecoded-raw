/**
 * Build-time sitemap generator.
 * Reads article slugs from public/data/articles.json and broker slugs from broker-data.ts,
 * then writes public/sitemap.xml.
 *
 * Run: node scripts/generate-sitemap.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const BASE_URL = 'https://bc-newsengine.netlify.app';
const TODAY = new Date().toISOString().split('T')[0];

// ---- Extract article slugs from public/data/articles.json (optional at build time) ----
let articleSlugs = [];
try {
  const articlesJson = JSON.parse(readFileSync(join(ROOT, 'public/data/articles.json'), 'utf8'));
  articleSlugs = articlesJson.map((a) => a.bcSlug);
} catch {
  console.warn('  ⚠ public/data/articles.json not found — article URLs omitted from sitemap. Run fetch-articles.mjs first.');
}

// ---- Extract broker slugs from broker-data.ts ----
const brokerSource = readFileSync(join(ROOT, 'src/data/broker-data.ts'), 'utf8');
// Match keys in SLUG_TO_NAME: '   key': '...'
const brokerSlugs = [...brokerSource.matchAll(/'([a-z0-9][a-z0-9-]+)':\s*'/g)]
  .map((m) => m[1])
  // Filter to likely slug keys (exclude registry keys which start uppercase)
  .filter((s) => s === s.toLowerCase() && s.includes('-') || s.length > 3);

// Deduplicate
const uniqueBrokerSlugs = [...new Set(brokerSlugs)];

// ---- Category static URLs ----
const categoryKeys = ['broker-news', 'markets', 'regulation-safety', 'analysis-insights'];

// ---- Build XML ----
function urlEntry(loc, lastmod, changefreq, priority) {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

const entries = [
  // Homepage
  urlEntry(`${BASE_URL}/news`, TODAY, 'daily', '1.0'),

  // Category pages (treated as URL params on same page, but still crawlable via links)
  ...categoryKeys.map((cat) =>
    urlEntry(`${BASE_URL}/news?category=${cat}`, TODAY, 'daily', '0.8')
  ),

  // Broker news pages — 122 pages, high-value longtail targets
  ...uniqueBrokerSlugs.map((slug) =>
    urlEntry(`${BASE_URL}/news/broker/${slug}`, TODAY, 'daily', '0.8')
  ),

  // Individual article pages
  ...articleSlugs.map((slug) =>
    urlEntry(`${BASE_URL}/news/${slug}`, TODAY, 'weekly', '0.6')
  ),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${entries.join('\n')}
</urlset>`;

writeFileSync(join(ROOT, 'public/sitemap.xml'), xml);

console.log(`✓ sitemap.xml written`);
console.log(`  - 1 homepage`);
console.log(`  - ${categoryKeys.length} category pages`);
console.log(`  - ${uniqueBrokerSlugs.length} broker news pages`);
console.log(`  - ${articleSlugs.length} article pages`);
console.log(`  Total: ${1 + categoryKeys.length + uniqueBrokerSlugs.length + articleSlugs.length} URLs`);
