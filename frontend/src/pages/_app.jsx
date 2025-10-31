import '../styles/globals.css';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Menu, X, Search, User, Circle } from 'lucide-react';
import { Toaster } from 'sonner';

export default function App({ Component, pageProps }) {
  const [dark, setDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [q, setQ] = useState('');
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
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
      <header className={`sticky top-0 z-40 border-b/50 bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/60 ${scrolled ? 'shadow-[0_6px_30px_rgba(0,0,0,.25)]' : ''}`}>
        <div className="container h-20 flex items-center justify-between">
          {/* Mobile left: menu + logo */}
          <div className="flex items-center gap-3 sm:hidden">
            <button aria-label="Open Menu" className="rounded-md border p-2 hover:bg-accent" onClick={() => setMobileOpen(true)}>
              <Menu className="h-4 w-4" />
            </button>
            <Link href="/" className="font-semibold tracking-tight text-lg">Aesthetic Store</Link>
          </div>

          {/* Desktop: rounded glass navbar pill */}
          <div className="hidden sm:flex items-center justify-between gap-6 w-full">
            <div className="glass-panel rounded-full px-4 py-3 flex items-center gap-5 w-full relative">
              <span className="hairline-gradient rounded-full" aria-hidden />
              {/* Left logo */}
              <Link href="/" className="flex items-center gap-2 pl-1 pr-2">
                <span className="inline-grid place-items-center h-8 w-8 rounded-full bg-foreground text-background">
                  <Circle className="h-4 w-4" />
                </span>
                <span className="text-base font-semibold">Aesthetic</span>
              </Link>
              {/* Center nav pills */}
              <nav className="flex items-center gap-2 text-sm">
                <Link href="/shop" className={`rounded-full px-4 py-2 transition ${router.pathname.startsWith('/shop') ? 'bg-accent' : 'hover:bg-accent'}`}>Shop</Link>
                <Link href="/websites" className={`rounded-full px-4 py-2 transition ${router.pathname.startsWith('/websites') ? 'bg-accent' : 'hover:bg-accent'}`}>Websites</Link>
                <Link href="/products" className={`rounded-full px-4 py-2 transition ${router.pathname.startsWith('/products') ? 'bg-accent' : 'hover:bg-accent'}`}>Products</Link>
                <Link href="/logs" className={`rounded-full px-4 py-2 transition ${router.pathname.startsWith('/logs') ? 'bg-accent' : 'hover:bg-accent'}`}>Logs</Link>
              </nav>
              {/* Right actions */}
              <div className="ml-auto flex items-center gap-2">
                <form onSubmit={onSearchSubmit} className="relative hidden md:block">
                  <input
                    value={q}
                    onChange={e=>setQ(e.target.value)}
                    placeholder="Search products"
                    className="h-10 w-72 rounded-full border bg-background pl-9 pr-3 text-sm"
                  />
                  <Search className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                </form>
                <Link href="#" className="rounded-full border px-4 py-2 text-sm hover:bg-accent inline-flex items-center gap-2">
                  <User className="h-4 w-4" /> Create Account
                </Link>
                <button onClick={() => setDark((v) => !v)} className="text-sm rounded-full border px-4 py-2 hover:bg-accent">
                  {dark ? 'Light' : 'Dark'}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile right: theme toggle */}
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
