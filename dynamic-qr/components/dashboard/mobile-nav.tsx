'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Brand } from '@/components/dashboard/brand';
import { NavLinks } from '@/components/dashboard/nav-links';
import { ThemeToggle } from '@/components/dashboard/theme-toggle';
import { UserMenu } from '@/components/dashboard/user-menu';

export function MobileNav({ email }: { email: string }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-xl lg:hidden">
      <Brand href="/dashboard" />
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open navigation menu"><Menu /></Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col gap-6">
            <SheetHeader>
              <SheetTitle>Dynamic QR</SheetTitle>
              <SheetDescription className="sr-only">Dashboard navigation</SheetDescription>
            </SheetHeader>
            <div className="flex-1"><NavLinks onNavigate={() => setOpen(false)} /></div>
            <UserMenu email={email} />
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
