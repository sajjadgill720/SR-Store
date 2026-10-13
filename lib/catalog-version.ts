import { query } from './db/postgres.mjs';
export async function catalogVersion(): Promise<string> {
  const result = await query<{version: string}>('SELECT version::text FROM knovera.catalog_revision WHERE id=true');
  if (!result.rows[0]) throw new Error('Catalog revision is unavailable');
  return result.rows[0].version;
}
export async function advanceCatalogVersion() {
  await query('UPDATE knovera.catalog_revision SET version=version+1 WHERE id=true');
}
