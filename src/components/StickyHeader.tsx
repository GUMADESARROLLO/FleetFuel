import { useEffect, useState } from 'react';
import OfflineBadge from './OfflineBadge';
import SyncIndicator from './SyncIndicator';
import { getSession, logout } from '../lib/auth';
import type { Session } from '../lib/types';

interface StickyHeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
}

export default function StickyHeader({ title, showBack, onBack }: StickyHeaderProps) {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    setSession(getSession());
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <header className="sticky top-0 z-30 bg-bg/95 backdrop-blur-lg border-b border-border safe-area-top">
      <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={onBack || (() => window.history.back())}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface transition-colors touch-target"
            >
              <svg className="w-5 h-5 text-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          {!title && (
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="font-display font-bold text-lg text-text">FleetFuel</span>
            </div>
          )}
          {title && (
            <h1 className="font-display font-bold text-lg text-text">{title}</h1>
          )}
          <OfflineBadge />
          <SyncIndicator />
        </div>
        {session && (
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-medium text-text">{session.nombre}</span>
              <span className="text-[10px] text-text-muted">@{session.username}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center sm:hidden">
              <span className="text-xs font-bold text-white">{session.nombre.charAt(0)}</span>
            </div>
            <button
              onClick={handleLogout}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface transition-colors text-text-muted hover:text-danger touch-target"
              title="Cerrar sesión"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
