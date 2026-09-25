'use client';
import { useState } from 'react';
import { useCart } from '@/lib/cart';
import { submitOrder } from './actions';
import Link from 'next/link';

export default function Checkout() {
  const { items, totalCents, clearCart } = useCart();
  const [state, setState] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState('');

  if (items.length === 0 && state !== 'success') {
    return (
      <section className="page wrap">
        <div className="empty">Your cart is empty. <Link href="/shop" style={{ textDecoration: 'underline' }}>Return to shop</Link></div>
      </section>
    );
  }

  if (state === 'success') {
    return (
      <section className="page wrap">
        <div className="page-intro">
          <p className="eyebrow">THANK YOU</p>
          <h1>Order Confirmed</h1>
          <p>Your order #{orderId} has been placed successfully. We'll be in touch soon.</p>
          <Link className="button" href="/shop">Continue Shopping</Link>
        </div>
      </section>
    );
  }

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState('submitting');
    setError('');

    const formData = new FormData(e.currentTarget);
    const itemsPayload = items.map(i => ({ id: i.id, quantity: i.quantity }));

    const res = await submitOrder(formData, itemsPayload);

    if (res.error) {
      setError(res.error);
      setState('idle');
      return;
    }

    setOrderId(res.orderNumber || '');
    clearCart();
    setState('success');
  };

  return (
    <section className="page wrap">
      <div className="page-intro">
        <p className="eyebrow">CHECKOUT</p>
        <h1>Order details</h1>
        <p>Payment is not configured yet. This checkout is deliberately not able to mark an order as paid until a payment provider is connected.</p>
      </div>

      <div className="two-col">
        <form className="form" onSubmit={submit}>
          <h2>Contact Information</h2>
          <label>Email <input required type="email" name="email" /></label>

          <h2 style={{ marginTop: '20px' }}>Shipping Address</h2>
          <label>Full Name <input required name="name" /></label>
          <label>Address <input required name="address" /></label>
          <div className="split">
            <label>City <input required name="city" /></label>
            <label>Postal Code <input required name="postal" /></label>
          </div>

          <div className="notice">
            Connect a payment provider (for example Stripe) in the secure server environment to enable checkout. <b>(Simulated payment applied for now)</b>
          </div>

          <button className="button" style={{ marginTop: '20px' }} disabled={state === 'submitting'}>
            {state === 'submitting' ? 'Processing...' : `Place order — ${new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(totalCents / 100)}`}
          </button>

          {error && <p className="notice" style={{ borderColor: 'red', color: 'red' }}>{error}</p>}
        </form>

        <div className="admin-card" style={{ height: 'fit-content', background: '#fcfbff' }}>
          <h3>Order Summary</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
            {items.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span>{item.quantity} × {item.name}</span>
                <span>{new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format((item.price_cents * item.quantity) / 100)}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--line)', paddingTop: '15px', fontWeight: 'bold' }}>
            <span>Total</span>
            <span>{new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(totalCents / 100)}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
