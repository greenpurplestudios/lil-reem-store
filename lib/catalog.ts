import {createSupabaseBrowserClient} from '@/lib/supabase';
export type Product={id:string;slug:string;name:string;description:string|null;price_cents:number;stock_quantity:number;featured:boolean;categories:{name:string;slug:string}|null;product_images:{storage_path:string;alt_text:string|null}[]};
export async function products(options?: { featured?: boolean, categorySlug?: string, search?: string, sort?: string }) {
  const db = createSupabaseBrowserClient();
  // Use a standard join, only use inner join when filtering by category
  const selectStr = options?.categorySlug
    ? 'id,slug,name,description,price_cents,stock_quantity,featured,categories!inner(name,slug),product_images(storage_path,alt_text)'
    : 'id,slug,name,description,price_cents,stock_quantity,featured,categories(name,slug),product_images(storage_path,alt_text)';

  let q = db.from('products').select(selectStr).eq('status','published');

  if (options?.featured) q = q.eq('featured', true);
  if (options?.search) q = q.ilike('name', `%${options.search}%`);
  if (options?.categorySlug) q = q.eq('categories.slug', options.categorySlug);

  if (options?.sort === 'price_asc') {
    q = q.order('price_cents', { ascending: true });
  } else if (options?.sort === 'price_desc') {
    q = q.order('price_cents', { ascending: false });
  } else {
    q = q.order('created_at', { ascending: false }); // Newest first
  }

  const { data } = await q;
  return (data ?? []) as unknown as Product[];
}

export async function categories() {
  const db = createSupabaseBrowserClient();
  const { data } = await db.from('categories').select('*').order('sort_order');
  return data ?? [];
}
export const imageUrl=(path?:string)=>path?`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${path}`:'/images/artist-at-work.png';
