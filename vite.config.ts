import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string };

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap(f => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

/** After the build, list every output file in the service worker so the whole app works offline. */
function precache(): Plugin {
  let outDir = 'dist';
  return {
    name: 'string-art-precache',
    apply: 'build',
    configResolved(c) { outDir = c.build.outDir; },
    closeBundle() {
      const files = walk(outDir).map(f => relative(outDir, f).split(sep).join('/')).filter(f => f !== 'sw.js' && !f.endsWith('.map') && f !== '_headers');
      const swPath = join(outDir, 'sw.js');
      const sw = readFileSync(swPath, 'utf8')
        .replace('/*__PRECACHE__*/[]', JSON.stringify(['./', ...files]))
        .replace('__CACHE_VERSION__', pkg.version + '-' + Date.now());
      writeFileSync(swPath, sw);
    },
  };
}

// base './' keeps the app working from any folder: GitHub Pages sub-paths, Cloudflare Pages, Capacitor.
export default defineConfig({
  base: process.env.VITE_BASE || './',
  plugins: [react(), precache()],
  build: { target: 'es2020', sourcemap: false },
});
