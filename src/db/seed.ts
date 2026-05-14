import { query, closePool } from '../lib/db.js';

const USUARIOS = [
  { username: 'admin', nombre: 'Administrador', password: '123456', role: 'admin' },
  { username: 'conductor1', nombre: 'Conductor 1', password: '123456', role: 'conductor' },
  { username: 'conductor2', nombre: 'Conductor 2', password: '123456', role: 'conductor' },
];

async function seed() {
  console.log('Seeding users...');

  for (const u of USUARIOS) {
    const [roleRow] = await query<any[]>('SELECT id FROM roles WHERE nombre = ?', [u.role]);
    if (!roleRow) throw new Error(`Role "${u.role}" not found`);
    await query(
      `INSERT INTO usuarios (username, nombre, password, role_id)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), password = VALUES(password), role_id = VALUES(role_id)`,
      [u.username, u.nombre, u.password, roleRow.id]
    );
    console.log(`  User ${u.username} ready`);
  }

  console.log('Seed completed');
  await closePool();
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
