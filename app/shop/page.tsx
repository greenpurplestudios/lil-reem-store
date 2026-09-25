'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {products, categories} from '@/lib/catalog';
import {CatalogCard} from '@/components/CatalogCard';
import Link from 'next/link';

import { Suspense } from 'react';

function ShopContent() {
  const searchParams = useSearchParams();
  const search = searchParams.get('search') || undefined;
  const sort = searchParams.get('sort') || undefined;
  const category = searchParams.get('category') || undefined;

  const [items, setItems] = useState<any[]>([]);
  const [cats, setCats] = useState<any[]>([]);

  useEffect(() => {
    products({ search, sort, categorySlug: category }).then(setItems);
    categories().then(setCats);
  }, [search, sort, category]);

  return (
    <section className="page wrap">
      <div className="page-intro">
        <p className="eyebrow">THE COLLECTION</p>
        <h1>Objects with a little magic.</h1>
        <p>Small-batch original art, handmade pieces, and thoughtful details from the studio.</p>
      </div>

      <form className="toolbar" onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const params = new URLSearchParams();
        const s = f.get('search');
        if (s) params.set('search', String(s));
        if (category) params.set('category', category);
        const sortVal = f.get('sort');
        if (sortVal) params.set('sort', String(sortVal));
        window.location.href = `/lil-reem-store/shop?${params.toString()}`;
      }}>
        <input
          name="search"
          aria-label="Search products"
          placeholder="Search the shop"
          defaultValue={search}
        />
        <select name="sort" aria-label="Sort products" defaultValue={sort}>
          <option value="newest">Newest first</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </select>
        <button className="button" style={{ padding: '0 15px' }} type="submit">Search</button>
      </form>

      <div className="filter-row">
        <Link href="/shop" className="chip" style={{ borderColor: !category ? 'var(--lilac)' : 'var(--line)', color: !category ? 'var(--lilac)' : 'inherit' }}>
          All pieces
        </Link>
        {cats.map((c: any) => (
          <Link
            key={c.slug}
            href={`/shop?category=${c.slug}${sort ? `&sort=${sort}` : ''}`}
            className="chip"
            style={{ borderColor: category === c.slug ? 'var(--lilac)' : 'var(--line)', color: category === c.slug ? 'var(--lilac)' : 'inherit' }}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {items.length ? (
        <div className="product-grid">
          {items.map(product => <CatalogCard product={product} key={product.id}/>)}
        </div>
      ) : (
        <div className="empty">No pieces found matching your criteria.</div>
      )}
    </section>
  );
}

export default function Shop() {
  return (
    <Suspense fallback={<div className="page wrap"><p className="empty">Loading...</p></div>}>
      <ShopContent />
    </Suspense>
  );
}
