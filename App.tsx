import ErrorBoundary from './components/ErrorBoundary.tsx';
import Studio from './components/Studio.tsx';
import OfflineBadge from './components/OfflineBadge.tsx';
import InstallPrompt from './components/InstallPrompt.tsx';
import UpdateToast from './components/UpdateToast.tsx';
import { usePersistentStorage } from './hooks/usePersistentStorage.ts';

/** The new dark studio (public/studio.html) is the default. Add ?legacy=1 to open the previous touch UI. */
const legacy = new URLSearchParams(location.search).has('legacy');

export default function App() {
  usePersistentStorage(); // ask the browser to keep saved designs
  return (
    <ErrorBoundary>
      {legacy ? (
        <Studio />
      ) : (
        <iframe
          title="String Art Studio"
          src={import.meta.env.BASE_URL + 'studio.html'}
          style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', border: 0, background: '#242424' }}
          allow="clipboard-write"
        />
      )}
      <OfflineBadge />
      <UpdateToast />
      <InstallPrompt />
    </ErrorBoundary>
  );
}
