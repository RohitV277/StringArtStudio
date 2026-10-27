import type { Group, Thread } from '../types.ts';

/** Thread from each nail to the next along a shape. Closed shapes get a closing thread. */
export function outlineThreads(g: Group, color: string): Thread[] {
  const out: Thread[] = [], n = g.ids.length;
  for (let i = 0; i < n - 1; i++) out.push({ a: g.ids[i], b: g.ids[i + 1], c: color, g: g.id });
  if (g.closed && n > 2) out.push({ a: g.ids[n - 1], b: g.ids[0], c: color, g: g.id });
  return out;
}

/** Star pattern: every nail jumps ahead by k nails, following each cycle until it closes. */
export function jumpThreads(g: Group, k: number, color: string): Thread[] {
  const out: Thread[] = [], n = g.ids.length, v = k % n || 1, seen = new Set<number>();
  for (let s0 = 0; s0 < n; s0++) {
    if (seen.has(s0)) continue;
    let i = s0;
    do { seen.add(i); const j = (i + v) % n; if (g.ids[i] !== g.ids[j]) out.push({ a: g.ids[i], b: g.ids[j], c: color, g: g.id }); i = j; } while (i !== s0);
  }
  return out;
}

/** Cardioid style pattern: nail i connects to nail i times k. */
export function multiplyThreads(g: Group, k: number, color: string): Thread[] {
  const out: Thread[] = [], n = g.ids.length;
  for (let i = 0; i < n; i++) { const j = (i * k) % n; if (i !== j) out.push({ a: g.ids[i], b: g.ids[j], c: color, g: g.id }); }
  return out;
}

/** Threads left after hiding colors and shapes in Layers. */
export function visibleThreads(threads: Thread[], hiddenColors: string[] = [], hiddenGroups: number[] = []): Thread[] {
  return threads.filter(t => !hiddenColors.includes(t.c) && !(t.g !== undefined && hiddenGroups.includes(t.g)));
}
