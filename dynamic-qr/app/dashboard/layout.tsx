import { redirect } from 'next/navigation';
import { MobileNav } from '@/components/dashboard/mobile-nav';
import { Sidebar } from '@/components/dashboard/sidebar';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Middleware already gates /dashboard; this is a second, server-side check.
  if (!user) redirect('/login');
  const email = user.email ?? 'Account';

  return (
    <div className="min-h-screen">
      <Sidebar email={email} />
      <MobileNav email={email} />
      <main className="lg:pl-64">
        <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
