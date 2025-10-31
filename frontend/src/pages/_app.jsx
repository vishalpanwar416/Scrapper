import '../styles/globals.css';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function App({ Component, pageProps }) {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  return (
    <div className="min-h-screen bg-background text-foreground bg-app">
      <header className="border-b/50 bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-semibold">Scraper Admin</Link>
            <nav className="hidden sm:flex items-center gap-4 text-sm text-muted-foreground">
              <Link href="/shop" className="hover:text-foreground">Shop</Link>
              <Link href="/websites" className="hover:text-foreground">Websites</Link>
              <Link href="/products" className="hover:text-foreground">Products</Link>
              <Link href="/logs" className="hover:text-foreground">Logs</Link>
            </nav>
          </div>
          <button onClick={() => setDark((v) => !v)} className="text-sm rounded-md border px-3 py-1.5 hover:bg-accent">
            {dark ? 'Light' : 'Dark'} mode
          </button>
        </div>
      </header>
      <main className="container py-6 animate-fade-in-up">
        <Component {...pageProps} />
      </main>
    </div>
  );
}
