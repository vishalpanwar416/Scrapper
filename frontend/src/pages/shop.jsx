import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { apiGet } from '../lib/api';

export default function Shop() {
  const [items, setItems] = useState([]);
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(24);
  const [websiteId, setWebsiteId] = useState('');
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 24 });

  const query = useMemo(() => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));
    if (websiteId) params.set('websiteId', websiteId);
    if (search) params.set('search', search);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (color) params.set('color', color);
    if (size) params.set('size', size);
    return `/api/products?${params.toString()}`;
  }, [page, limit, websiteId, search, minPrice, maxPrice, color, size]);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [products, sites] = await Promise.all([
        apiGet(query),
        apiGet('/api/websites')
      ]);
      setItems(products.data || []);
      setPagination(products.pagination || { page: 1, pages: 1, total: 0, limit });
      setWebsites(sites);
    } catch (e) {
      setError(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [query]);

  return (
    <div className="grid gap-6 md:grid-cols-[240px_1fr]">
      <aside className="rounded-lg border bg-card p-4 h-fit">
        <h2 className="text-sm font-medium mb-3">Filters</h2>
        <div className="grid gap-2">
          <select className="h-9 rounded-md border bg-background px-3 text-sm" value={websiteId} onChange={e=>{setWebsiteId(e.target.value); setPage(1);}}>
            <option value="">All websites</option>
            {websites.map(w => (<option key={w.id} value={w.id}>{w.name}</option>))}
          </select>
          <input className="h-9 rounded-md border bg-background px-3 text-sm" placeholder="Search" value={search} onChange={e=>{setSearch(e.target.value); setPage(1);}} />
          <div className="grid grid-cols-2 gap-2">
            <input className="h-9 rounded-md border bg-background px-3 text-sm" placeholder="Min" value={minPrice} onChange={e=>{setMinPrice(e.target.value); setPage(1);}} />
            <input className="h-9 rounded-md border bg-background px-3 text-sm" placeholder="Max" value={maxPrice} onChange={e=>{setMaxPrice(e.target.value); setPage(1);}} />
          </div>
          <input className="h-9 rounded-md border bg-background px-3 text-sm" placeholder="Color" value={color} onChange={e=>{setColor(e.target.value); setPage(1);}} />
          <input className="h-9 rounded-md border bg-background px-3 text-sm" placeholder="Size" value={size} onChange={e=>{setSize(e.target.value); setPage(1);}} />
          <select className="h-9 rounded-md border bg-background px-3 text-sm" value={limit} onChange={e=>{setLimit(parseInt(e.target.value)||24); setPage(1);}}>
            {[12,24,48].map(n => (<option key={n} value={n}>{n}/page</option>))}
          </select>
        </div>
      </aside>
      <main>
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-semibold">Shop</h1>
          <div className="text-xs text-muted-foreground">{pagination.total} items</div>
        </div>
        {error ? <div className="text-sm text-destructive mb-2">{error}</div> : null}
        {loading ? <div className="text-sm text-muted-foreground mb-2">Loading...</div> : null}
        <section className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {items.map(p => (
            <Link key={p.id} href={`/product/${p.id}`} className="group rounded-lg border bg-card overflow-hidden hover:shadow-sm transition">
              <div className="aspect-[3/4] bg-muted/30">
                {p.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.imageUrl} alt={p.title} className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-medium line-clamp-1">{p.title}</h3>
                  <span className="text-xs rounded-full border px-2 py-0.5 text-muted-foreground">{p.website?.name}</span>
                </div>
                <div className="mt-1 text-sm">{p.price ? `₹${p.price}` : '-'}</div>
              </div>
            </Link>
          ))}
        </section>
        <div className="flex items-center gap-2 mt-4">
          <button className="rounded-md border px-3 py-1 text-sm hover:bg-accent disabled:opacity-50" disabled={page<=1} onClick={()=>setPage(p=>p-1)}>Prev</button>
          <span className="text-sm">Page {pagination.page} / {pagination.pages}</span>
          <button className="rounded-md border px-3 py-1 text-sm hover:bg-accent disabled:opacity-50" disabled={pagination.page>=pagination.pages} onClick={()=>setPage(p=>p+1)}>Next</button>
        </div>
      </main>
    </div>
  );
}
