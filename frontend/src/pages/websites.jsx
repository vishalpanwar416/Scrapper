import { useEffect, useState } from 'react';
import { apiGet, apiPost, apiPut } from '../lib/api';

export default function Websites() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [busyId, setBusyId] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await apiGet('/api/websites');
      setItems(data);
    } catch (e) {
      setError(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function addWebsite(e) {
    e.preventDefault();
    if (!name || !url) return;
    setLoading(true);
    setError('');
    try {
      await apiPost('/api/websites', { name: name.toLowerCase(), url });
      setName('');
      setUrl('');
      await load();
    } catch (e) {
      setError(e.message || 'Failed to add');
    } finally {
      setLoading(false);
    }
  }

  async function toggleEnabled(site) {
    setBusyId(site.id);
    try {
      await apiPut(`/api/websites/${site.id}`, { enabled: !site.enabled });
      await load();
    } catch (e) {
      setError(e.message || 'Failed to update');
    } finally {
      setBusyId('');
    }
  }

  async function scrape(site) {
    setBusyId(site.id);
    setError('');
    try {
      await apiPost(`/api/scrape/start/${site.name}`);
      await load();
    } catch (e) {
      setError(e.message || 'Failed to start scrape');
    } finally {
      setBusyId('');
    }
  }

  return (
    <main>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Websites</h1>
      </div>

      <form onSubmit={addWebsite} className="grid gap-2 rounded-lg border bg-card p-4 sm:grid-cols-[1fr_2fr_auto] mb-4">
        <input className="h-9 rounded-md border bg-background px-3 text-sm" placeholder="name (scraper key)" value={name} onChange={e=>setName(e.target.value)} />
        <input className="h-9 rounded-md border bg-background px-3 text-sm" placeholder="url" value={url} onChange={e=>setUrl(e.target.value)} />
        <button className="h-9 rounded-md border px-3 text-sm hover:bg-accent disabled:opacity-50" disabled={loading || !name || !url} type="submit">Add</button>
        {error ? <div className="sm:col-span-3 text-sm text-destructive">{error}</div> : null}
      </form>

      {loading ? <div className="text-sm text-muted-foreground mb-2">Loading...</div> : null}

      <div className="rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-3 py-2 font-medium">Name</th>
              <th className="text-left px-3 py-2 font-medium">URL</th>
              <th className="text-left px-3 py-2 font-medium">Enabled</th>
              <th className="text-left px-3 py-2 font-medium">Products</th>
              <th className="text-left px-3 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(site => (
              <tr key={site.id} className="border-t">
                <td className="px-3 py-2 font-medium">{site.name}</td>
                <td className="px-3 py-2"><a className="text-primary hover:underline" href={site.url} target="_blank" rel="noreferrer">{site.url}</a></td>
                <td className="px-3 py-2">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs border ${site.enabled ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' : 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800'}`}>{site.enabled ? 'Enabled' : 'Disabled'}</span>
                </td>
                <td className="px-3 py-2">{site.productCount ?? '-'}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-2">
                    <button className="rounded-md border px-3 py-1 text-xs hover:bg-accent disabled:opacity-50" disabled={busyId===site.id} onClick={()=>toggleEnabled(site)}>
                      {site.enabled ? 'Disable' : 'Enable'}
                    </button>
                    <button className="rounded-md border px-3 py-1 text-xs hover:bg-accent disabled:opacity-50" disabled={busyId===site.id || !site.enabled} onClick={()=>scrape(site)}>Scrape now</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
