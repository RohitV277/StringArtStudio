import type { Pt } from '../types.ts';
import { marchingSquares, rdpClosed } from '../lib/geometry.ts';

/** Convert a text mask (1 = ink) into closed outlines in mm. Holes in letters become their own loops. */
export function maskToContours(mask: Uint8Array, w: number, h: number, mmPerPx: number, fontPx = 100): Pt[][] {
  const out: Pt[][] = [];
  for (const loop of marchingSquares(mask, w, h)) {
    if (loop.length < 4) continue;
    const q = rdpClosed(loop, 1.1);
    if (q.length < 3) continue;
    let area = 0;
    for (let i = 0; i < q.length; i++) { const a = q[i], b = q[(i + 1) % q.length]; area += a[0] * b[1] - b[0] * a[1]; }
    if (Math.abs(area / 2) < fontPx * fontPx * 0.0012) continue; // specks
    out.push(q.map(p => [(p[0] - w / 2) * mmPerPx, (p[1] - h / 2) * mmPerPx] as Pt));
  }
  return out;
}

/** Draw text on an offscreen canvas and return its mask. Browser only. Uses the fonts installed on the device. */
export function renderTextMask(text: string, family: string, bold: boolean, sizeCm: number) {
  const lines = text.split('\n'), c = document.createElement('canvas'), g = c.getContext('2d')!, wt = bold ? '700 ' : '400 ';
  let px = 120;
  g.font = wt + px + 'px ' + family;
  let mw = Math.max(...lines.map(l => g.measureText(l).width));
  if (mw > 2600) { px = Math.floor(px * 2600 / mw); g.font = wt + px + 'px ' + family; mw = Math.max(...lines.map(l => g.measureText(l).width)); }
  const lh = px * 1.5, W = Math.ceil(mw + px), H = Math.ceil(lines.length * lh + px * 0.6);
  c.width = W; c.height = H;
  g.fillStyle = '#fff'; g.fillRect(0, 0, W, H); g.fillStyle = '#000';
  g.font = wt + px + 'px ' + family; g.textAlign = 'center'; g.textBaseline = 'middle';
  lines.forEach((l, i) => g.fillText(l, W / 2, px * 0.3 + lh * (i + 0.5)));
  const d = g.getImageData(0, 0, W, H).data, mask = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) mask[i] = d[4 * i] < 140 ? 1 : 0;
  return { mask, w: W, h: H, mmPerPx: sizeCm * 10 / px, fontPx: px };
}
