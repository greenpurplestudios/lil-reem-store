import {products, categories} from '@/lib/catalog';
import {CatalogCard} from '@/components/CatalogCard';
import Link from 'next/link';

export const dynamic='force-dynamic';

export default async function Shop({ searchParams }: { searchParams: { search?: string, sort?: string, category?: string } }) {
  const items = await products({
    search: searchParams.search,
    sort: searchParams.sort,
    categorySlug: searchParams.category
  });
  const cats = await categories();

  return (
    <section className="page wrap">
      <div className="page-intro">
        <p className="eyebrow">THE COLLECTION</p>
        <h1>Objects with a little magic.</h1>
        <p>Small-batch original art, handmade pieces, and thoughtful details from the studio.</p>
      </div>

      <form className="toolbar" action="/shop" method="GET">
        <input
          name="search"
          aria-label="Search products"
          placeholder="Search the shop"
          defaultValue={searchParams.search}
        />
        {searchParams.category && <input type="hidden" name="category" value={searchParams.category} />}
        <select name="sort" aria-label="Sort products" defaultValue={searchParams.sort}>
          <option value="newest">Newest first</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </select>
        <button className="button" style={{ padding: '0 15px' }} type="submit">Search</button>
      </form>

      <div className="filter-row">
        <Link href="/shop" className="chip" style={{ borderColor: !searchParams.category ? 'var(--lilac)' : 'var(--line)', color: !searchParams.category ? 'var(--lilac)' : 'inherit' }}>
          All pieces
        </Link>
        {cats.map((c: any) => (
          <Link
            key={c.slug}
            href={`/shop?category=${c.slug}${searchParams.sort ? `&sort=${searchParams.sort}` : ''}`}
            className="chip"
            style={{ borderColor: searchParams.category === c.slug ? 'var(--lilac)' : 'var(--line)', color: searchParams.category === c.slug ? 'var(--lilac)' : 'inherit' }}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {items.length ? (
        <div className="product-grid">
          {items.map(product => <CatalogCard product={product} key={product.id}/>)}
        </div>
      ) : (
        <div className="empty">No pieces found matching your criteria.</div>
      )}
    </section>
  );
}
