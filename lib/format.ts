import type { Doc, Thread } from '../types.ts';
import { polar } from './geometry.ts';
import { THREAD_COLORS } from './constants.ts';

/** The text list shown in Build: every nail with its position and angle, then the threads in order, grouped by color. */
export function buildInstructions(doc: Doc, threads: Thread[], centre?: { x: number; y: number }): string {
  const c = centre || { x: doc.W * 5, y: doc.H * 5 }, idx = new Map(doc.nails.map((n, i) => [n.id, i]));
  let t = 'Board ' + doc.W + ' x ' + doc.H + ' cm, ' + doc.nails.length + ' nails\n\nNails (cm from bottom-left; angle clockwise from the top, radius from the centre)\n';
  t += doc.nails.map((n, i) => {
    const q = polar(n, c);
    return (i + 1) + ': x ' + (n.x / 10).toFixed(1) + ', y ' + ((doc.H * 10 - n.y) / 10).toFixed(1) + ' | angle ' + q.angle.toFixed(1) + ' deg, radius ' + q.radius.toFixed(1) + ' cm';
  }).join('\n');
  t += '\n\nThreads in order\n';
  let cur: string | null = null, line: string[] = [];
  for (const h of threads) {
    if (h.c !== cur) { if (line.length) t += line.join('  ') + '\n'; cur = h.c; line = []; t += '\nColor ' + (THREAD_COLORS[h.c] || h.c) + '\n'; }
    line.push((idx.get(h.a)! + 1) + '>' + (idx.get(h.b)! + 1));
  }
  if (line.length) t += line.join('  ') + '\n';
  return t;
}
