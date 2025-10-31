import Link from 'next/link';

export default function Home() {
  return (
    <main>
      <section className="mb-6 animate-fade-in-up">
        <h1 className="text-2xl font-semibold tracking-tight">Scraper Admin</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage websites, run scrapes, and browse data.</p>
      </section>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

