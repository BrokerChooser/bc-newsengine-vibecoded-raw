#!/usr/bin/env node
/**
 * init-articles-json.mjs — Bootstrap public/data/articles.json
 *
 * Creates an empty articles.json so that `npm run build` succeeds on a
 * fresh checkout before the cron-powered fetch-articles.mjs has run.
 *
 * This is safe to run any time: it will not overwrite an existing file
 * that already contains articles.
 *
 * For ongoing article updates use:
 *   node scripts/fetch-articles.mjs --hours 12
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DEST = join(ROOT, 'public/data/articles.json');

mkdirSync(dirname(DEST), { recursive: true });

if (existsSync(DEST)) {
  let count = 0;
  try {
    count = JSON.parse(readFileSync(DEST, 'utf8')).length;
  } catch { /* malformed — will overwrite */ }
  if (count > 0) {
    console.log(`✓ public/data/articles.json already exists (${count} articles). Nothing to do.`);
    console.log(`  To update articles run: node scripts/fetch-articles.mjs --hours 12`);
    process.exit(0);
  }
}

writeFileSync(DEST, '[]');
console.log(`✓ Created empty public/data/articles.json`);
console.log(`  Populate it by running: node scripts/fetch-articles.mjs --hours 168`);
