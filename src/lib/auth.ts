import type { Session, User } from './types';

const SESSION_KEY = 'fleetfuel_session';

export async function login(username: string, password: string): Promise<Session | null> {
  if (typeof window === 'undefined') return null;

  try {
    console.log('[auth] Calling API login for', username);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    console.log('[auth] API response status:', res.status);

    if (res.status === 401) {
      console.log('[auth] Invalid credentials');
      return null;
    }
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.log('[auth] API error:', res.status, errData);
      return null;
    }

    const session: Session = await res.json();
    console.log('[auth] Login success for', session.nombre, 'role:', session.role);
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  } catch (err) {
    console.log('[auth] Network error:', err);
    return null;
  }
}

export function isAdmin(): boolean {
  const session = getSession();
  return session?.role?.toLowerCase().includes('admin') ?? false;
}

export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_KEY);
  }
}

export function getSession(): Session | null {
  if (typeof window === 'undefined') return null;

  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function getUser(): User | null {
  const session = getSession();
  if (!session) return null;
  return { username: session.username, nombre: session.nombre };
}

export function isAuthenticated(): boolean {
  return getSession() !== null;
}

export function requireAuth(): void {
  if (typeof window === 'undefined') return;
  if (!isAuthenticated()) {
    window.location.href = '/login';
  }
}
