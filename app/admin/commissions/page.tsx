'use client';
import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { AdminNav } from '@/components/AdminNav';

export default function Commissions() {
  const [commissions, setCommissions] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const load = async () => {
    const db = createSupabaseBrowserClient();
    const { data: cData } = await db.from('commissions').select('*').order('sort_order');
    const { data: rData } = await db.from('commission_requests').select('*, commissions(name)').order('created_at', { ascending: false });
    setCommissions(cData ?? []);
    setRequests(rData ?? []);
  };

  useEffect(() => { load() }, []);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const f = new FormData(e.currentTarget);
    const { error } = await createSupabaseBrowserClient().from('commissions').insert({
      name: f.get('name'),
      description: f.get('description'),
      starting_price_cents: Math.round(Number(f.get('price')) * 100),
      turnaround: f.get('turnaround'),
      available: true
    });
    setSaving(false);
    setMessage(error ? error.message : 'Commission option saved.');
    if (!error) {
      e.currentTarget.reset();
      load();
    }
  };

  const toggleStatus = async (id: string, available: boolean) => {
    await createSupabaseBrowserClient().from('commissions').update({ available }).eq('id', id);
    load();
  };

  return (
    <section className="admin wrap">
      <div className="admin-grid">
        <AdminNav />
        <div>
          <p className="eyebrow">COMMISSIONS</p>
          <h1>Commission Types & Requests</h1>

          <form className="form admin-card" onSubmit={submit}>
            <h2>Add Commission Type</h2>
            <div className="split">
              <label>Name <input name="name" required placeholder="e.g. 8x10 Oil Portrait" /></label>
              <label>Starting Price (USD) <input name="price" type="number" min="0" step="0.01" required /></label>
            </div>
            <label>Description <textarea name="description" required /></label>
            <label>Turnaround time <input name="turnaround" placeholder="e.g. 4-6 weeks" /></label>
            <button className="button" disabled={saving}>{saving ? 'Saving...' : 'Add Type'}</button>
            {message && <p className="notice">{message}</p>}
          </form>

          <div className="admin-card">
            <h2>Active Commission Types</h2>
            {commissions.length ? commissions.map(c => (
              <div className="admin-row" key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid var(--line)' }}>
                <div>
                  <b>{c.name}</b>
                  <small style={{ display: 'block', color: 'var(--muted)', marginTop: '4px' }}>
                    Starts at ${(c.starting_price_cents / 100).toFixed(2)} · {c.turnaround}
                  </small>
                </div>
                <div>
                  <button className="chip" onClick={() => toggleStatus(c.id, !c.available)}>
                    {c.available ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>
            )) : <p className="empty">No commission types configured.</p>}
          </div>

          <div className="admin-card">
            <h2>Recent Requests</h2>
            {requests.length ? requests.map(r => (
              <div className="admin-row" key={r.id} style={{ padding: '15px 0', borderBottom: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <b>{r.customer_name} <a href={`mailto:${r.email}`} style={{ color: 'var(--lilac)', fontWeight: 'normal' }}>({r.email})</a></b>
                  <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
                {r.commissions?.name && <p style={{ fontSize: '14px', margin: '0 0 10px', color: 'var(--muted)' }}>Type: {r.commissions.name}</p>}
                <p style={{ margin: '0 0 10px', fontSize: '14px', whiteSpace: 'pre-wrap' }}>{r.description}</p>
                <div style={{ display: 'flex', gap: '15px', fontSize: '13px', color: 'var(--muted)' }}>
                  {r.preferred_style && <span>Style: {r.preferred_style}</span>}
                  {r.budget_cents && <span>Budget: ${(r.budget_cents / 100).toFixed(2)}</span>}
                </div>
              </div>
            )) : <p className="empty">No requests yet.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
