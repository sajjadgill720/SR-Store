import { createClient } from '@supabase/supabase-js';
import type { BookAsset } from '../types';

export const DOWNLOAD_TTL = 300;
export async function signDownload(asset: BookAsset) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error('Storage is not configured');
  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
  const bucket = process.env.SUPABASE_EBOOK_BUCKET || 'ebooks';
  // Signing cannot protect publicly readable objects.
  const metadata = await supabase.storage.getBucket(bucket);
  if (metadata.error || !metadata.data || metadata.data.public) throw new Error('Private ebook bucket unavailable');
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(asset.storageKey, DOWNLOAD_TTL, { download: asset.fileName });
  if (error || !data?.signedUrl) throw new Error('Ebook file unavailable');
  return { success: true, downloadUrl: data.signedUrl, fileName: asset.fileName, fileSize: asset.fileSize, expiresInSeconds: DOWNLOAD_TTL };
}
