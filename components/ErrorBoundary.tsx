import { Component, type ErrorInfo, type ReactNode } from 'react';

interface State { error: Error | null }

export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };
  static getDerivedStateFromError(error: Error): State { return { error }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('String Art Studio crashed', error, info); }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="m-6 rounded-2xl bg-white p-6 text-slate-900 shadow">
        <h1 className="text-lg font-bold">Something went wrong</h1>
        <p className="mt-2 text-sm text-slate-600">Your saved designs are still on this device. Reload to try again.</p>
        <button className="mt-4 rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white" onClick={() => location.reload()}>Reload</button>
      </div>
    );
  }
}
