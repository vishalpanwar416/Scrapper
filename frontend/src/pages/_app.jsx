import '../styles/globals.css';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Menu, X, Search } from 'lucide-react';
import { Toaster } from 'sonner';

export default function App({ Component, pageProps }) {
  const [dark, setDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [q, setQ] = useState('');
  const router = useRouter();
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  function onSearchSubmit(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set('search', q);
    setMobileOpen(false);
    router.push(`/shop${params.toString() ? `?${params.toString()}` : ''}`);
  }

  return (
    <div className="min-h-screen bg-background text-foreground bg-app">
      <Toaster
        position="top-right"
        theme={dark ? 'dark' : 'light'}
        richColors
        closeButton
      />
      <header className="sticky top-0 z-40 border-b/50 bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button aria-label="Open Menu" className="sm:hidden rounded-md border p-2 hover:bg-accent" onClick={() => setMobileOpen(true)}>
              <Menu className="h-4 w-4" />
            </button>
            <Link href="/" className="font-semibold tracking-tight text-lg">Aesthetic Store</Link>
            <nav className="hidden sm:flex items-center gap-5 text-sm">
              <Link href="/shop" className="text-muted-foreground hover:text-foreground">Shop</Link>
              <Link href="/websites" className="text-muted-foreground hover:text-foreground">Websites</Link>
              <Link href="/products" className="text-muted-foreground hover:text-foreground">Products</Link>
              <Link href="/logs" className="text-muted-foreground hover:text-foreground">Logs</Link>
            </nav>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <form onSubmit={onSearchSubmit} className="relative">
              <input
                value={q}
                onChange={e=>setQ(e.target.value)}
                placeholder="Search products"
                className="h-9 w-64 rounded-md border bg-background pl-9 pr-3 text-sm"
              />
              <Search className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            </form>
            <button onClick={() => setDark((v) => !v)} className="text-sm rounded-md border px-3 py-1.5 hover:bg-accent">
              {dark ? 'Light' : 'Dark'}
            </button>
          </div>
          <button onClick={() => setDark((v) => !v)} className="sm:hidden text-sm rounded-md border px-3 py-1.5 hover:bg-accent">
            {dark ? 'Light' : 'Dark'}
          </button>
        </div>

        {mobileOpen ? (
          <div className="sm:hidden border-t bg-card/90 backdrop-blur">
            <div className="container py-3">
              <div className="flex items-center justify-between mb-3">
                <div className="font-medium">Menu</div>
                <button aria-label="Close Menu" className="rounded-md border p-2 hover:bg-accent" onClick={()=>setMobileOpen(false)}>
                  <X className="h-4 w-4" />
                </button>
              </div>
              <form onSubmit={onSearchSubmit} className="relative mb-3">
                <input
                  value={q}
                  onChange={e=>setQ(e.target.value)}
                  placeholder="Search products"
                  className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm"
                />
                <Search className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              </form>
              <div className="grid gap-2 text-sm">
                <Link href="/shop" onClick={()=>setMobileOpen(false)} className="rounded-md border px-3 py-2 hover:bg-accent">Shop</Link>
                <Link href="/websites" onClick={()=>setMobileOpen(false)} className="rounded-md border px-3 py-2 hover:bg-accent">Websites</Link>
                <Link href="/products" onClick={()=>setMobileOpen(false)} className="rounded-md border px-3 py-2 hover:bg-accent">Products</Link>
                <Link href="/logs" onClick={()=>setMobileOpen(false)} className="rounded-md border px-3 py-2 hover:bg-accent">Logs</Link>
              </div>
            </div>
          </div>
        ) : null}
      </header>
      <main className="container py-6 animate-fade-in-up">
        <div className="glass-frame relative">
          <div className="absolute inset-0 starfield pointer-events-none" />
          <div className="relative">
            <Component {...pageProps} />
          </div>
        </div>
      </main>
    </div>
  );
}
