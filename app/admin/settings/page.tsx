'use client';
import {useEffect,useState} from 'react';
import {createSupabaseBrowserClient} from '@/lib/supabase';
import {AdminNav} from '@/components/AdminNav';

export default function Settings(){
  const [text,setText]=useState('');
  const [message,setMessage]=useState('');
  const [saving,setSaving]=useState(false);

  const load=async()=>{
    const {data}=await createSupabaseBrowserClient().from('site_settings').select('value').eq('key','about-text').single();
    if(data) setText(data.value||'');
  };
  useEffect(()=>{load()},[]);

  const submit=async(e:React.FormEvent<HTMLFormElement>)=>{
    e.preventDefault();
    setSaving(true);

    const db=createSupabaseBrowserClient();
    const {data:existing}=await db.from('site_settings').select('id').eq('key','about-text').single();

    let error;
    if(existing){
      const res=await db.from('site_settings').update({value:text, updated_at: new Date().toISOString()}).eq('id',existing.id);
      error=res.error;
    }else{
      const res=await db.from('site_settings').insert({
        key:'about-text',
        value:text
      });
      error=res.error;
    }

    setSaving(false);
    setMessage(error?error.message:'Settings saved.');
  };

  return (
    <section className="admin wrap">
      <div className="admin-grid">
        <AdminNav/>
        <div>
          <p className="eyebrow">SETTINGS</p>
          <h1>Store Settings</h1>

          <form className="form admin-card" onSubmit={submit}>
            <h2>About page text</h2>
            <label>
              Story and studio info
              <textarea required value={text} onChange={e=>setText(e.target.value)}/>
            </label>
            <button className="button" disabled={saving}>{saving?'Saving…':'Save changes'}</button>
            {message&&<p className="notice">{message}</p>}
          </form>
        </div>
      </div>
    </section>
  );
}
