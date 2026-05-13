import { query } from '../../lib/db';

export async function GET() {
  try {
    const rows = await query<any[]>(
      'SELECT username, nombre, role FROM usuarios ORDER BY role, nombre'
    );
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
    const { username, nombre, password, role } = await request.json();

    if (!username || !nombre || !password || !role) {
      return new Response(JSON.stringify({ error: 'Todos los campos son requeridos' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!['admin', 'conductor'].includes(role)) {
      return new Response(JSON.stringify({ error: 'Rol inválido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await query(
      `INSERT INTO usuarios (username, nombre, password, role) VALUES (?, ?, ?, ?)`,
      [username, nombre, password, role]
    );

    return new Response(JSON.stringify({ success: true }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    if (err.code === 'ER_DUP_ENTRY') {
      return new Response(JSON.stringify({ error: 'El usuario ya existe' }), {
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
    const { username, nombre, password, role } = await request.json();

    if (!username) {
      return new Response(JSON.stringify({ error: 'Username requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (nombre) { updates.push('nombre = ?'); params.push(nombre); }
    if (password) { updates.push('password = ?'); params.push(password); }
    if (role) {
      if (!['admin', 'conductor'].includes(role)) {
        return new Response(JSON.stringify({ error: 'Rol inválido' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      updates.push('role = ?');
      params.push(role);
    }

    if (updates.length === 0) {
      return new Response(JSON.stringify({ error: 'Nada que actualizar' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    params.push(username);
    await query(
      `UPDATE usuarios SET ${updates.join(', ')} WHERE username = ?`,
      params
    );

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
    const { username } = await request.json();

    if (!username) {
      return new Response(JSON.stringify({ error: 'Username requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await query('DELETE FROM usuarios WHERE username = ?', [username]);

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
