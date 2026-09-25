'use client';
import { useState } from 'react';
import { useCart } from '@/lib/cart';

export function AddToCartForm({ product, image }: { product: any, image: string }) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addItem({
      id: product.id,
      name: product.name,
      price_cents: product.price_cents,
      quantity,
      image
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (product.stock_quantity < 1) {
    return <button className="button" disabled>Out of stock</button>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <label style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px' }}>
        Quantity
        <select value={quantity} onChange={e => setQuantity(Number(e.target.value))}>
          {Array.from({ length: Math.min(product.stock_quantity, 10) }, (_, i) => i + 1).map(n => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </label>
      <button className="button" type="submit">
        {added ? 'Added to bag!' : 'Add to bag'}
      </button>
    </form>
  );
}
