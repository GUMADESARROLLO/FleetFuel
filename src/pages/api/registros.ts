import { query } from '../../lib/db';
import type { RegistroCombustible } from '../../lib/types';

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

export async function GET({ url }: { url: URL }) {
  try {
    const userId = url.searchParams.get('userId');
    const desde = url.searchParams.get('desde');
    const hasta = url.searchParams.get('hasta');

    let sql = `SELECT ${FIELDS} FROM registros_combustible WHERE 1=1`;
    const params: any[] = [];

    if (userId) {
      sql += ' AND user_id = ?';
      params.push(userId);
    }
    if (desde) {
      sql += ' AND fecha_creacion >= ?';
      params.push(new Date(desde));
    }
    if (hasta) {
      sql += ' AND fecha_creacion <= ?';
      params.push(new Date(hasta + 'T23:59:59'));
    }

    sql += ' ORDER BY fecha_creacion DESC';

    const rows = await query<any[]>(sql, params);
    const data = rows.map(mapRow);

    return new Response(JSON.stringify({ data }), {
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

export async function POST({ request }: { request: Request }) {
  try {
    const body = await request.json();

    // Convert ISO dates to MySQL-compatible DATETIME format
    const fechaCreacion = body.fechaCreacion
      ? new Date(body.fechaCreacion).toISOString().replace('T', ' ').replace(/\.\d{3}Z/, '')
      : new Date().toISOString().replace('T', ' ').replace(/\.\d{3}Z/, '');

    await query(
      `INSERT INTO registros_combustible
        (id, user_id, fecha_creacion, foto_odometro_antes, foto_odometro_despues,
         foto_factura, foto_voucher, vehiculo_id, vehiculo_nombre, vehiculo_placa,
         tipo_combustible, proveedor, sub_proyecto, kilometraje, fecha_factura,
         numero_factura, numero_voucher, gravadas, isr, excedentes, litros,
         importe_total, ruta_recorrida, sincronizado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        body.id, body.userId, fechaCreacion,
        body.fotoOdometroAntes || null, body.fotoOdometroDespues || null,
        body.fotoFactura || null, body.fotoVoucher || null,
        body.vehiculoId, body.vehiculoNombre, body.vehiculoPlaca,
        body.tipoCombustible, body.proveedor, body.subProyecto,
        body.kilometraje || 0, (body.fechaFactura || '').split('T')[0],
        body.numeroFactura, body.numeroVoucher || '',
        body.gravadas || 0, body.isr || 0, body.excedentes || 0,
        body.litros || 0, body.importeTotal || 0,
        body.rutaRecorrida || null, body.sincronizado ? 1 : 0,
      ]
    );

    return new Response(JSON.stringify({ success: true, id: body.id }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function PUT({ request }: { request: Request }) {
  try {
    const body = await request.json();

    if (body.id) {
      await query(
        `UPDATE registros_combustible SET sincronizado = ? WHERE id = ?`,
        [body.sincronizado ? 1 : 0, body.id]
      );
    } else if (body.ids && Array.isArray(body.ids)) {
      for (const id of body.ids) {
        await query(
          `UPDATE registros_combustible SET sincronizado = ? WHERE id = ?`,
          [body.sincronizado ? 1 : 0, id]
        );
      }
    }

    return new Response(JSON.stringify({ success: true }), {
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
