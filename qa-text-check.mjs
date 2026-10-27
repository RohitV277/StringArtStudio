import { check, done } from './qa-helpers.mjs';
import { maskToContours } from './services/textOutline.ts';
console.log('Text outlines');
// A synthetic "O" glyph: a thick ring, plus a stray speck that must be ignored.
const W = 200, H = 200, m = new Uint8Array(W * H);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const d = Math.hypot(x - 100, y - 100); if (d < 70 && d > 40) m[y * W + x] = 1; }
m[5 * W + 5] = 1; m[5 * W + 6] = 1;
const c = maskToContours(m, W, H, 0.5, 100);
check('a ring gives an outer and an inner outline, specks are dropped', c.length === 2, 'got ' + c.length);
const maxX = Math.max(...c[0].map(p => Math.abs(p[0])));
check('outlines are centred and scaled to mm', maxX > 30 && maxX < 40, 'max x ' + maxX.toFixed(1));
done('Text QA');
