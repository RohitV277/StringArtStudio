import { useOnlineStatus } from '../hooks/useOnlineStatus.ts';

export default function OfflineBadge() {
  const online = useOnlineStatus();
  if (online) return null;
  return (
    <div role="status" className="fixed right-3 top-3 z-50 rounded-full bg-slate-900/90 px-3 py-1 text-xs font-medium text-white shadow-lg" style={{ marginTop: 'env(safe-area-inset-top)' }}>
      Offline. Everything still works and is saved on this device.
    </div>
  );
}
