'use client';
import {useState, useEffect} from 'react';
import {createSupabaseBrowserClient} from '@/lib/supabase';

export default function Commissions(){
  const [state,setState]=useState('');
  const [types,setTypes]=useState<any[]>([]);

  useEffect(() => {
    const fetchTypes = async () => {
      const { data } = await createSupabaseBrowserClient().from('commissions').select('*').eq('available', true).order('sort_order');
      if (data) setTypes(data);
    };
    fetchTypes();
  }, []);

  const submit=async(e:React.FormEvent<HTMLFormElement>)=>{
    e.preventDefault();
    setState('Sending…');
    const f=new FormData(e.currentTarget);
    const commissionId = f.get('type') ? String(f.get('type')) : null;

    const {error}=await createSupabaseBrowserClient().from('commission_requests').insert({
      customer_name:f.get('name'),
      email:f.get('email'),
      commission_id: commissionId,
      description:f.get('description'),
      preferred_style:f.get('style')||null,
      budget_cents:f.get('budget')?Math.round(Number(f.get('budget'))*100):null,
      notes:f.get('notes')||null
    });

    setState(error?error.message:'Thank you — your request has been received. No payment has been taken.');
    if(!error)e.currentTarget.reset()
  };

  return (
    <section className="page wrap">
      <div className="page-intro">
        <p className="eyebrow">CUSTOM WORK</p>
        <h1>Let’s make something personal.</h1>
        <p>Commissions are a collaborative way to turn an idea, memory, or feeling into an original piece.</p>
      </div>
      <div className="two-col">
        <div>
          <h2>How it works</h2>
          <p>1. Share your idea and references.<br/>2. I’ll confirm scope, timing, and final price.<br/>3. Once approved, your piece is made with care.</p>
          <div className="notice">Requests are not payments or confirmed orders. You’ll receive a reply before any work begins.</div>
        </div>

        <form className="form" onSubmit={submit}>
          <div className="split">
            <label>Your name<input required name="name"/></label>
            <label>Email<input required type="email" name="email"/></label>
          </div>

          <label>
            Commission Type
            <select name="type">
              <option value="">General Inquiry / Custom Idea</option>
              {types.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name} (Starts at ${(t.starting_price_cents / 100).toFixed(2)})
                </option>
              ))}
            </select>
          </label>

          <label>Tell me about your idea<textarea required name="description" placeholder="What would you like made?"/></label>

          <div className="split">
            <label>Preferred style<input name="style" placeholder="Optional"/></label>
            <label>Budget (USD)<input name="budget" type="number" min="0" step="0.01" placeholder="Optional"/></label>
          </div>

          <label>Additional notes<textarea name="notes" placeholder="Optional"/></label>

          <button className="button">Submit commission request</button>
          {state&&<p className="notice">{state}</p>}
        </form>
      </div>
    </section>
  );
}
