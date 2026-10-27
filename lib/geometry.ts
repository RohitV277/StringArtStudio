import type { Anchor, Pt } from '../types.ts';

export function polylineLength(p: Pt[], closed = false): number {
  let len = 0;
  for (let i = 1; i < p.length; i++) len += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]);
  if (closed && p.length > 1) len += Math.hypot(p[0][0] - p[p.length - 1][0], p[0][1] - p[p.length - 1][1]);
  return len;
}

/** Evenly spaced points along a polyline. For closed shapes pass a poly that ends where it starts. */
export function resample(poly: Pt[], n: number, closed: boolean): Pt[] {
  const cum = [0];
  for (let i = 1; i < poly.length; i++) cum.push(cum[i - 1] + Math.hypot(poly[i][0] - poly[i - 1][0], poly[i][1] - poly[i - 1][1]));
  const tot = cum[cum.length - 1], step = tot / (closed ? n : Math.max(n - 1, 1));
  const out: Pt[] = [];
  let j = 1;
  for (let k = 0; k < n; k++) {
    const t = k * step;
    while (j < cum.length - 1 && cum[j] < t) j++;
    const f = (t - cum[j - 1]) / ((cum[j] - cum[j - 1]) || 1), a = poly[j - 1], b = poly[j];
    out.push([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]);
  }
  return out;
}

/** Turn pen-tool anchors into a polyline (cubic Bezier segments, 16 samples each). */
export function flattenBezier(a: Anchor[], closed: boolean, steps = 16): Pt[] {
  const m = a.length, out: Pt[] = [], n = closed ? m : m - 1;
  for (let i = 0; i < n; i++) {
    const p = a[i], q = a[(i + 1) % m];
    for (let t = 0; t < steps; t++) {
      const u = t / steps, v = 1 - u, A = v * v * v, B = 3 * v * v * u, C = 3 * v * u * u, D = u * u * u;
      out.push([A * p.x + B * (p.x + p.ox) + C * (q.x + q.ix) + D * q.x, A * p.y + B * (p.y + p.oy) + C * (q.y + q.iy) + D * q.y]);
    }
  }
  if (!closed) out.push([a[m - 1].x, a[m - 1].y]);
  return out;
}

/** Insert an anchor on segment i at parameter u without changing the curve shape. */
export function splitBezier(a: Anchor[], i: number, u: number): void {
  const m = a.length, p = a[i], q = a[(i + 1) % m], L = (x: number, y: number) => x + (y - x) * u;
  const X1 = p.x + p.ox, Y1 = p.y + p.oy, X2 = q.x + q.ix, Y2 = q.y + q.iy;
  const ax = L(p.x, X1), ay = L(p.y, Y1), bx = L(X1, X2), by = L(Y1, Y2), cx = L(X2, q.x), cy = L(Y2, q.y);
  const dx = L(ax, bx), dy = L(ay, by), ex = L(bx, cx), ey = L(by, cy), sx = L(dx, ex), sy = L(dy, ey);
  p.ox = ax - p.x; p.oy = ay - p.y; q.ix = cx - q.x; q.iy = cy - q.y;
  a.splice(i + 1, 0, { x: sx, y: sy, ix: dx - sx, iy: dy - sy, ox: ex - sx, oy: ey - sy });
}

/** Ramer-Douglas-Peucker on an open polyline. */
export function rdp(P: Pt[], eps: number): Pt[] {
  if (P.length < 3) return P;
  const keep = new Uint8Array(P.length);
  keep[0] = keep[P.length - 1] = 1;
  const st: [number, number][] = [[0, P.length - 1]];
  while (st.length) {
    const [a, b] = st.pop()!, A = P[a], B = P[b], dx = B[0] - A[0], dy = B[1] - A[1], l = Math.hypot(dx, dy) || 1e-9;
    let md = 0, mi = -1;
    for (let i = a + 1; i < b; i++) {
      const d = Math.abs((P[i][0] - A[0]) * dy - (P[i][1] - A[1]) * dx) / l;
      if (d > md) { md = d; mi = i; }
    }
    if (md > eps && mi > 0) { keep[mi] = 1; st.push([a, mi], [mi, b]); }
  }
  return P.filter((_, i) => keep[i]);
}

