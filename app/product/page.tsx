'use client';
import { useEffect, useState, Suspense } from 'react';
import Image from 'next/image';
import { notFound, useSearchParams } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { imageUrl } from '@/lib/catalog';
import { AddToCartForm } from './AddToCartForm';

function ProductContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [p, setP] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const db = createSupabaseBrowserClient();
    db.from('products').select('id,slug,name,description,price_cents,stock_quantity,categories(name),product_images(storage_path,alt_text)').eq('slug', id).eq('status', 'published').single().then(({ data }) => {
      setP(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="page wrap"><p className="empty">Loading...</p></div>;
  if (!p) return <div className="page wrap"><p className="empty">Product not found.</p></div>;

  const images = p.product_images as unknown as {storage_path:string;alt_text:string|null}[];
  const image = images?.[0];
  const category = p.categories as unknown as {name:string}|null;

  return (
    <section className="page wrap">
      <div className="two-col detail">
        <div className="detail-image">
          <Image src={imageUrl(image?.storage_path)} alt={image?.alt_text||p.name} fill priority/>
        </div>
        <div>
          <p className="eyebrow">{category?.name||'STUDIO ITEM'}</p>
          <h1>{p.name}</h1>
          <p className="price">{new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(p.price_cents/100)}</p>
          <p style={{ whiteSpace: 'pre-wrap' }}>{p.description}</p>
          <p className="notice">{p.stock_quantity>0?`${p.stock_quantity} available from the studio.`:'Currently unavailable.'}</p>
          <AddToCartForm product={p} image={imageUrl(image?.storage_path)} />
        </div>
      </div>
    </section>
  );
}

export default function Product() {
  return (
    <Suspense fallback={<div className="page wrap"><p className="empty">Loading...</p></div>}>
      <ProductContent />
    </Suspense>
  );
}
