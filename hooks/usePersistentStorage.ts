import { useEffect, useState } from 'react';

/** Asks the browser to keep this app's data, and reports how much space the designs use. */
export function usePersistentStorage() {
  const [info, setInfo] = useState<{ persisted: boolean; usedMB: number; quotaMB: number } | null>(null);
  useEffect(() => {
    const s = navigator.storage;
    if (!s) return;
    (async () => {
      const persisted = s.persist ? await s.persist().catch(() => false) : false;
      const est = s.estimate ? await s.estimate() : {};
      setInfo({ persisted, usedMB: (est.usage || 0) / 1048576, quotaMB: (est.quota || 0) / 1048576 });
    })();
  }, []);
  return info;
}
