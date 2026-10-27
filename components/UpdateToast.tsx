import { useServiceWorker } from '../hooks/useServiceWorker.ts';

export default function UpdateToast() {
  const { updateReady, update } = useServiceWorker();
  if (!updateReady) return null;
  return (
    <div role="status" className="fixed left-1/2 top-3 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full bg-slate-900 px-4 py-2 text-sm text-white shadow-lg">
      A new version is ready.
      <button className="rounded-full bg-blue-500 px-3 py-1 font-semibold" onClick={update}>Update</button>
    </div>
  );
}
