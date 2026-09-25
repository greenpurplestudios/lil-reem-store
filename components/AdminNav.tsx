import Link from 'next/link';
export function AdminNav(){return <aside className="sidebar"><Link href="/admin">Overview</Link><Link href="/admin/products">Products</Link><Link href="/admin/categories">Categories</Link><Link href="/admin/commissions">Commissions</Link><Link href="/admin/orders">Orders</Link><Link href="/admin/settings">Settings</Link></aside>}
