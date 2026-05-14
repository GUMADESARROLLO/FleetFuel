import type { RegistroCombustible, DraftRegistro } from './types';
import { VEHICULOS } from './constants';
import { saveRegistroDB, getAllRegistrosDB, getRegistroByIdDB } from './idb';
import { apiGetRegistros, apiGetRegistroById, apiSaveRegistro, apiSyncRegistros, apiUploadImage } from './api';

const DRAFT_KEY = 'fleetfuel_draft';
const PENDING_SYNC_KEY = 'fleetfuel_pending_sync';

export async function getRegistros(userId?: string): Promise<RegistroCombustible[]> {
  if (typeof window === 'undefined') return [];
  if (navigator.onLine) {
    try {
      return await apiGetRegistros(userId ? { userId } : undefined);
    } catch {
      return await getAllRegistrosDB(userId).catch(() => []);
    }
  }
  try {
    return await getAllRegistrosDB(userId);
  } catch {
    return [];
  }
}

export async function saveRegistro(
  userId: string,
  registro: RegistroCombustible
): Promise<void> {
  if (typeof window === 'undefined') return;
  await saveRegistroDB(registro);
  if (navigator.onLine) {
    try {
      await apiSaveRegistro(registro);
    } catch {
      markPendingSync(registro.id);
    }
  } else {
    markPendingSync(registro.id);
  }
}

export async function getRegistroById(
  userId: string,
  id: string
): Promise<RegistroCombustible | undefined> {
  if (typeof window === 'undefined') return undefined;
  if (navigator.onLine) {
    try {
      const apiReg = await apiGetRegistroById(id);
      if (apiReg) return apiReg;
    } catch {
      // fallback to IndexedDB
    }
  }
  try {
    return await getRegistroByIdDB(id);
  } catch {
    return undefined;
  }
}

export async function syncPendingRegistros(ids: string[]): Promise<void> {
  if (typeof window === 'undefined') return;
  for (const id of ids) {
    try {
      const reg = await getRegistroByIdDB(id);
      if (!reg) continue;

      const session = JSON.parse(localStorage.getItem('fleetfuel_session') || '{}');
      const username = session.username || 'unknown';

      const imageFields = [
        { field: 'fotoOdometroAntes', key: 'odometro_antes' },
        { field: 'fotoOdometroDespues', key: 'odometro_despues' },
        { field: 'fotoFactura', key: 'factura' },
        { field: 'fotoVoucher', key: 'voucher' },
      ] as const;

      for (const { field, key } of imageFields) {
        const value = reg[field as keyof RegistroCombustible] as string;
        if (value && value.startsWith('data:')) {
          try {
            const url = await apiUploadImage(value, username, reg.id, key);
            (reg as any)[field] = url;
          } catch {
            // if image upload fails, keep base64 for later retry
          }
        }
      }

      reg.sincronizado = true;
      await apiSaveRegistro(reg);
      await saveRegistroDB(reg);
    } catch {
      // skip failed syncs
    }
  }
}

export async function getRegistrosDelMes(
  userId: string
): Promise<RegistroCombustible[]> {
  const now = new Date();
  const mes = now.getMonth();
  const anio = now.getFullYear();
  const registros = await getRegistros(userId);

  return registros.filter((r) => {
    const fecha = new Date(r.fechaCreacion);
    return fecha.getMonth() === mes && fecha.getFullYear() === anio;
  });
}

export async function getRegistrosPorMes(
  userId: string,
  mes: number,
  anio: number
): Promise<RegistroCombustible[]> {
  const registros = await getRegistros(userId);
  return registros.filter((r) => {
    const fecha = new Date(r.fechaCreacion);
    return fecha.getMonth() === mes && fecha.getFullYear() === anio;
  });
}

export async function getUltimosRegistros(
  userId: string,
  count: number = 5
): Promise<RegistroCombustible[]> {
  const registros = await getRegistros(userId);
  return registros.slice(0, count);
}

export async function getTotalLitros(userId: string): Promise<number> {
  const registros = await getRegistrosDelMes(userId);
  return registros.reduce((sum, r) => sum + (r.litros || 0), 0);
}

export async function getTotalImporte(userId: string): Promise<number> {
  const registros = await getRegistrosDelMes(userId);
  return registros.reduce((sum, r) => sum + (r.importeTotal || 0), 0);
}

export async function getUltimoVehiculo(userId: string): Promise<string> {
  const registros = await getRegistros(userId);
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

export function getPendingSyncIds(): string[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(PENDING_SYNC_KEY);
  if (!raw) return [];
  try {
    const ids = JSON.parse(raw) as string[];
    return Array.isArray(ids) ? ids : [];
  } catch {
    return [];
  }
}

export function clearAllPendingSync(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PENDING_SYNC_KEY);
}

export async function getMesesDisponibles(
  userId: string
): Promise<{ mes: number; anio: number }[]> {
  const registros = await getRegistros(userId);
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
  return new Intl.NumberFormat('es-NI', {
    style: 'currency',
    currency: 'NIO',
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
