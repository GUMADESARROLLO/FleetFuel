import { query } from './src/lib/db';
const cols = await query('SHOW COLUMNS FROM usuarios');
console.log(JSON.stringify(cols, null, 2));
await query('SHOW CREATE TABLE usuarios').then(r => console.log(JSON.stringify(r, null, 2)));
process.exit(0);