/** RDP for a closed loop given without a repeated end point. */
export function rdpClosed(L: Pt[], eps: number): Pt[] {
  const n = L.length;
  let f = 0, md = -1;
  for (let i = 1; i < n; i++) {
    const d = Math.hypot(L[i][0] - L[0][0], L[i][1] - L[0][1]);
    if (d > md) { md = d; f = i; }
  }
  return rdp(L.slice(0, f + 1), eps).concat(rdp(L.slice(f).concat([L[0]]), eps).slice(1, -1));
}

/** Outlines of the filled regions of a binary mask (marching squares). Returns closed loops in pixel units. */
export function marchingSquares(m: Uint8Array, W: number, H: number): Pt[][] {
  const E: [number, number][] = [], ends = new Map<number, number[]>(), key = (X: number, Y: number) => X * 65536 + Y;
  const add = (p: number, q: number) => {
    const i = E.length; E.push([p, q]);
    for (const k of [p, q]) { if (!ends.has(k)) ends.set(k, []); ends.get(k)!.push(i); }
  };
  for (let y = 0; y < H - 1; y++) for (let x = 0; x < W - 1; x++) {
    const idx = m[y * W + x] * 8 + m[y * W + x + 1] * 4 + m[(y + 1) * W + x + 1] * 2 + m[(y + 1) * W + x];
    if (idx === 0 || idx === 15) continue;
    const T = key(2 * x + 1, 2 * y), R = key(2 * x + 2, 2 * y + 1), B = key(2 * x + 1, 2 * y + 2), L = key(2 * x, 2 * y + 1);
    switch (idx) {
      case 1: case 14: add(L, B); break;
      case 2: case 13: add(B, R); break;
      case 3: case 12: add(L, R); break;
      case 4: case 11: add(T, R); break;
      case 5: add(T, L); add(B, R); break;
      case 6: case 9: add(T, B); break;
      case 7: case 8: add(T, L); break;
      case 10: add(T, R); add(L, B); break;
    }
  }
  const used = new Uint8Array(E.length), loops: Pt[][] = [];
  for (let i = 0; i < E.length; i++) {
    if (used[i]) continue;
    used[i] = 1;
    const P = [E[i][0], E[i][1]], st = E[i][0];
    let c = E[i][1];
    while (c !== st) {
      const nx = (ends.get(c) || []).find(j => !used[j]);
      if (nx === undefined) break;
      used[nx] = 1;
      c = E[nx][0] === c ? E[nx][1] : E[nx][0];
      if (c !== st) P.push(c);
    }
    loops.push(P.map(k => [Math.floor(k / 65536) / 2, (k % 65536) / 2] as Pt));
  }
  return loops;
}

export function bbox(P: Pt[]) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const q of P) { x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]); y0 = Math.min(y0, q[1]); y1 = Math.max(y1, q[1]); }
  return { x0, y0, x1, y1, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
}

/** Angle in degrees clockwise from the top, and distance in cm, of a nail seen from a centre point (mm). */
export function polar(n: { x: number; y: number }, c: { x: number; y: number }) {
  const dx = n.x - c.x, dy = n.y - c.y;
  return { angle: (Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360, radius: Math.hypot(dx, dy) / 10 };
}

/** Rotate by angle (rad) and scale about c, then translate. Used by Select, rotate and pinch. */
export function affine(p: Pt, T: { a: number; f: number; tx: number; ty: number; c: { x: number; y: number } }): Pt {
  const co = Math.cos(T.a), si = Math.sin(T.a), dx = p[0] - T.c.x, dy = p[1] - T.c.y;
  return [T.c.x + T.f * (dx * co - dy * si) + T.tx, T.c.y + T.f * (dx * si + dy * co) + T.ty];
}
