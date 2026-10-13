import { createClient } from '@supabase/supabase-js';
import { readFile } from 'node:fs/promises';
import { query, close } from '../lib/db/postgres.mjs';

async function main() {
  const [command, bookId, format, filename] = process.argv.slice(2);
  if (!['init', 'upload'].includes(command)) throw new Error('Usage: node --env-file=.env.local scripts/storage.mjs init | upload <book-id> <pdf|epub|printable_pdf> <local-file>');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY first.');
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
  const bucket = process.env.SUPABASE_EBOOK_BUCKET || 'ebooks';
  const existing = await client.storage.listBuckets();
  if (existing.error) throw new Error('Could not inspect Storage buckets. Check server credentials.');
  const metadata = existing.data.find(item => item.id === bucket);
  if (!metadata && command === 'init') {
    const created = await client.storage.createBucket(bucket, { public: false, allowedMimeTypes: ['application/pdf', 'application/epub+zip'], fileSizeLimit: 104857600 });
    if (created.error) throw new Error('Could not create the private ebook bucket.');
    console.log(`Created private bucket: ${bucket}`); return;
  }
  if (!metadata || metadata.public) throw new Error('A private bucket is required. Run init for a missing bucket; make a public bucket private in Supabase before continuing.');
  if (command === 'init') { console.log(`Private bucket ready: ${bucket}`); return; }
  if (!bookId || !filename || !['pdf', 'epub', 'printable_pdf'].includes(format)) throw new Error('Supply book ID, supported format and local ebook file.');
  const book = (await query('SELECT data FROM knovera.books WHERE id=$1', [bookId])).rows[0]?.data;
  const asset = book?.currentEdition?.assets?.find(item => item.format === format);
  if (!asset?.storageKey) throw new Error('No catalog asset is configured for this book and format.');
  const file = await readFile(filename);
  const valid = format === 'epub' ? file.subarray(0, 4).equals(Buffer.from([80, 75, 3, 4])) : file.subarray(0, 5).toString() === '%PDF-';
  if (!valid) throw new Error('File header does not match the selected format.');
  const uploaded = await client.storage.from(bucket).upload(asset.storageKey, file, { contentType: format === 'epub' ? 'application/epub+zip' : 'application/pdf', upsert: false, cacheControl: '0' });
  if (uploaded.error) throw new Error('Upload failed. Check project limits and whether that object already exists; existing files are never overwritten.');
  console.log(`Uploaded ${format} to private bucket ${bucket} at ${asset.storageKey}`);
}
main().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(close);
