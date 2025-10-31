import { useEffect, useState } from 'react';
import { apiGet } from '../lib/api';

export default function Logs() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 20 });

  async function load() {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      const res = await apiGet(`/api/scrape/logs?${params.toString()}`);
      setItems(res.data || []);
      setPagination(res.pagination || { page: 1, pages: 1, total: 0, limit });
    } catch (e) {
      setError(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [page, limit]);

  return (
    <main style={{fontFamily:'sans-serif',padding:'24px',maxWidth:1100,margin:'0 auto'}}>
      <h1>Scrape Logs</h1>
      <section style={{display:'flex',gap:8,alignItems:'center',margin:'12px 0'}}>
        <select value={limit} onChange={e=>{setLimit(parseInt(e.target.value)||20); setPage(1);}}>
          {[10,20,50].map(n => (<option key={n} value={n}>{n}/page</option>))}
        </select>
      </section>
      {error ? <div style={{color:'crimson',margin:'8px 0'}}>{error}</div> : null}
      {loading ? <div>Loading...</div> : null}
      <table style={{width:'100%',borderCollapse:'collapse'}}>
        <thead>
          <tr>
            <th style={{textAlign:'left',borderBottom:'1px solid #ddd',padding:8}}>Website</th>
            <th style={{textAlign:'left',borderBottom:'1px solid #ddd',padding:8}}>Items Scraped</th>
            <th style={{textAlign:'left',borderBottom:'1px solid #ddd',padding:8}}>Items Updated</th>
            <th style={{textAlign:'left',borderBottom:'1px solid #ddd',padding:8}}>Status</th>
            <th style={{textAlign:'left',borderBottom:'1px solid #ddd',padding:8}}>When</th>
            <th style={{textAlign:'left',borderBottom:'1px solid #ddd',padding:8}}>Error</th>
          </tr>
        </thead>
        <tbody>
          {items.map(log => (
            <tr key={log.id}>
              <td style={{padding:8}}>{log.website?.name || '-'}</td>
              <td style={{padding:8}}>{log.itemsScraped}</td>
              <td style={{padding:8}}>{log.itemsUpdated}</td>
              <td style={{padding:8}}>{log.status}</td>
              <td style={{padding:8}}>{log.scrapedAt ? new Date(log.scrapedAt).toLocaleString() : '-'}</td>
              <td style={{padding:8}}>{log.errorMessage || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{display:'flex',gap:8,marginTop:12,alignItems:'center'}}>
        <button disabled={page<=1} onClick={()=>setPage(p=>p-1)}>Prev</button>
        <span>Page {pagination.page} / {pagination.pages}</span>
        <button disabled={pagination.page>=pagination.pages} onClick={()=>setPage(p=>p+1)}>Next</button>
        <span>Total: {pagination.total}</span>
      </div>
    </main>
  );
}
