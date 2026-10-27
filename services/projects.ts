import type { Doc, KeyValueStore, SavedProject } from '../types.ts';

const PREFIX = 'ssd-proj-';

export interface ProjectInfo { key: string; name: string; time: number; thumb: string }

/** Saved designs live in the device's own storage. Nothing leaves the device. */
export function createProjectLibrary(store: KeyValueStore) {
  return {
    list(): ProjectInfo[] {
      const out: ProjectInfo[] = [];
      for (let i = 0; i < store.length; i++) {
        const k = store.key(i);
        if (!k || !k.startsWith(PREFIX)) continue;
        try { const p = JSON.parse(store.getItem(k)!) as SavedProject; out.push({ key: k, name: p.n, time: p.t, thumb: p.th }); } catch { /* skip damaged entry */ }
      }
      return out.sort((a, b) => b.time - a.time);
    },
    save(name: string, doc: SavedProject['d'], thumb = ''): string {
      const key = PREFIX + Date.now() + '-' + Math.floor(Math.random() * 1e4);
      store.setItem(key, JSON.stringify({ n: name, t: Date.now(), th: thumb, d: doc } satisfies SavedProject));
      return key;
    },
    open(key: string): Doc | null {
      try { return (JSON.parse(store.getItem(key)!) as SavedProject).d; } catch { return null; }
    },
    remove(key: string) { store.removeItem(key); },
  };
}

/** Project files are plain JSON so they can be shared, backed up or opened on another device. */
export function serializeProject(doc: object): string { return JSON.stringify(doc); }
export function parseProject(text: string): Doc {
  const o = JSON.parse(text);
  if (!Array.isArray(o.nails) || !Array.isArray(o.threads)) throw new Error('Not a String Art Studio project');
  return o as Doc;
}

export async function shareOrDownload(text: string, filename = 'string-art-project.json'): Promise<'shared' | 'downloaded'> {
  const file = new File([text], filename, { type: 'application/json' });
  const nav = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean };
  if (nav.canShare && nav.canShare({ files: [file] })) { await nav.share({ files: [file] }); return 'shared'; }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(file); a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  return 'downloaded';
}
