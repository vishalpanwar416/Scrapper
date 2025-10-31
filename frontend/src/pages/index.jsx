import Link from 'next/link';
import { ArrowRight, ChevronDown } from 'lucide-react';

export default function Home() {
  return (
    <main>
      {/* Hero */}
      <section className="relative mb-10">
        {/* Gradient blobs */}
        <div className="blob blob--1 -top-32 -left-16" />
        <div className="blob blob--2 -top-6 right-6" />
        <div className="blob blob--3 bottom-4 left-1/3" />

        {/* Glass panel hero */}
        <div className="window-shell p-2 sm:p-3 relative">
          <div className="glass-panel rounded-screen p-8 sm:p-12 relative overflow-hidden">
            <div className="absolute inset-0 starfield pointer-events-none" />
            {/* heading glow */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-80 w-80 sm:h-[26rem] sm:w-[26rem] rounded-full bg-[radial-gradient(circle_at_center,hsl(var(--primary)/.22),transparent_60%)] blur-3xl" />
            </div>
            <div className="flex flex-col items-center text-center gap-6 relative">
              {/* pill nav */}
              <nav className="flex flex-wrap items-center gap-2 rounded-full bg-card/70 border border-white/10 px-3 py-1.5 text-xs">
                {[
                  ['Home','/'],
                  ['DeFi App','/shop'],
                  ['Assets','/products'],
                  ['Features','/products'],
                  ['Pricing','#'],
                  ['FAQ','#'],
                  ['Protection','#']
                ].map(([label,href]) => (
                  <Link key={label} href={href} className="rounded-full px-3 py-1 hover:bg-accent transition">
                    {label}
                  </Link>
                ))}
              </nav>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-tight">
                One-click for Asset Defense
              </h1>
              <p className="max-w-2xl text-sm sm:text-base text-muted-foreground">
                Dive into the art assets, where innovative scraping meets real-time insights.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link href="/shop" className="rounded-full border border-white/15 bg-card/60 backdrop-blur px-5 py-2.5 text-sm font-medium hover:bg-accent transition inline-flex items-center gap-2">
                  Open App <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/websites" className="rounded-full bg-foreground text-background px-5 py-2.5 text-sm font-medium hover:opacity-90 transition inline-flex items-center gap-2">
                  Discover More <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            {/* scroll cue */}
            <button
              onClick={() => {
                const el = document.getElementById('quick-links');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="absolute left-4 bottom-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-card/60 backdrop-blur px-3 py-1.5 text-xs text-foreground/80 hover:bg-accent transition"
            >
              <ChevronDown className="h-4 w-4" />
              Scroll down
            </button>
          </div>
        </div>
      </section>

      {/* Brand strip */}
      <section className="glass-panel mb-6 px-4 py-3 overflow-hidden">
        <div className="flex items-center justify-between gap-6 text-xs text-muted-foreground">
          {['Vercel','loom','Cash App','Loops','zapier','ramp','Raycast'].map((b)=> (
            <span key={b} className="opacity-70 hover:opacity-100 transition whitespace-nowrap">{b}</span>
          ))}
        </div>
      </section>

      {/* Quick links */}
      <section id="quick-links" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/websites" className="group rounded-lg border bg-card p-5 hover:bg-accent transition card-hover">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Websites</h2>
            <span className="text-xs text-muted-foreground group-hover:text-foreground">Manage</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">Add, enable/disable and run scrapes.</p>
        </Link>
        <Link href="/products" className="group rounded-lg border bg-card p-5 hover:bg-accent transition card-hover">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Products</h2>
            <span className="text-xs text-muted-foreground group-hover:text-foreground">Browse</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">Search and filter scraped products.</p>
        </Link>
        <Link href="/logs" className="group rounded-lg border bg-card p-5 hover:bg-accent transition card-hover">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Scrape Logs</h2>
            <span className="text-xs text-muted-foreground group-hover:text-foreground">Inspect</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">View scraping history and status.</p>
        </Link>
      </section>
    </main>
  );
}

