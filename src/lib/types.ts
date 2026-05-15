export interface User {
  username: string;
  nombre: string;
}

export interface Usuario {
  id: number;
  username: string;
  nombre: string;
  password?: string;
  role: 'admin' | 'conductor';
}

export interface Session {
  id: number;
  username: string;
  nombre: string;
  role: 'admin' | 'conductor';
  loggedInAt: string;
}

export interface Vehiculo {
  id: string;
  nombre: string;
  placa: string;
  activo?: number;
}

export interface TipoCombustible {
  id: number;
  nombre: string;
}

export interface Proveedor {
  id: number;
  nombre: string;
}

export interface SubProyecto {
  id: number;
  nombre: string;
}

export interface RegistroCombustible {
  id: string;
  userId: number;
  conductorNombre?: string;
  fechaCreacion: string;
  fotoOdometroAntes: string;
  fotoOdometroDespues: string;
  fotoFactura: string;
  fotoVoucher: string;
  vehiculoId: string;
  vehiculoNombre: string;
  vehiculoPlaca: string;
  tipoCombustible: string;
  proveedor: string;
  subProyecto: string;
  kilometraje: number;
  fechaFactura: string;
  numeroFactura: string;
  numeroVoucher: string;
  gravadas: number;
  isr: number;
  excedentes: number;
  litros: number;
  importeTotal: number;
  rutaRecorrida: string;
  sincronizado: boolean;
}

export interface DraftRegistro {
  fotoOdometroAntes: string;
  fotoOdometroDespues: string;
  fotoFactura: string;
  fotoVoucher: string;
  vehiculoId: string;
  tipoCombustible: string;
  proveedor: string;
  subProyecto: string;
  kilometraje: string;
  fechaFactura: string;
  numeroFactura: string;
  numeroVoucher: string;
  gravadas: string;
  isr: string;
  excedentes: string;
  litros: string;
  importeTotal: string;
  rutaRecorrida: string;
}
