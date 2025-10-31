import { useEffect, useMemo, useState } from 'react';
import { apiGet } from '../lib/api';

export default function Products() {
  const [items, setItems] = useState([]);
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [websiteId, setWebsiteId] = useState('');
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 20 });

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
    <main>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Products</h1>
      </div>

      <section className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 mb-4">
        <select className="h-9 rounded-md border bg-background px-3 text-sm" value={websiteId} onChange={e=>{setWebsiteId(e.target.value); setPage(1);}}>
          <option value="">All websites</option>
          {websites.map(w => (<option key={w.id} value={w.id}>{w.name}</option>))}
        </select>
        <input className="h-9 rounded-md border bg-background px-3 text-sm" placeholder="Search" value={search} onChange={e=>{setSearch(e.target.value); setPage(1);}} />
        <input className="h-9 rounded-md border bg-background px-3 text-sm" placeholder="Min price" value={minPrice} onChange={e=>{setMinPrice(e.target.value); setPage(1);}} />
        <input className="h-9 rounded-md border bg-background px-3 text-sm" placeholder="Max price" value={maxPrice} onChange={e=>{setMaxPrice(e.target.value); setPage(1);}} />
        <input className="h-9 rounded-md border bg-background px-3 text-sm" placeholder="Color" value={color} onChange={e=>{setColor(e.target.value); setPage(1);}} />
        <input className="h-9 rounded-md border bg-background px-3 text-sm" placeholder="Size" value={size} onChange={e=>{setSize(e.target.value); setPage(1);}} />
        <select className="h-9 rounded-md border bg-background px-3 text-sm" value={limit} onChange={e=>{setLimit(parseInt(e.target.value)||20); setPage(1);}}>
          {[10,20,50].map(n => (<option key={n} value={n}>{n}/page</option>))}
        </select>
      </section>
      {error ? <div className="text-sm text-destructive mb-2">{error}</div> : null}
      {loading ? <div className="text-sm text-muted-foreground mb-2">Loading...</div> : null}

      <div className="rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-3 py-2 font-medium">Image</th>
              <th className="text-left px-3 py-2 font-medium">Title</th>
              <th className="text-left px-3 py-2 font-medium">Price</th>
              <th className="text-left px-3 py-2 font-medium">Website</th>
              <th className="text-left px-3 py-2 font-medium">URL</th>
            </tr>
          </thead>
          <tbody>
            {items.map(p => (
              <tr key={p.id} className="border-t">
                <td className="px-3 py-2">{p.imageUrl ? <img src={p.imageUrl} alt="img" className="h-14 w-14 object-cover rounded" /> : '-'}</td>
                <td className="px-3 py-2 font-medium">{p.title}</td>
                <td className="px-3 py-2">{p.price ?? '-'}</td>
                <td className="px-3 py-2">{p.website?.name}</td>
                <td className="px-3 py-2"><a className="text-primary hover:underline" href={p.url} target="_blank" rel="noreferrer">open</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-2 mt-3">
        <button className="rounded-md border px-3 py-1 text-sm hover:bg-accent disabled:opacity-50" disabled={page<=1} onClick={()=>setPage(p=>p-1)}>Prev</button>
        <span className="text-sm">Page {pagination.page} / {pagination.pages}</span>
        <button className="rounded-md border px-3 py-1 text-sm hover:bg-accent disabled:opacity-50" disabled={pagination.page>=pagination.pages} onClick={()=>setPage(p=>p+1)}>Next</button>
        <span className="text-xs text-muted-foreground">Total: {pagination.total}</span>
      </div>
    </main>
  );
}
