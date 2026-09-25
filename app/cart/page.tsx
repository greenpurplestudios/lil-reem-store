'use client';
import Link from 'next/link';
import { useCart } from '@/lib/cart';
import Image from 'next/image';

export default function Cart() {
  const { items, updateQuantity, removeItem, totalCents } = useCart();

  return (
    <section className="page wrap">
      <div className="page-intro">
        <p className="eyebrow">YOUR BAG</p>
        <h1>Cart</h1>
      </div>

      {items.length === 0 ? (
        <div className="empty">
          Your bag is waiting for something lovely.<br/><br/>
          <Link className="button" href="/shop">Browse the shop</Link>
        </div>
      ) : (
        <div className="two-col">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {items.map(item => (
              <div key={item.id} style={{ display: 'flex', gap: '20px', borderBottom: '1px solid var(--line)', paddingBottom: '20px' }}>
                <div style={{ position: 'relative', width: '100px', height: '100px', background: 'var(--pale)' }}>
                  {item.image && <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ margin: '0 0 10px', fontSize: '18px', fontFamily: '"Playfair Display", serif' }}>{item.name}</h3>
                    <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', textDecoration: 'underline', fontSize: '12px' }}>Remove</button>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '14px', color: 'var(--muted)' }}>
                      Quantity:
                      <select
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                        style={{ marginLeft: '10px', padding: '5px' }}
                      >
                        {[...Array(10)].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
                      </select>
                    </label>
                    <b style={{ color: 'var(--lilac)' }}>
                      {new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(item.price_cents / 100)}
                    </b>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="admin-card" style={{ height: 'fit-content' }}>
            <h2 style={{ marginTop: 0 }}>Order Summary</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: 'var(--muted)' }}>
              <span>Subtotal</span>
              <span>{new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(totalCents / 100)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', color: 'var(--muted)' }}>
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--line)', paddingTop: '15px', marginBottom: '25px', fontWeight: 'bold', fontSize: '18px' }}>
              <span>Total</span>
              <span>{new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(totalCents / 100)}</span>
            </div>
            <Link className="button" href="/checkout" style={{ width: '100%', justifyContent: 'center' }}>Proceed to checkout</Link>
          </div>
        </div>
      )}
    </section>
  );
}
