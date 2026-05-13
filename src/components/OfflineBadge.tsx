import { useEffect, useState } from 'react';

export default function OfflineBadge() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <span
      class={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider transition-all duration-300 ${
        isOnline
          ? 'bg-success/20 text-success'
          : 'bg-danger/20 text-danger'
      }`}
    >
      <span class={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-success' : 'bg-danger'}`} />
      {isOnline ? 'Online' : 'Offline'}
    </span>
  );
}
