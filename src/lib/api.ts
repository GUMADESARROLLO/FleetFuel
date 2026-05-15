import type { RegistroCombustible, Usuario, Vehiculo, TipoCombustible, Proveedor, SubProyecto, UnidadNegocio } from './types';

export interface PaginatedResponse {
  data: RegistroCombustible[];
  total: number;
  page: number;
  pageSize: number;
}

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

export async function apiGetRegistrosPaginated(params?: {
  userId?: number;
  unidadNegocioId?: number;
  desde?: string;
  hasta?: string;
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}): Promise<PaginatedResponse> {
  const search = new URLSearchParams();
  if (params?.userId) search.set('userId', String(params.userId));
  if (params?.unidadNegocioId) search.set('unidadNegocioId', String(params.unidadNegocioId));
  if (params?.desde) search.set('desde', params.desde);
  if (params?.hasta) search.set('hasta', params.hasta);
  if (params?.page) search.set('page', String(params.page));
  if (params?.pageSize) search.set('pageSize', String(params.pageSize));
  if (params?.search) search.set('search', params.search);
  if (params?.sortBy) search.set('sortBy', params.sortBy);
  if (params?.sortDir) search.set('sortDir', params.sortDir);
  const qs = search.toString();
  const res = await fetch(`${BASE}/registros${qs ? '?' + qs : ''}`);
  if (!res.ok) throw new Error('Error fetching registros');
  return res.json();
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

// --- Catálogos: Vehículos ---

export async function apiGetVehiculos(): Promise<Vehiculo[]> {
  const res = await fetch(`${BASE}/vehiculos`);
  if (!res.ok) throw new Error('Error fetching vehiculos');
  const json = await res.json();
  return json.data || [];
}

export async function apiCreateVehiculo(data: { nombre: string; placa: string }): Promise<void> {
  const res = await fetch(`${BASE}/vehiculos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error creating vehiculo');
  }
}

export async function apiUpdateVehiculo(data: { id: string; nombre?: string; placa?: string; activo?: boolean }): Promise<void> {
  const res = await fetch(`${BASE}/vehiculos`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error updating vehiculo');
  }
}

export async function apiDeleteVehiculo(id: string): Promise<void> {
  const res = await fetch(`${BASE}/vehiculos`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error deleting vehiculo');
  }
}

// --- Catálogos: Tipos de Combustible ---

export async function apiGetTiposCombustible(): Promise<TipoCombustible[]> {
  const res = await fetch(`${BASE}/tipos-combustible`);
  if (!res.ok) throw new Error('Error fetching tipos combustible');
  const json = await res.json();
  return json.data || [];
}

export async function apiCreateTipoCombustible(nombre: string): Promise<void> {
  const res = await fetch(`${BASE}/tipos-combustible`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error creating tipo combustible');
  }
}

export async function apiUpdateTipoCombustible(id: number, nombre: string): Promise<void> {
  const res = await fetch(`${BASE}/tipos-combustible`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, nombre }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error updating tipo combustible');
  }
}

export async function apiDeleteTipoCombustible(id: number): Promise<void> {
  const res = await fetch(`${BASE}/tipos-combustible`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error deleting tipo combustible');
  }
}

// --- Catálogos: Proveedores ---

export async function apiGetProveedores(): Promise<Proveedor[]> {
  const res = await fetch(`${BASE}/proveedores`);
  if (!res.ok) throw new Error('Error fetching proveedores');
  const json = await res.json();
  return json.data || [];
}

export async function apiCreateProveedor(nombre: string): Promise<void> {
  const res = await fetch(`${BASE}/proveedores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error creating proveedor');
  }
}

export async function apiUpdateProveedor(id: number, nombre: string): Promise<void> {
  const res = await fetch(`${BASE}/proveedores`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, nombre }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error updating proveedor');
  }
}

export async function apiDeleteProveedor(id: number): Promise<void> {
  const res = await fetch(`${BASE}/proveedores`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error deleting proveedor');
  }
}

// --- Catálogos: Sub Proyectos ---

export async function apiGetSubProyectos(): Promise<SubProyecto[]> {
  const res = await fetch(`${BASE}/sub-proyectos`);
  if (!res.ok) throw new Error('Error fetching sub proyectos');
  const json = await res.json();
  return json.data || [];
}

export async function apiCreateSubProyecto(nombre: string): Promise<void> {
  const res = await fetch(`${BASE}/sub-proyectos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error creating sub proyecto');
  }
}

export async function apiUpdateSubProyecto(id: number, nombre: string): Promise<void> {
  const res = await fetch(`${BASE}/sub-proyectos`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, nombre }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error updating sub proyecto');
  }
}

export async function apiDeleteSubProyecto(id: number): Promise<void> {
  const res = await fetch(`${BASE}/sub-proyectos`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error deleting sub proyecto');
  }
}

// --- Upload ---

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

// --- Catálogos: Unidades de Negocio ---

export async function apiGetUnidadesNegocio(): Promise<UnidadNegocio[]> {
  const res = await fetch(`${BASE}/unidades-negocio`);
  if (!res.ok) throw new Error('Error fetching unidades negocio');
  const json = await res.json();
  return json.data || [];
}

export async function apiCreateUnidadNegocio(nombre: string): Promise<void> {
  const res = await fetch(`${BASE}/unidades-negocio`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error creating unidad negocio');
  }
}

export async function apiUpdateUnidadNegocio(id: number, nombre: string): Promise<void> {
  const res = await fetch(`${BASE}/unidades-negocio`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, nombre }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error updating unidad negocio');
  }
}

export async function apiDeleteUnidadNegocio(id: number): Promise<void> {
  const res = await fetch(`${BASE}/unidades-negocio`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error deleting unidad negocio');
  }
}
