import type { RegistroCombustible, DraftRegistro } from './types';
import { VEHICULOS } from './constants';

const DRAFT_KEY = 'fleetfuel_draft';
const PENDING_SYNC_KEY = 'fleetfuel_pending_sync';

function registrosKey(userId: string): string {
  return `fleetfuel_registros_${userId}`;
}

export function getRegistros(userId: string): RegistroCombustible[] {
  if (typeof window === 'undefined') return [];

  const raw = localStorage.getItem(registrosKey(userId));
  if (!raw) return [];

  try {
    return JSON.parse(raw) as RegistroCombustible[];
  } catch {
    return [];
  }
}

export function saveRegistro(
  userId: string,
  registro: RegistroCombustible
): void {
  if (typeof window === 'undefined') return;

  const registros = getRegistros(userId);
  registros.unshift(registro);
  localStorage.setItem(registrosKey(userId), JSON.stringify(registros));
}

export function getRegistroById(
  userId: string,
  id: string
): RegistroCombustible | undefined {
  return getRegistros(userId).find((r) => r.id === id);
}

export function getRegistrosDelMes(
  userId: string
): RegistroCombustible[] {
  const now = new Date();
  const mes = now.getMonth();
  const anio = now.getFullYear();

  return getRegistros(userId).filter((r) => {
    const fecha = new Date(r.fechaCreacion);
    return fecha.getMonth() === mes && fecha.getFullYear() === anio;
  });
}

export function getRegistrosPorMes(
  userId: string,
  mes: number,
  anio: number
): RegistroCombustible[] {
  return getRegistros(userId).filter((r) => {
    const fecha = new Date(r.fechaCreacion);
    return fecha.getMonth() === mes && fecha.getFullYear() === anio;
  });
}

export function getUltimosRegistros(
  userId: string,
  count: number = 5
): RegistroCombustible[] {
  return getRegistros(userId).slice(0, count);
}

export function getTotalLitros(userId: string): number {
  return getRegistrosDelMes(userId).reduce(
    (sum, r) => sum + (r.litros || 0),
    0
  );
}

export function getTotalImporte(userId: string): number {
  return getRegistrosDelMes(userId).reduce(
    (sum, r) => sum + (r.importeTotal || 0),
    0
  );
}

export function getUltimoVehiculo(
  userId: string
): string {
  const registros = getRegistros(userId);
  if (registros.length === 0) return 'Ninguno';
  return registros[0].vehiculoNombre || 'Desconocido';
}

export function saveDraft(draft: Partial<DraftRegistro>): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function getDraft(): Partial<DraftRegistro> | null {
  if (typeof window === 'undefined') return null;

  const raw = localStorage.getItem(DRAFT_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as Partial<DraftRegistro>;
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(DRAFT_KEY);
}

export function getPendingSyncCount(): number {
  if (typeof window === 'undefined') return 0;

  const raw = localStorage.getItem(PENDING_SYNC_KEY);
  if (!raw) return 0;

  try {
    const ids = JSON.parse(raw) as string[];
    return ids.length;
  } catch {
    return 0;
  }
}

export function markPendingSync(id: string): void {
  if (typeof window === 'undefined') return;

  const raw = localStorage.getItem(PENDING_SYNC_KEY);
  let ids: string[] = [];
  if (raw) {
    try {
      ids = JSON.parse(raw) as string[];
    } catch {
      ids = [];
    }
  }
  if (!ids.includes(id)) {
    ids.push(id);
    localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(ids));
  }
}

export function clearPendingSync(id: string): void {
  if (typeof window === 'undefined') return;

  const raw = localStorage.getItem(PENDING_SYNC_KEY);
  if (!raw) return;

  try {
    const ids = JSON.parse(raw) as string[];
    const filtered = ids.filter((i) => i !== id);
    localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(filtered));
  } catch {
    // ignore
  }
}

export function getMesesDisponibles(
  userId: string
): { mes: number; anio: number }[] {
  const registros = getRegistros(userId);
  const meses = new Set<string>();

  registros.forEach((r) => {
    const fecha = new Date(r.fechaCreacion);
    meses.add(`${fecha.getMonth()}-${fecha.getFullYear()}`);
  });

  return Array.from(meses)
    .map((m) => {
      const [mes, anio] = m.split('-').map(Number);
      return { mes, anio };
    })
    .sort((a, b) => b.anio - a.anio || b.mes - a.mes);
}

export function getNombreMes(mes: number): string {
  const nombres = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];
  return nombres[mes] || '';
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
