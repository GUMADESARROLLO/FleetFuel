import type { RegistroCombustible, Usuario, Vehiculo } from './types';

const BASE = '/api';

export async function apiGetRegistros(params?: {
  userId?: number;
  desde?: string;
  hasta?: string;
}): Promise<RegistroCombustible[]> {
  const search = new URLSearchParams();
  if (params?.userId) search.set('userId', String(params.userId));
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

export async function apiGetRoles(): Promise<{ id: number; nombre: string }[]> {
  const res = await fetch(`${BASE}/roles`);
  if (!res.ok) throw new Error('Error fetching roles');
  const json = await res.json();
  return json.data || [];
}

export async function apiGetVehiculos(): Promise<Vehiculo[]> {
  const res = await fetch(`${BASE}/vehiculos`);
  if (!res.ok) throw new Error('Error fetching vehiculos');
  const json = await res.json();
  return json.data || [];
}

export async function apiGetTiposCombustible(): Promise<string[]> {
  const res = await fetch(`${BASE}/tipos-combustible`);
  if (!res.ok) throw new Error('Error fetching tipos combustible');
  const json = await res.json();
  return json.data || [];
}

export async function apiGetProveedores(): Promise<string[]> {
  const res = await fetch(`${BASE}/proveedores`);
  if (!res.ok) throw new Error('Error fetching proveedores');
  const json = await res.json();
  return json.data || [];
}

export async function apiGetSubProyectos(): Promise<string[]> {
  const res = await fetch(`${BASE}/sub-proyectos`);
  if (!res.ok) throw new Error('Error fetching sub proyectos');
  const json = await res.json();
  return json.data || [];
}

export async function apiUploadImage(
  base64: string,
  username: string,
  registroId: string,
  field: string
): Promise<string> {
  const res = await fetch(`${BASE}/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base64, username, registroId, field }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error uploading image');
  }
  const json = await res.json();
  return json.url;
}
