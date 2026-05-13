export interface User {
  username: string;
  nombre: string;
}

export interface Usuario {
  username: string;
  nombre: string;
  password?: string;
  role: 'admin' | 'conductor';
}

export interface Session {
  username: string;
  nombre: string;
  role: 'admin' | 'conductor';
  loggedInAt: string;
}

export interface Vehiculo {
  id: string;
  nombre: string;
  placa: string;
}

export interface RegistroCombustible {
  id: string;
  userId: string;
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
