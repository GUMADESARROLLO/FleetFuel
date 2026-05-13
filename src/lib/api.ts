import type { RegistroCombustible, Usuario } from './types';

const BASE = '/api';

export async function apiGetRegistros(params?: {
  userId?: string;
  desde?: string;
  hasta?: string;
}): Promise<RegistroCombustible[]> {
  const search = new URLSearchParams();
  if (params?.userId) search.set('userId', params.userId);
  if (params?.desde) search.set('desde', params.desde);
  if (params?.hasta) search.set('hasta', params.hasta);
  const qs = search.toString();
  const res = await fetch(`${BASE}/registros${qs ? '?' + qs : ''}`);
  if (!res.ok) throw new Error('Error fetching registros');
  const json = await res.json();
  return json.data || [];
}

export async function apiGetRegistroById(id: string): Promise<RegistroCombustible | null> {
  const res = await fetch(`${BASE}/registros/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Error fetching registro');
  return res.json();
}

export async function apiSaveRegistro(registro: RegistroCombustible): Promise<void> {
  const res = await fetch(`${BASE}/registros`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(registro),
  });
  if (!res.ok) throw new Error('Error saving registro');
}

export async function apiSyncRegistros(ids: string[]): Promise<void> {
  const res = await fetch(`${BASE}/registros`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids, sincronizado: true }),
  });
  if (!res.ok) throw new Error('Error syncing registros');
}

export async function apiGetUsuarios(): Promise<Usuario[]> {
  const res = await fetch(`${BASE}/usuarios`);
  if (!res.ok) throw new Error('Error fetching usuarios');
  const json = await res.json();
  return json.data || [];
}

export async function apiCreateUsuario(usuario: Usuario): Promise<void> {
  const res = await fetch(`${BASE}/usuarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(usuario),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error creating usuario');
  }
}

export async function apiUpdateUsuario(username: string, usuario: Partial<Usuario>): Promise<void> {
  const res = await fetch(`${BASE}/usuarios`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, ...usuario }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error updating usuario');
  }
}

export async function apiDeleteUsuario(username: string): Promise<void> {
  const res = await fetch(`${BASE}/usuarios`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error deleting usuario');
  }
}
