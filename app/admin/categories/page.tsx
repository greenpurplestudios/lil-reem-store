'use client';
import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { AdminNav } from '@/components/AdminNav';

type Category = { id: string; name: string; slug: string; sort_order: number };

const slugify = (x: string) => x.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export default function Categories() {
  const [items, setItems] = useState<Category[]>([]);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await createSupabaseBrowserClient().from('categories').select('*').order('sort_order');
    setItems(data ?? []);
  };

  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const f = new FormData(e.currentTarget);
    const name = String(f.get('name'));
    const slug = slugify(name);

    const { error } = await createSupabaseBrowserClient().from('categories').insert({ name, slug });
    setSaving(false);
    setMessage(error ? error.message : 'Category saved.');
    if (!error) {
      e.currentTarget.reset();
      load();
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    await createSupabaseBrowserClient().from('categories').delete().eq('id', id);
    load();
  };

  return (
    <section className="admin wrap">
      <div className="admin-grid">
        <AdminNav />
        <div>
          <p className="eyebrow">PRODUCTS</p>
          <h1>Categories</h1>

          <form className="form admin-card" onSubmit={submit}>
            <h2>Add a category</h2>
            <div className="split">
              <label>Name <input name="name" required /></label>
            </div>
            <button className="button" disabled={saving}>{saving ? 'Saving…' : 'Add category'}</button>
            {message && <p className="notice">{message}</p>}
          </form>

          <div className="admin-card">
            <h2>Current categories</h2>
            {items.length ? items.map(item => (
              <div className="admin-row" key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid var(--line)' }}>
                <div>
                  <b>{item.name}</b>
                  <small style={{ display: 'block', color: 'var(--muted)', marginTop: '4px' }}>/{item.slug}</small>
                </div>
                <div>
                  <button className="chip" onClick={() => remove(item.id)}>Delete</button>
                </div>
              </div>
            )) : <p className="empty">No categories yet.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
