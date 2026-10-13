// Bounded memory only. Create per browser session; never share private SSR data.
export class MemoryCache {
  private entries = new Map<string, { time: number; used: number; invalidated?: boolean; value?: unknown; pending?: Promise<unknown> }>();
  private epoch = 0;
  constructor(private maxEntries = 80, private retention = 300_000, private now = () => Date.now()) {}
  clear() { this.epoch++; this.entries.clear(); }
  invalidate(prefix: string) {
    this.invalidateMatching(key => key.startsWith(prefix));
  }
  invalidateMatching(matches: (key: string) => boolean) {
    for (const [key, entry] of this.entries) if (matches(key)) { entry.invalidated = true; this.entries.delete(key); }
  }
  async read<T>(key: string, load: () => Promise<T>, freshFor: number): Promise<T> {
    const now = this.now();
    for (const [id, entry] of this.entries) if (!entry.pending && now - entry.used >= this.retention) this.entries.delete(id);
    let entry = this.entries.get(key);
    if (entry) {
      entry.used = now;
      if (entry.pending) return entry.pending as Promise<T>;
      if (now - entry.time < freshFor) return entry.value as T;
    }
    const epoch = this.epoch;
    entry = { time: 0, used: now };
    const current = entry;
    this.entries.set(key, current);
    while (this.entries.size > this.maxEntries) this.entries.delete(this.entries.keys().next().value!);
    const pending = Promise.resolve().then(load).then(value => {
      if (epoch !== this.epoch) throw new DOMException('Account changed', 'AbortError');
      // An invalidated in-flight read must not return or repopulate old data.
      if (this.entries.get(key) !== current) {
        if (current.invalidated) return this.read(key, load, freshFor);
        throw new DOMException('Cache entry evicted', 'AbortError');
      }
      current.value = value; current.time = this.now(); current.pending = undefined;
      return value;
    }, error => {
      if (this.entries.get(key) === current) this.entries.delete(key);
      throw error;
    });
    current.pending = pending;
    return pending;
  }
}

export function resourceKey(resource: string) {
  const [path, search = ''] = resource.split('?');
  const params = new URLSearchParams(search); params.sort();
  return path + (params.size ? '?' + params.toString() : '');
}
