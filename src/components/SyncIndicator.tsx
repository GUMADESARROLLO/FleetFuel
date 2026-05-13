import { useEffect, useState, useRef } from 'react';
import { getPendingSyncIds, clearAllPendingSync, syncPendingRegistros } from '../lib/storage';

type SyncState = 'idle' | 'pending' | 'syncing' | 'complete';

export default function SyncIndicator() {
  const [state, setState] = useState<SyncState>('idle');
  const [count, setCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const stateRef = useRef<SyncState>('idle');

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  async function processSync(ids: string[]) {
    if (ids.length === 0) return;
    setState('syncing');
    setCount(ids.length);
    setProgress(0);

    await syncPendingRegistros(ids);
    setProgress(ids.length);

    clearAllPendingSync();
    setState('complete');
    setTimeout(() => setState('idle'), 2500);
  }

  useEffect(() => {
    const pending = getPendingSyncIds();
    if (pending.length > 0) {
      setCount(pending.length);
      if (navigator.onLine) {
        processSync(pending);
      } else {
        setState('pending');
      }
    }

    const handleSync = (e: CustomEvent) => {
      const ids = e.detail as string[];
      if (ids.length > 0) processSync(ids);
    };

    const handleOnline = () => {
      const pending = getPendingSyncIds();
      if (pending.length > 0 && stateRef.current === 'pending') {
        processSync(pending);
      }
    };

    window.addEventListener('fleetfuel-synced', handleSync as EventListener);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('fleetfuel-synced', handleSync as EventListener);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (state === 'idle') return null;

  return (
    <div className="flex items-center">
      {state === 'pending' && (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full whitespace-nowrap">
          <svg className="w-3 h-3 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          {count}
        </span>
      )}
      {state === 'syncing' && (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-info bg-info/10 px-2 py-0.5 rounded-full whitespace-nowrap">
          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {progress}/{count}
        </span>
      )}
      {state === 'complete' && (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full whitespace-nowrap animate-fade-out">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
      )}
    </div>
  );
}
