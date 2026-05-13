import { query, closePool } from '../lib/db.js';

async function test() {
  try {
    const rows = await query<any[]>(
      'SELECT username, nombre, role FROM usuarios WHERE username = ? AND password = ?',
      ['admin', 'admin2024']
    );
    console.log('admin2024 result:', JSON.stringify(rows));

    const rows2 = await query<any[]>(
      'SELECT username, nombre, role FROM usuarios WHERE username = ? AND password = ?',
      ['admin', 'admin2024cambiada']
    );
    console.log('admin2024cambiada result:', JSON.stringify(rows2));

    const all = await query<any[]>('SELECT username, nombre, role, password FROM usuarios');
    console.log('All users:', JSON.stringify(all));
  } catch (err: any) {
    console.error('ERROR:', err.message);
  }
  await closePool();
}

test();
