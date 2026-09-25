'use server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function submitOrder(
  formData: FormData,
  items: { id: string; quantity: number }[]
) {
  if (items.length === 0) {
    return { error: 'Your cart is empty.' };
  }

  const db = await createSupabaseServerClient();

  const email = String(formData.get('email'));
  const customerName = String(formData.get('name'));

  const { data, error } = await db.rpc('place_order', {
    p_email: email,
    p_customer_name: customerName,
    p_items: items
  });

  if (error) {
    return { error: 'Failed to process order: ' + error.message };
  }

  if (data && data.success === false) {
    return { error: data.error || 'Failed to place order.' };
  }

  return { success: true, orderNumber: data.order_number };
}
