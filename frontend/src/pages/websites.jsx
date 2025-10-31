import { useEffect, useState } from 'react';
import { apiGet, apiPost, apiPut } from '../lib/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function Websites() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [busyId, setBusyId] = useState('');
  const [editingId, setEditingId] = useState('');
  const [editName, setEditName] = useState('');
  const [editUrl, setEditUrl] = useState('');

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
      toast.success(`Website "${name}" added successfully`);
    } catch (e) {
      const msg = e.message || 'Failed to add website';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function toggleEnabled(site) {
    setBusyId(site.id);
    try {
      await apiPut(`/api/websites/${site.id}`, { enabled: !site.enabled });
      await load();
      toast.success(`${site.name} ${!site.enabled ? 'enabled' : 'disabled'}`);
    } catch (e) {
      const msg = e.message || 'Failed to update';
      setError(msg);
      toast.error(msg);
    } finally {
      setBusyId('');
    }
  }

  async function scrape(site) {
    setBusyId(site.id);
    setError('');
    const toastId = toast.loading(`Scraping ${site.name}...`);
    try {
      const response = await apiPost(`/api/scrape/start/${site.name}`);
      await load();

      const scrapeData = response.data;
      const { itemsScraped, itemsUpdated, status, errorMessage } = scrapeData;

      if (status === 'success' || status === 'completed') {
        const message = `
          ✅ Scraped: ${itemsScraped} items
          📝 Updated: ${itemsUpdated} items
        `;
        toast.success(message.trim(), {
          id: toastId,
          description: `${site.name} scraping completed successfully`
        });
      } else if (errorMessage) {
        toast.error(`❌ ${errorMessage}`, { id: toastId });
      } else {
        toast.warning(`⚠️ Scraping completed with status: ${status}`, { id: toastId });
      }
    } catch (e) {
      const msg = e.message || 'Failed to start scrape';
      setError(msg);

      // Parse error details if available
      if (e.response?.data?.error) {
        toast.error(`❌ ${e.response.data.error}`, {
          id: toastId,
          description: e.response.data.details || msg
        });
      } else {
        toast.error(msg, { id: toastId });
      }
    } finally {
      setBusyId('');
    }
  }

  function openEdit(site) {
    setEditingId(site.id);
    setEditName(site.name);
    setEditUrl(site.url);
    setError('');
  }

  function closeEdit() {
    setEditingId('');
    setEditName('');
    setEditUrl('');
  }

  async function saveEdit(e) {
    e.preventDefault();
    if (!editName || !editUrl) return;
    setBusyId(editingId);
    setError('');
    try {
      await apiPut(`/api/websites/${editingId}`, { name: editName.toLowerCase(), url: editUrl });
      await load();
      toast.success(`Website updated successfully`);
      closeEdit();
    } catch (e) {
      const msg = e.message || 'Failed to update';
      setError(msg);
      toast.error(msg);
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
                    <button className="rounded-md border px-3 py-1 text-xs hover:bg-accent disabled:opacity-50" disabled={busyId===site.id} onClick={()=>openEdit(site)}>Edit</button>
                    <button className="rounded-md border px-3 py-1 text-xs hover:bg-accent disabled:opacity-50" disabled={busyId===site.id} onClick={()=>toggleEnabled(site)}>
                      {site.enabled ? 'Disable' : 'Enable'}
                    </button>
                    <button className="rounded-md border px-3 py-1 text-xs hover:bg-accent disabled:opacity-50 flex items-center gap-1" disabled={busyId===site.id || !site.enabled} onClick={()=>scrape(site)}>
                      {busyId===site.id ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                      {busyId===site.id ? 'Scraping' : 'Scrape now'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg border shadow-lg max-w-md w-full p-6">
            <h2 className="text-lg font-semibold mb-4">Edit Website</h2>
            <form onSubmit={saveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  className="w-full h-9 rounded-md border bg-background px-3 text-sm"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  placeholder="Website name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">URL</label>
                <input
                  type="url"
                  className="w-full h-9 rounded-md border bg-background px-3 text-sm"
                  value={editUrl}
                  onChange={e => setEditUrl(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
              {error && <div className="text-sm text-destructive">{error}</div>}
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
                  onClick={closeEdit}
                  disabled={busyId===editingId}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm hover:bg-primary/90 disabled:opacity-50"
                  disabled={busyId===editingId || !editName || !editUrl}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
