'use client';
import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { AdminNav } from '@/components/AdminNav';

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);

  const load = async () => {
    const db = createSupabaseBrowserClient();
    const { data } = await db
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    setOrders(data ?? []);
  };

  useEffect(() => { load() }, []);

  const updateStatus = async (id: string, status: string) => {
    await createSupabaseBrowserClient().from('orders').update({ status }).eq('id', id);
    load();
  };

  return (
    <section className="admin wrap">
      <div className="admin-grid">
        <AdminNav />
        <div>
          <p className="eyebrow">ORDERS</p>
          <h1>Customer Orders</h1>

          <div className="admin-card">
            <h2>Recent Orders</h2>
            {orders.length ? orders.map(o => (
              <div className="admin-row" key={o.id} style={{ padding: '20px 0', borderBottom: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 5px' }}>{o.order_number}</h3>
                    <div style={{ fontSize: '14px', color: 'var(--muted)' }}>
                      {o.customer_name} ({o.email}) · {new Date(o.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <b style={{ display: 'block', fontSize: '18px', marginBottom: '5px' }}>
                      ${(o.total_cents / 100).toFixed(2)}
                    </b>
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                      style={{ padding: '4px 8px', fontSize: '12px' }}
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div style={{ background: 'var(--pale)', padding: '15px', borderRadius: '4px' }}>
                  <b style={{ fontSize: '12px', letterSpacing: '0.1em', color: 'var(--muted)' }}>ORDER ITEMS</b>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '10px 0 0', fontSize: '14px' }}>
                    {o.order_items?.map((item: any) => (
                      <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <span>{item.quantity} × {item.product_name}</span>
                        <span>${(item.unit_price_cents * item.quantity / 100).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )) : <p className="empty">No orders have been placed yet.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
