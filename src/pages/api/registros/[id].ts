import { query } from '../../../lib/db';
import type { RegistroCombustible } from '../../../lib/types';

const FIELDS = `id, user_id, fecha_creacion, foto_odometro_antes, foto_odometro_despues,
  foto_factura, foto_voucher, vehiculo_id, vehiculo_nombre, vehiculo_placa,
  tipo_combustible, proveedor, sub_proyecto, kilometraje, fecha_factura,
  numero_factura, numero_voucher, gravadas, isr, excedentes, litros,
  importe_total, ruta_recorrida, sincronizado`;

function mapRow(r: any): RegistroCombustible {
  return {
    id: r.id,
    userId: r.user_id,
    fechaCreacion: r.fecha_creacion instanceof Date ? r.fecha_creacion.toISOString() : r.fecha_creacion,
    fotoOdometroAntes: r.foto_odometro_antes,
    fotoOdometroDespues: r.foto_odometro_despues,
    fotoFactura: r.foto_factura,
    fotoVoucher: r.foto_voucher,
    vehiculoId: r.vehiculo_id,
    vehiculoNombre: r.vehiculo_nombre,
    vehiculoPlaca: r.vehiculo_placa,
    tipoCombustible: r.tipo_combustible,
    proveedor: r.proveedor,
    subProyecto: r.sub_proyecto,
    kilometraje: r.kilometraje,
    fechaFactura: r.fecha_factura instanceof Date ? r.fecha_factura.toISOString().split('T')[0] : r.fecha_factura,
    numeroFactura: r.numero_factura,
    numeroVoucher: r.numero_voucher,
    gravadas: Number(r.gravadas),
    isr: Number(r.isr),
    excedentes: Number(r.excedentes),
    litros: Number(r.litros),
    importeTotal: Number(r.importe_total),
    rutaRecorrida: r.ruta_recorrida,
    sincronizado: Boolean(r.sincronizado),
  };
}

export async function GET({ params }: { params: { id: string } }) {
  try {
    const rows = await query<any[]>(`SELECT ${FIELDS} FROM registros_combustible WHERE id = ?`, [params.id]);
    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify(mapRow(rows[0])), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
