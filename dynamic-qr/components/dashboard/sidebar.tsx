import { Brand } from '@/components/dashboard/brand';
import { NavLinks } from '@/components/dashboard/nav-links';
import { ThemeToggle } from '@/components/dashboard/theme-toggle';
import { UserMenu } from '@/components/dashboard/user-menu';

export function Sidebar({ email }: { email: string }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col gap-6 border-r bg-card/40 p-4 lg:flex">
      <Brand href="/dashboard" className="px-2 pt-1" />
      <div className="flex-1"><NavLinks /></div>
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
          Theme
          <ThemeToggle />
        </div>
        <UserMenu email={email} />
      </div>
    </aside>
  );
}
