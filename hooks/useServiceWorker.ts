import { useCallback, useEffect, useState } from 'react';

/** Registers the offline cache and reports when a new version is waiting. */
export function useServiceWorker() {
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol) || import.meta.env.DEV) return;
    let cancelled = false;
    navigator.serviceWorker.register(new URL('sw.js', document.baseURI)).then(reg => {
      if (cancelled) return;
      if (reg.waiting && navigator.serviceWorker.controller) setWaiting(reg.waiting);
      reg.addEventListener('updatefound', () => {
        const w = reg.installing;
        w?.addEventListener('statechange', () => {
          if (w.state === 'installed' && navigator.serviceWorker.controller) setWaiting(w);
        });
      });
    }).catch(() => { /* offline cache is optional */ });
    return () => { cancelled = true; };
  }, []);

  const update = useCallback(() => {
    waiting?.postMessage({ type: 'SKIP_WAITING' });
    navigator.serviceWorker.addEventListener('controllerchange', () => location.reload(), { once: true });
  }, [waiting]);

  return { updateReady: !!waiting, update };
}
