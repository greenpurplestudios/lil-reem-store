'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const db = createSupabaseBrowserClient();
      const { data: { user } } = await db.auth.getUser();

      if (!user && pathname !== '/admin/login') {
        router.push('/admin/login');
      } else if (user && pathname !== '/admin/login') {
        // Optional: Check if user is an admin
        const { data: admin } = await db.from('admin_users').select('user_id').eq('user_id', user.id).maybeSingle();
        if (!admin) {
          router.push('/admin/login?reason=unauthorized');
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    checkAuth();
  }, [pathname, router]);

  if (loading) {
    return <div className="page wrap"><p className="empty">Checking authorization...</p></div>;
  }

  return <>{children}</>;
}
