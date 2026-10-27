// Times nail generation and pattern building on large designs. Run: npm run benchmark
import { generateNails } from '../services/nails.ts';
import { jumpThreads, multiplyThreads } from '../services/threads.ts';

function circle(cx, cy, r, c = '#fff') {
  const pts = Array.from({ length: 360 }, (_, i) => [cx + r * Math.sin(i * Math.PI / 180), cy - r * Math.cos(i * Math.PI / 180)]);
  return { type: 'circle', pts, closed: true, curve: true, c };
}
const board = { W: 60, H: 60 };
for (const [shapes, spacing] of [[10, 8], [40, 6], [100, 4]]) {
  const strokes = Array.from({ length: shapes }, (_, i) => circle(100 + (i % 10) * 40, 100 + Math.floor(i / 10) * 40, 18 + (i % 5) * 4));
  const t0 = performance.now();
  const { nails, groups } = generateNails(strokes, spacing, board);
  const t1 = performance.now();
  let threads = 0;
  for (const g of groups) threads += jumpThreads(g, 7, '#fff').length + multiplyThreads(g, 3, '#fff').length;
  const t2 = performance.now();
  console.log(shapes + ' shapes at ' + spacing + ' mm: ' + nails.length + ' nails in ' + (t1 - t0).toFixed(0) + ' ms, ' + threads + ' threads in ' + (t2 - t1).toFixed(0) + ' ms');
}
