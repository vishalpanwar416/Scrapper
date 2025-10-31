import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiGet } from '../../lib/api';

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const product = await apiGet(`/api/products/${id}`);
        setItem(product);
      } catch (e) {
        setError(e.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Gallery */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="aspect-[3/4] bg-muted/30">
          {item?.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full grid place-items-center text-muted-foreground text-sm">No image</div>
          )}
        </div>
      </div>

      {/* Info */}
      <div>
        <div className="text-xs text-muted-foreground mb-2">
          <Link href="/shop" className="hover:underline">Shop</Link>
          <span className="mx-2">/</span>
          <span>{item?.website?.name || 'Product'}</span>
        </div>
        <h1 className="text-2xl font-semibold">{item?.title || '...'}</h1>
        <div className="mt-2 text-xl">{item?.price ? `₹${item.price}` : '-'}</div>
        {item?.originalPrice ? (
          <div className="text-sm text-muted-foreground">MRP: ₹{item.originalPrice}</div>
        ) : null}

        {/* Colors */}
        {item?.colors?.length ? (
          <div className="mt-4">
            <div className="text-sm font-medium mb-2">Colors</div>
            <div className="flex flex-wrap gap-2">
              {item.colors.map(c => (
                <span key={c.id} className="rounded-full border px-3 py-1 text-xs text-muted-foreground">{c.name}</span>
              ))}
            </div>
          </div>
        ) : null}

        {/* Sizes */}
        {item?.sizes?.length ? (
          <div className="mt-4">
            <div className="text-sm font-medium mb-2">Sizes</div>
            <div className="flex flex-wrap gap-2">
              {item.sizes.map(s => (
                <span key={s.id} className={`rounded-md border px-3 py-1 text-xs ${s.available ? 'bg-background' : 'opacity-50'} `}>{s.size}</span>
              ))}
            </div>
          </div>
        ) : null}

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          {item?.url ? (
            <a href={item.url} target="_blank" rel="noreferrer" className="inline-flex items-center rounded-md border px-4 py-2 text-sm hover:bg-accent">View on site</a>
          ) : null}
          <Link href="/shop" className="inline-flex items-center rounded-md border px-4 py-2 text-sm hover:bg-accent">Continue shopping</Link>
        </div>

        {/* Description */}
        {item?.description ? (
          <div className="mt-6">
            <div className="text-sm font-medium mb-1">Description</div>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{item.description}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
