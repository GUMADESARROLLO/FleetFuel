import { query } from '../../lib/db';

export async function GET() {
  try {
    const rows = await query<any[]>('SELECT id, nombre, activo FROM unidades_negocio ORDER BY nombre');
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
    const { nombre } = await request.json();
    if (!nombre) {
      return new Response(JSON.stringify({ error: 'Nombre requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const result = await query<any>('INSERT INTO unidades_negocio (nombre) VALUES (?)', [nombre]);
    return new Response(JSON.stringify({ success: true, id: result.insertId }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    if (err.code === 'ER_DUP_ENTRY') {
      return new Response(JSON.stringify({ error: 'La unidad de negocio ya existe' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function PUT({ request }: { request: Request }) {
  try {
    const { id, nombre } = await request.json();
    if (!id || !nombre) {
      return new Response(JSON.stringify({ error: 'ID y nombre requeridos' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    await query('UPDATE unidades_negocio SET nombre = ? WHERE id = ?', [nombre, id]);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    if (err.code === 'ER_DUP_ENTRY') {
      return new Response(JSON.stringify({ error: 'La unidad de negocio ya existe' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }
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
    await query('UPDATE unidades_negocio SET activo = 0 WHERE id = ?', [id]);
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
