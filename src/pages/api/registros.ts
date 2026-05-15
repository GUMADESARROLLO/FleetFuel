import { query } from '../../lib/db';
import type { RegistroCombustible } from '../../lib/types';

const FIELDS = `r.id, r.user_id, r.fecha_creacion, r.foto_odometro_antes, r.foto_odometro_despues,
  r.foto_factura, r.foto_voucher, r.vehiculo_id, r.vehiculo_nombre, r.vehiculo_placa,
  tc.nombre AS tipo_combustible, p.nombre AS proveedor, sp.nombre AS sub_proyecto,
  r.kilometraje, r.fecha_factura,
  r.numero_factura, r.numero_voucher, r.gravadas, r.isr, r.excedentes, r.litros,
  r.importe_total, r.ruta_recorrida, r.sincronizado, u.nombre AS conductor_nombre`;

const JOINS = `FROM registros_combustible r
  LEFT JOIN tipos_combustible tc ON r.tipo_combustible_id = tc.id
  LEFT JOIN proveedores p ON r.proveedor_id = p.id
  LEFT JOIN sub_proyectos sp ON r.sub_proyecto_id = sp.id
  LEFT JOIN usuarios u ON r.user_id = u.id`;

function mapRow(r: any): RegistroCombustible {
  return {
    id: r.id,
    userId: r.user_id,
    conductorNombre: r.conductor_nombre,
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
    const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
    const pageSize = Math.min(100, Math.max(10, Number(url.searchParams.get('pageSize')) || 25));
    const search = url.searchParams.get('search') || '';
    const sortBy = url.searchParams.get('sortBy') || 'fecha_creacion';
    const sortDir = url.searchParams.get('sortDir') === 'asc' ? 'ASC' : 'DESC';

    const allowedSortColumns: Record<string, string> = {
      fecha_creacion: 'r.fecha_creacion',
      vehiculo_nombre: 'r.vehiculo_nombre',
      litros: 'r.litros',
      importe_total: 'r.importe_total',
      user_id: 'r.user_id',
    };
    const sortColumn = allowedSortColumns[sortBy] || 'r.fecha_creacion';

    let where = 'WHERE 1=1';
    const params: any[] = [];

    if (userId) {
      where += ' AND r.user_id = ?';
      params.push(userId);
    }
    if (desde) {
      where += ' AND r.fecha_creacion >= ?';
      params.push(new Date(desde));
    }
    if (hasta) {
      where += ' AND r.fecha_creacion <= ?';
      params.push(new Date(hasta + 'T23:59:59'));
    }
    if (search) {
      where += ' AND (u.nombre LIKE ? OR r.vehiculo_nombre LIKE ? OR r.vehiculo_placa LIKE ? OR r.numero_factura LIKE ?)';
      const like = `%${search}%`;
      params.push(like, like, like, like);
    }

    const countSql = `SELECT COUNT(*) AS total ${JOINS} ${where}`;
    const countResult = await query<any[]>(countSql, params);
    const total = countResult[0]?.total ?? 0;

    const selectSql = `SELECT ${FIELDS} ${JOINS} ${where} ORDER BY ${sortColumn} ${sortDir} LIMIT ? OFFSET ?`;
    const offset = (page - 1) * pageSize;
    const rows = await query<any[]>(selectSql, [...params, pageSize, offset]);
    const data = rows.map(mapRow);

    return new Response(JSON.stringify({ data, total, page, pageSize }), {
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

    // Resolve catalog names to IDs
    const [tipoRow] = await query<any[]>('SELECT id FROM tipos_combustible WHERE nombre = ?', [body.tipoCombustible]);
    const [provRow] = await query<any[]>('SELECT id FROM proveedores WHERE nombre = ?', [body.proveedor]);
    const [subRow] = await query<any[]>('SELECT id FROM sub_proyectos WHERE nombre = ?', [body.subProyecto]);

    await query(
      `INSERT INTO registros_combustible
        (id, user_id, fecha_creacion, foto_odometro_antes, foto_odometro_despues,
         foto_factura, foto_voucher, vehiculo_id, vehiculo_nombre, vehiculo_placa,
         tipo_combustible_id, proveedor_id, sub_proyecto_id, kilometraje, fecha_factura,
         numero_factura, numero_voucher, gravadas, isr, excedentes, litros,
         importe_total, ruta_recorrida, sincronizado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        body.id, body.userId, fechaCreacion,
        body.fotoOdometroAntes || null, body.fotoOdometroDespues || null,
        body.fotoFactura || null, body.fotoVoucher || null,
        body.vehiculoId, body.vehiculoNombre, body.vehiculoPlaca,
        tipoRow?.id || null, provRow?.id || null, subRow?.id || null,
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
