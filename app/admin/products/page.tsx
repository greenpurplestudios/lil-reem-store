'use client';
import {useEffect,useState} from 'react';
import {createSupabaseBrowserClient} from '@/lib/supabase';
import {AdminNav} from '@/components/AdminNav';

type Item={id:string;name:string;slug:string;price_cents:number;stock_quantity:number;status:string;featured:boolean};
const slugify=(x:string)=>x.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');

export default function Products(){
  const [items,setItems]=useState<Item[]>([]);
  const [categories,setCategories]=useState<any[]>([]);
  const [message,setMessage]=useState('');
  const [saving,setSaving]=useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    name: '', price: '', category: '', description: '', stock: '1', status: 'published', featured: false
  });

  const load=async()=>{
    const db = createSupabaseBrowserClient();
    const {data: pData}=await db.from('products').select('id,name,slug,price_cents,stock_quantity,status,featured').order('created_at',{ascending:false});
    const {data: cData}=await db.from('categories').select('id,name').order('sort_order');
    setItems(pData??[]);
    setCategories(cData??[]);
  };

  useEffect(()=>{load()},[]);

  const startEdit = async (id: string) => {
    setEditingId(id);
    setMessage('');
    const db = createSupabaseBrowserClient();
    const { data } = await db.from('products').select('*').eq('id', id).single();
    if (data) {
      setFormState({
        name: data.name,
        price: (data.price_cents / 100).toString(),
        category: data.category_id || '',
        description: data.description || '',
        stock: data.stock_quantity.toString(),
        status: data.status,
        featured: data.featured
      });
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormState({ name: '', price: '', category: '', description: '', stock: '1', status: 'published', featured: false });
    setMessage('');
  };

  const submit=async(e:React.FormEvent<HTMLFormElement>)=>{
    e.preventDefault();
    setSaving(true);
    const db = createSupabaseBrowserClient();
    const f=new FormData(e.currentTarget);
    const name=String(f.get('name'));
    const category_id = f.get('category') ? String(f.get('category')) : null;

    const payload = {
      name,
      slug:slugify(name),
      description:f.get('description'),
      price_cents:Math.round(Number(f.get('price'))*100),
      stock_quantity:Number(f.get('stock')),
      status:f.get('status'),
      category_id,
      featured:f.get('featured')==='on'
    };

    let product, error;

    if (editingId) {
      const res = await db.from('products').update(payload).eq('id', editingId).select().single();
      product = res.data;
      error = res.error;
    } else {
      const res = await db.from('products').insert(payload).select().single();
      product = res.data;
      error = res.error;
    }

    if (error) {
      setSaving(false);
      setMessage(error.message);
      return;
    }

    const imageFile = f.get('image') as File;
    if (imageFile && imageFile.size > 0 && product) {
      // If updating, delete the old image records first so the new one shows up
      if (editingId) {
        await db.from('product_images').delete().eq('product_id', product.id);
      }

      const ext = imageFile.name.split('.').pop();
      const filename = `${product.id}-${Date.now()}.${ext}`;

      const { error: uploadError } = await db.storage
        .from('product-images')
        .upload(filename, imageFile);

      if (!uploadError) {
        await db.from('product_images').insert({
          product_id: product.id,
          storage_path: filename,
          sort_order: 0
        });
      }
    }

    setSaving(false);
    setMessage(editingId ? 'Product updated successfully.' : 'Product saved successfully.');
    if (!editingId) e.currentTarget.reset();
    else cancelEdit();
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    await createSupabaseBrowserClient().from('products').delete().eq('id', id);
    load();
  };

  const update=async(item:Item,status:string)=>{
    await createSupabaseBrowserClient().from('products').update({status}).eq('id',item.id);
    load();
  };

  return (
    <section className="admin wrap">
      <div className="admin-grid">
        <AdminNav/>
        <div>
          <p className="eyebrow">PRODUCTS</p>
          <h1>Collection</h1>

          <form className="form admin-card" onSubmit={submit}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>{editingId ? 'Edit product' : 'Add a product'}</h2>
              {editingId && <button type="button" onClick={cancelEdit} className="text-button">Cancel edit</button>}
            </div>

            <div className="split">
              <label>Name<input name="name" required value={formState.name} onChange={e => setFormState({...formState, name: e.target.value})}/></label>
              <label>Price (USD)<input name="price" type="number" min="0" step="0.01" required value={formState.price} onChange={e => setFormState({...formState, price: e.target.value})}/></label>
            </div>

            <div className="split">
              <label>
                Category
                <select name="category" value={formState.category} onChange={e => setFormState({...formState, category: e.target.value})}>
                  <option value="">No category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>
              <label>Product Image<input type="file" name="image" accept="image/*" /></label>
            </div>

            <label>Description<textarea name="description" required value={formState.description} onChange={e => setFormState({...formState, description: e.target.value})}/></label>

            <div className="split">
              <label>Stock<input name="stock" type="number" min="0" required value={formState.stock} onChange={e => setFormState({...formState, stock: e.target.value})}/></label>
              <label>Status
                <select name="status" value={formState.status} onChange={e => setFormState({...formState, status: e.target.value})}>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="hidden">Hidden</option>
                  <option value="sold_out">Sold out</option>
                </select>
              </label>
            </div>
            <label><input name="featured" type="checkbox" checked={formState.featured} onChange={e => setFormState({...formState, featured: e.target.checked})}/> Feature on homepage</label>

            <button className="button" disabled={saving}>{saving ? 'Saving…' : (editingId ? 'Update product' : 'Publish product')}</button>
            {message&&<p className="notice">{message}</p>}
          </form>

          <div className="admin-card">
            <h2>Current products</h2>
            {items.length ? items.map(item=>(
              <div className="admin-row" key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid var(--line)' }}>
                <div>
                  <b>{item.name}</b>
                  <small style={{ display: 'block', color: 'var(--muted)', marginTop: '4px' }}>
                    ${(item.price_cents/100).toFixed(2)} · {item.stock_quantity} in stock · {item.status}
                  </small>
                </div>
                <div>
                  <button className="chip" onClick={()=>startEdit(item.id)}>Edit</button>
                  <button className="chip" style={{ marginLeft: '8px' }} onClick={()=>update(item,item.status==='hidden'?'published':'hidden')}>{item.status==='hidden'?'Show':'Hide'}</button>
                  <button className="chip" style={{ marginLeft: '8px' }} onClick={()=>update(item,'sold_out')}>Sold out</button>
                  <button className="chip" style={{ marginLeft: '8px', color: 'red', borderColor: 'red' }} onClick={()=>remove(item.id)}>Delete</button>
                </div>
              </div>
            )) : <p className="empty">No products yet.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
