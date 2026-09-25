-- Function to place an order securely on the backend, bypassing RLS to update stock
create or replace function public.place_order(
  p_email text,
  p_customer_name text,
  p_items jsonb
) returns json language plpgsql security definer set search_path = public as $$
declare
  v_order_number text;
  v_order_id uuid;
  v_total_cents integer := 0;
  v_item jsonb;
  v_product record;
  v_order_item_ids uuid[] := '{}';
begin
  -- Generate order number
  v_order_number := 'ORD-' || upper(substr(md5(random()::text), 1, 6));

  -- 1. Create the order first (we will update total later)
  insert into public.orders (order_number, email, customer_name, total_cents, status)
  values (v_order_number, p_email, p_customer_name, 0, 'pending')
  returning id into v_order_id;

  -- 2. Loop through items to validate stock, deduct stock, and insert order items
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    -- Lock the row for update to prevent concurrent stock issues
    select * into v_product from public.products where id = (v_item->>'id')::uuid for update;

    if not found then
      raise exception 'Product not found: %', v_item->>'id';
    end if;

    if v_product.status != 'published' then
      raise exception 'Product is not available: %', v_product.name;
    end if;

    if (v_item->>'quantity')::integer <= 0 then
      raise exception 'Invalid quantity % for %', v_item->>'quantity', v_product.name;
    end if;

    if v_product.stock_quantity < (v_item->>'quantity')::integer then
      raise exception 'Not enough stock for %. Available: %', v_product.name, v_product.stock_quantity;
    end if;

    -- Decrement stock
    update public.products
    set stock_quantity = stock_quantity - (v_item->>'quantity')::integer
    where id = v_product.id;

    -- Calculate item total and add to order total
    v_total_cents := v_total_cents + (v_product.price_cents * (v_item->>'quantity')::integer);

    -- Insert order item
    insert into public.order_items (order_id, product_id, product_name, unit_price_cents, quantity)
    values (v_order_id, v_product.id, v_product.name, v_product.price_cents, (v_item->>'quantity')::integer);
  end loop;

  -- 3. Update the order with the final total
  update public.orders
  set total_cents = v_total_cents
  where id = v_order_id;

  return json_build_object('success', true, 'order_number', v_order_number, 'order_id', v_order_id);
exception
  when others then
    -- Transaction rolls back automatically on exception
    return json_build_object('success', false, 'error', 'An error occurred processing your order. Please try again or contact support.');
end;
$$;
