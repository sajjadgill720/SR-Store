import { catalogVersion } from '@/lib/catalog-version';
export async function GET() {
  try { return Response.json({version:await catalogVersion()}, {headers:{'Cache-Control':'no-store'}}); }
  catch { return Response.json({error:'Unable to check catalog updates.'}, {status:503}); }
}
