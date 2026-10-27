import { useInstallPrompt } from '../hooks/useInstallPrompt.ts';

export default function InstallPrompt() {
  const { canInstall, showIosHint, install, dismiss } = useInstallPrompt();
  if (!canInstall && !showIosHint) return null;
  return (
    <div role="dialog" aria-label="Install String Art Studio" className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-md rounded-2xl bg-white p-4 text-slate-900 shadow-2xl" style={{ marginBottom: 'env(safe-area-inset-bottom)' }}>
      <p className="font-semibold">Install String Art Studio</p>
      <p className="mt-1 text-sm text-slate-600">
        {canInstall ? 'Add it to your home screen. It works offline and keeps your designs on this device.' : 'Tap the Share button, then Add to Home Screen. It works offline and keeps your designs on this device.'}
      </p>
      <div className="mt-3 flex gap-2">
        {canInstall && <button className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white" onClick={install}>Install</button>}
        <button className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold" onClick={dismiss}>Not now</button>
      </div>
    </div>
  );
}
