import type { Anchor, Group, Nail, Pt, Stroke } from '../types.ts';
import { flattenBezier, polylineLength, resample } from '../lib/geometry.ts';

export interface Board { W: number; H: number }
export interface ExpandedStroke { pts: Pt[]; closed: boolean; curve: boolean; c: string; name?: string; type: string; src: number }

/** Turn stored strokes into plain polylines. Hidden strokes are dropped, pen paths get their mandala copies. */
export function expandStrokes(strokes: Stroke[], board: Board): ExpandedStroke[] {
  const out: ExpandedStroke[] = [];
  strokes.forEach((s, i) => {
    if (s.h) return;
    if (s.type !== 'bez') { out.push({ pts: s.pts as Pt[], closed: s.closed, curve: s.curve, c: s.c, name: s.name, type: s.type, src: i }); return; }
    const base = flattenBezier(s.pts as Anchor[], s.closed), x0 = board.W * 5, y0 = board.H * 5, n = s.sym || 1;
    for (let k = 0; k < n; k++) {
      const a = 2 * Math.PI * k / n, c = Math.cos(a), d = Math.sin(a);
      for (const m of (s.mir ? [1, -1] : [1])) {
        out.push({
          pts: base.map(p => { const x = (p[0] - x0) * m, y = p[1] - y0; return [x0 + x * c - y * d, y0 + x * d + y * c] as Pt; }),
          closed: s.closed, curve: true, c: s.c, name: s.name, type: 'bez', src: i,
        });
      }
    }
  });
  return out;
}

/** Place nails along every visible stroke. Nails closer than 45% of the spacing are merged. */
export function generateNails(strokes: Stroke[], spacingMm: number, board: Board): { nails: Nail[]; groups: Group[] } {
  const nails: Nail[] = [], groups: Group[] = [], r1 = (v: number) => Math.round(v * 10) / 10;
  let nid = 1;
  const near = (x: number, y: number) => nails.find(n => Math.hypot(n.x - x, n.y - y) < spacingMm * 0.45);
  for (const s of expandStrokes(strokes, board)) {
    const pts = s.pts, cl = s.closed;
    let out: Pt[] = [];
    if (s.curve) {
      const poly = cl ? pts.concat([pts[0]]) : pts, len = polylineLength(poly);
      out = resample(poly, cl ? Math.max(3, Math.round(len / spacingMm)) : Math.max(2, Math.round(len / spacingMm) + 1), cl);
    } else {
      const m = pts.length, segs = cl ? m : m - 1;
      for (let i = 0; i < segs; i++) {
        const a = pts[i], b = pts[(i + 1) % m], L = Math.hypot(b[0] - a[0], b[1] - a[1]), k = Math.max(1, Math.round(L / spacingMm));
        for (let j = 0; j < k; j++) out.push([a[0] + (b[0] - a[0]) * j / k, a[1] + (b[1] - a[1]) * j / k]);
      }
      if (!cl) out.push(pts[m - 1]);
    }
    const ids: number[] = [];
    for (const p of out) {
      let n = near(p[0], p[1]);
      if (!n) { n = { id: nid++, x: r1(p[0]), y: r1(p[1]) }; nails.push(n); }
      if (ids[ids.length - 1] !== n.id) ids.push(n.id);
    }
    if (cl && ids.length > 1 && ids[0] === ids[ids.length - 1]) ids.pop();
    if (ids.length > 1) groups.push({ id: groups.length + 1, ids, closed: cl && ids.length > 2, c: s.c, n: s.name || s.type });
  }
  return { nails, groups };
}
