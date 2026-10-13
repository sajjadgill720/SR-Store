import pg from 'pg';
import { readFileSync } from 'node:fs';

// One pool per process, including Next.js development module reloads.
const key = Symbol.for('knovera.postgres.pool');
export function pool() {
  if (typeof window !== 'undefined') throw new Error('Database access is server-only');
  if (!process.env.SUPABASE_DB_URL) throw new Error('Supabase database is not configured. Set SUPABASE_DB_URL and run the database migration.');
  if (!globalThis[key]) {
    const url = new URL(process.env.SUPABASE_DB_URL);
    if (!['postgres:', 'postgresql:'].includes(url.protocol)) throw new Error('Invalid database URL');
    const local = ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname);
    // Prevent connection-string flags from overriding certificate validation.
    for (const name of ['sslmode', 'sslcert', 'sslkey', 'sslrootcert']) url.searchParams.delete(name);
    globalThis[key] = new pg.Pool({
      connectionString: url.toString(), max: 5, connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
      ssl: local ? false : { rejectUnauthorized: true, ...(process.env.SUPABASE_DB_CA_FILE ? { ca: readFileSync(process.env.SUPABASE_DB_CA_FILE, 'utf8') } : {}) },
    });
    globalThis[key].on('error', () => console.error('Idle database connection failed'));
  }
  return globalThis[key];
}
export async function query(sql, values = []) { return pool().query(sql, values); }
export async function transaction(work) {
  const client = await pool().connect();
  try { await client.query('BEGIN'); const result = await work(client); await client.query('COMMIT'); return result; }
  catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); }
}
export async function close() { if (globalThis[key]) { await globalThis[key].end(); delete globalThis[key]; } }
