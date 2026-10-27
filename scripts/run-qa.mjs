// Runs every qa-*.mjs script. Needs Node 22.18 or newer (it imports the TypeScript modules directly).
import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const files = readdirSync(new URL('../', import.meta.url)).filter(f => /^qa-.*\.mjs$/.test(f)).sort();
let failed = 0;
for (const f of files) {
  const r = spawnSync(process.execPath, [f], { stdio: 'inherit', cwd: new URL('../', import.meta.url) });
  if (r.status !== 0) failed++;
}
console.log(failed ? failed + ' of ' + files.length + ' QA scripts failed' : 'All ' + files.length + ' QA scripts passed');
process.exit(failed ? 1 : 0);
