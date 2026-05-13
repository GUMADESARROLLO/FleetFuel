import { query } from '../../../lib/db';

export async function POST({ request }: { request: Request }) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return new Response(JSON.stringify({ error: 'Usuario y contraseña requeridos' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const rows = await query<any[]>(
      'SELECT username, nombre, role FROM usuarios WHERE username = ? AND password = ?',
      [username, password]
    );

    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Credenciales incorrectas' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const user = rows[0];
    return new Response(JSON.stringify({
      username: user.username,
      nombre: user.nombre,
      role: user.role,
      loggedInAt: new Date().toISOString(),
    }), {
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
