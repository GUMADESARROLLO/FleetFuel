import { query, closePool } from '../lib/db.js';
import { USUARIOS } from '../lib/constants.js';

async function seed() {
  console.log('Seeding users...');

  for (const u of USUARIOS) {
    await query(
      `INSERT INTO usuarios (username, nombre, password, role)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), password = VALUES(password), role = VALUES(role)`,
      [u.username, u.nombre, u.password, u.role]
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
