import {createSupabaseServerClient} from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export default async function About() {
  const db = await createSupabaseServerClient();
  const { data } = await db.from('site_settings').select('value').eq('key', 'about-text').single();

  const text = data?.value || 'LIL REEM STORE is an independent artist and handmade shop. This space is intentionally easy to update: replace this short introduction with your own story, materials, creative practice, and the things that inspire your work.';

  return (
    <section className="page wrap">
      <div className="page-intro">
        <p className="eyebrow">ABOUT THE STUDIO</p>
        <h1>A quiet place for making.</h1>
        <p style={{ whiteSpace: 'pre-wrap' }}>{text}</p>
      </div>
      {!data?.value && (
        <div className="notice">Owner note: edit this About copy from the dashboard settings.</div>
      )}
    </section>
  );
}
