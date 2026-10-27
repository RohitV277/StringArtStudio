// Verifies that the tool catalog, the studio markup, the engine and the PWA files agree. Run: npm run test:catalog
import { readFileSync, existsSync } from 'node:fs';
import { TOOLS, FONTS, BOARD_COLORS, THREAD_COLORS } from '../lib/constants.ts';

const errors = [];
const fail = m => errors.push(m);
const read = p => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const hex = /^#[0-9a-f]{6}$/i;

// tools
const ids = new Set();
for (const t of TOOLS) {
  if (ids.has(t.id)) fail('duplicate tool id ' + t.id);
  ids.add(t.id);
  if (!t.label || !t.hint) fail('tool ' + t.id + ' needs a label and a hint');
}

// fonts and colors
for (const s of ['dev', 'guj', 'en']) if (!FONTS.some(f => f.k === s)) fail('no fonts for script ' + s);
for (const [c] of BOARD_COLORS) if (!hex.test(c)) fail('bad board color ' + c);
for (const c of Object.keys(THREAD_COLORS)) if (!hex.test(c)) fail('bad thread color ' + c);

// engine element ids must exist in the markup (or be created by the engine)
const markup = read('components/studioMarkup.ts'), engine = read('services/studioEngine.ts');
const have = new Set([...markup.matchAll(/id="([\w-]+)"/g)].map(m => m[1]));
const created = new Set(['bgc']);
const wanted = new Set([...engine.matchAll(/\$\('#([\w-]+)'\)/g)].map(m => m[1]));
for (const id of wanted) if (!have.has(id) && !created.has(id)) fail('engine uses #' + id + ' but the markup has no such element');

// every catalog tool appears in the engine
for (const t of TOOLS) if (!engine.includes("'" + t.id + "'")) fail('tool ' + t.id + ' is not wired in the engine');

// PWA files
const manifest = JSON.parse(read('public/manifest.webmanifest'));
for (const i of manifest.icons) if (!existsSync(new URL('../public/' + i.src, import.meta.url))) fail('missing icon ' + i.src);
const sw = read('public/sw.js');
if (!sw.includes('/*__PRECACHE__*/[]') || !sw.includes('__CACHE_VERSION__')) fail('public/sw.js lost its build placeholders');
for (const f of ['public/icons/apple-touch-icon.png', 'assets/icon-only.png', 'assets/splash.png']) if (!existsSync(new URL('../' + f, import.meta.url))) fail('missing ' + f);

if (errors.length) { console.error('Catalog check failed:\n- ' + errors.join('\n- ')); process.exit(1); }
console.log('Catalog check passed: ' + TOOLS.length + ' tools, ' + FONTS.length + ' fonts, ' + have.size + ' markup ids, ' + wanted.size + ' engine ids.');
