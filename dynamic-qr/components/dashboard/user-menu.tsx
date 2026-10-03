'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronsUpDown, LogOut, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { createClient } from '@/lib/supabase/browser';

export function UserMenu({ email }: { email: string }) {
  const router = useRouter();

  async function signOut() {
    const { error } = await createClient().auth.signOut();
    if (error) {
      toast.error('We couldn’t sign you out. Try again.');
      return;
    }
    router.push('/login');
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center gap-3 rounded-lg border bg-card px-3 py-2 text-left text-sm hover:bg-accent/60" aria-label="Account menu">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold uppercase text-primary-foreground" aria-hidden="true">
          {email.charAt(0)}
        </span>
        <span className="min-w-0 flex-1 truncate">{email}</span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="truncate font-normal text-muted-foreground">{email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings"><Settings />Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={signOut}><LogOut />Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
