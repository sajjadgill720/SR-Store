import { getPublicCatalog } from '@/lib/catalog-cache';
export async function GET() {
  try { return Response.json(await getPublicCatalog(), {headers: {'Cache-Control':'no-store'}}); }
  catch { return Response.json({error:'The catalog is temporarily unavailable.'}, {status:503}); }
}
