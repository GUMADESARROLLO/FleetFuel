import { query } from '../../lib/db';

export async function GET() {
  try {
    const rows = await query<any[]>('SELECT id, nombre, placa, activo FROM vehiculos ORDER BY nombre');
    return new Response(JSON.stringify({ data: rows }), {
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
    const { nombre, placa } = await request.json();
    if (!nombre || !placa) {
      return new Response(JSON.stringify({ error: 'Nombre y placa requeridos' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const [maxRow] = await query<any[]>('SELECT COALESCE(MAX(CAST(id AS UNSIGNED)), 0) + 1 AS next_id FROM vehiculos');
    const id = String(maxRow.next_id);
    await query('INSERT INTO vehiculos (id, nombre, placa) VALUES (?, ?, ?)', [id, nombre, placa]);
    return new Response(JSON.stringify({ success: true, id }), {
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
    const { id, nombre, placa, activo } = await request.json();
    if (!id) {
      return new Response(JSON.stringify({ error: 'ID requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const updates: string[] = [];
    const params: any[] = [];
    if (nombre !== undefined) { updates.push('nombre = ?'); params.push(nombre); }
    if (placa !== undefined) { updates.push('placa = ?'); params.push(placa); }
    if (activo !== undefined) { updates.push('activo = ?'); params.push(activo ? 1 : 0); }

    if (updates.length === 0) {
      return new Response(JSON.stringify({ error: 'Nada que actualizar' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    params.push(id);
    await query(`UPDATE vehiculos SET ${updates.join(', ')} WHERE id = ?`, params);
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

export async function DELETE({ request }: { request: Request }) {
  try {
    const { id } = await request.json();
    if (!id) {
      return new Response(JSON.stringify({ error: 'ID requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    await query('UPDATE vehiculos SET activo = 0 WHERE id = ?', [id]);
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
