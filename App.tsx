import ErrorBoundary from './components/ErrorBoundary.tsx';
import Studio from './components/Studio.tsx';
import OfflineBadge from './components/OfflineBadge.tsx';
import InstallPrompt from './components/InstallPrompt.tsx';
import UpdateToast from './components/UpdateToast.tsx';
import { usePersistentStorage } from './hooks/usePersistentStorage.ts';

export default function App() {
  usePersistentStorage(); // ask the browser to keep saved designs
  return (
    <ErrorBoundary>
      <Studio />
      <OfflineBadge />
      <UpdateToast />
      <InstallPrompt />
    </ErrorBoundary>
  );
}
