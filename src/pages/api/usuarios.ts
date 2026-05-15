import bcrypt from 'bcryptjs';
import { query } from '../../lib/db';

export async function GET() {
  try {
    const rows = await query<any[]>(
      'SELECT u.id, u.username, u.nombre, r.nombre AS role, u.unidad_negocio_id, un.nombre AS unidad_negocio_nombre FROM usuarios u JOIN roles r ON u.role_id = r.id LEFT JOIN unidades_negocio un ON u.unidad_negocio_id = un.id ORDER BY r.nombre, u.nombre'
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
    const { username, nombre, password, role, unidadNegocioId } = await request.json();

    if (!username || !nombre || !password || !role) {
      return new Response(JSON.stringify({ error: 'Todos los campos son requeridos' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const [roleRow] = await query<any[]>('SELECT id FROM roles WHERE nombre = ?', [role]);
    if (!roleRow) {
      return new Response(JSON.stringify({ error: 'Rol inválido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await query(
      `INSERT INTO usuarios (username, nombre, password, role_id, unidad_negocio_id) VALUES (?, ?, ?, ?, ?)`,
      [username, nombre, hashedPassword, roleRow.id, unidadNegocioId || null]
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
    const { username, nombre, password, role, unidadNegocioId } = await request.json();

    if (!username) {
      return new Response(JSON.stringify({ error: 'Username requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (nombre) { updates.push('nombre = ?'); params.push(nombre); }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push('password = ?');
      params.push(hashedPassword);
    }
    if (role) {
      const [roleRow] = await query<any[]>('SELECT id FROM roles WHERE nombre = ?', [role]);
      if (!roleRow) {
        return new Response(JSON.stringify({ error: 'Rol inválido' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      updates.push('role_id = ?');
      params.push(roleRow.id);
    }
    if (unidadNegocioId !== undefined) {
      updates.push('unidad_negocio_id = ?');
      params.push(unidadNegocioId || null);
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
