import type { Session, User } from './types';
import { USUARIOS } from './constants';

const SESSION_KEY = 'fleetfuel_session';

export function login(username: string, password: string): Session | null {
  const user = USUARIOS.find(
    (u) => u.username === username && u.password === password
  );
  if (!user) return null;

  const session: Session = {
    username: user.username,
    nombre: user.nombre,
    loggedInAt: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  return session;
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
