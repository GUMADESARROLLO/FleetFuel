import { query } from '../../../lib/db';
import type { RegistroCombustible } from '../../../lib/types';

const FIELDS = `r.id, r.user_id, r.fecha_creacion, r.foto_odometro_antes, r.foto_odometro_despues,
  r.foto_factura, r.foto_voucher, r.vehiculo_id, r.vehiculo_nombre, r.vehiculo_placa,
  tc.nombre AS tipo_combustible, p.nombre AS proveedor, sp.nombre AS sub_proyecto,
  r.kilometraje, r.fecha_factura,
  r.numero_factura, r.numero_voucher, r.gravadas, r.isr, r.excedentes, r.litros,
  r.importe_total, r.ruta_recorrida, r.sincronizado`;

const JOINS = `FROM registros_combustible r
  LEFT JOIN tipos_combustible tc ON r.tipo_combustible_id = tc.id
  LEFT JOIN proveedores p ON r.proveedor_id = p.id
  LEFT JOIN sub_proyectos sp ON r.sub_proyecto_id = sp.id`;

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
    const rows = await query<any[]>(`SELECT ${FIELDS} ${JOINS} WHERE r.id = ?`, [params.id]);
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
