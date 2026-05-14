import type { Vehiculo, TipoCombustible, Proveedor, SubProyecto } from './types';
import { apiGetVehiculos, apiGetTiposCombustible, apiGetProveedores, apiGetSubProyectos } from './api';

export interface Catalogs {
  vehiculos: Vehiculo[];
  tiposCombustible: TipoCombustible[];
  proveedores: Proveedor[];
  subProyectos: SubProyecto[];
}

let cache: Catalogs | null = null;

export async function loadCatalogs(): Promise<Catalogs> {
  if (cache) return cache;
  const [vehiculos, tiposCombustible, proveedores, subProyectos] = await Promise.all([
    apiGetVehiculos(),
    apiGetTiposCombustible(),
    apiGetProveedores(),
    apiGetSubProyectos(),
  ]);
  cache = { vehiculos, tiposCombustible, proveedores, subProyectos };
  return cache;
}

export async function clearCatalogCache(): Promise<void> {
  cache = null;
}
