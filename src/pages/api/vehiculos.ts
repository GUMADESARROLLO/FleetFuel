import { query } from '../../lib/db';

export async function GET() {
  try {
    const rows = await query<any[]>('SELECT id, nombre, placa FROM vehiculos WHERE activo = 1 ORDER BY nombre');
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
