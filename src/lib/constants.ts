import type { Vehiculo } from './types';

export const VEHICULOS: Vehiculo[] = [
  { id: '1', nombre: 'Pickup Toyota Hilux', placa: 'ABC-123' },
  { id: '2', nombre: 'Van Ford Transit', placa: 'DEF-456' },
];

export const TIPOS_COMBUSTIBLE = [
  'Gasolina Regular',
  'Gasolina Premium',
  'Diesel',
  'GLP',
];

export const PROVEEDORES = [
  'PUMA Energy',
  'UNO',
  'ESSO',
  'Shell',
  'Petronic',
];

export const SUB_PROYECTOS = [
  'Proyecto Alpha',
  'Proyecto Beta',
  'Operaciones Generales',
];

export const USUARIOS = [
  { username: 'conductor1', password: 'flota2024', nombre: 'Carlos Mejía' },
  { username: 'conductor2', password: 'flota2024', nombre: 'Ana López' },
];
