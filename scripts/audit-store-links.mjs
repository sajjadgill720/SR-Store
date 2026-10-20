// Read-only audit of customer links rendered by the local store.
const origin = process.argv[2] || 'http://127.0.0.1:3000';
const pending = new Set(['/', '/books', '/books?category=Bundles', '/books?saved=1', '/account/login', '/account/signup', '/about', '/newsletter', '/reader-club', '/free-resources', '/help', '/help/kindle', '/contact', '/cart', '/checkout', '/access', '/account/library', '/community', '/legal/privacy', '/legal/terms', '/legal/refunds']);
const visited = new Map();
const failures = [];
while (pending.size && visited.size < 120) {
  const batch = [...pending].slice(0, 4);
  batch.forEach(path => { pending.delete(path); visited.set(path, null); });
  await Promise.all(batch.map(async path => {
    try {
      const response = await fetch(new URL(path, origin), { signal: AbortSignal.timeout(45000) });
      const html = await response.text();
      visited.set(path, response.status);
      if (!response.ok) failures.push({ path, status: response.status });
      for (const match of html.matchAll(/<a\b[^>]*href="([^"<>]+)"/g)) {
        const href = match[1].replaceAll('&amp;', '&');
        if (!href.startsWith('/') || href.startsWith('//')) continue;
        const url = new URL(href, origin);
        if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/auth/') || url.pathname.startsWith('/admin') || url.pathname.startsWith('/newsletter/')) continue;
        const target = url.pathname + url.search;
        if (!visited.has(target)) pending.add(target);
      }
    } catch (error) { failures.push({ path, error: error.message }); }
  }));
}
console.log(JSON.stringify({ checked: visited.size, failures, pages: Object.fromEntries(visited) }, null, 2));
if (failures.length) process.exitCode = 1;
