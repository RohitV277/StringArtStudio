import { useCallback, useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event { prompt(): Promise<void>; userChoice: Promise<{ outcome: string }> }

const DISMISS_KEY = 'ssd-install-dismissed';

/** Android and desktop browsers can install with one tap. Safari on iPad and iPhone needs the Share sheet, so we show a hint. */
export function useInstallPrompt() {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(() => { try { return localStorage.getItem(DISMISS_KEY) === '1'; } catch { return false; } });
  const standalone = typeof window !== 'undefined' && (window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true);
  const ua = typeof navigator === 'undefined' ? '' : navigator.userAgent;
  const iosSafari = /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);

  useEffect(() => {
    const h = (e: Event) => { e.preventDefault(); setEvent(e as BeforeInstallPromptEvent); };
    window.addEventListener('beforeinstallprompt', h);
    return () => window.removeEventListener('beforeinstallprompt', h);
  }, []);

  const install = useCallback(async () => { if (!event) return; await event.prompt(); await event.userChoice; setEvent(null); }, [event]);
  const dismiss = useCallback(() => { setDismissed(true); try { localStorage.setItem(DISMISS_KEY, '1'); } catch { /* ignore */ } }, []);

  return { canInstall: !standalone && !dismissed && !!event, showIosHint: !standalone && !dismissed && iosSafari && !event, install, dismiss };
}
