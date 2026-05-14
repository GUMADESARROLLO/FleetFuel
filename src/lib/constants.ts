import type { Vehiculo, TipoCombustible, Proveedor, SubProyecto } from './types';
import { apiGetVehiculos, apiGetTiposCombustible, apiGetProveedores, apiGetSubProyectos } from './api';

export interface Catalogs {
  vehiculos: Vehiculo[];
  tiposCombustible: TipoCombustible[];
  proveedores: Proveedor[];
  subProyectos: SubProyecto[];
}

let cache: Catalogs | null = null;
const STORAGE_KEY = 'fleetfuel_catalogs';

function saveCatalogs(data: Catalogs): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

function loadCatalogsFromStorage(): Catalogs | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function fetchCatalogs(): Promise<Catalogs> {
  const [vehiculos, tiposCombustible, proveedores, subProyectos] = await Promise.all([
    apiGetVehiculos(),
    apiGetTiposCombustible(),
    apiGetProveedores(),
    apiGetSubProyectos(),
  ]);
  return { vehiculos, tiposCombustible, proveedores, subProyectos };
}

export async function loadCatalogs(): Promise<Catalogs> {
  if (cache) return cache;

  const stored = loadCatalogsFromStorage();
  if (stored) {
    cache = stored;
    fetchCatalogs()
      .then((fresh) => {
        cache = fresh;
        saveCatalogs(fresh);
      })
      .catch(() => {});
    return stored;
  }

  const fresh = await fetchCatalogs();
  cache = fresh;
  saveCatalogs(fresh);
  return fresh;
}

export async function clearCatalogCache(): Promise<void> {
  cache = null;
  if (typeof window !== 'undefined') {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }
}
