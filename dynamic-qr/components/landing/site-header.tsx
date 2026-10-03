'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { Brand } from '@/components/dashboard/brand';
import { Button } from '@/components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

const LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#analytics', label: 'Analytics' },
  { href: '#pricing', label: 'Pricing' },
];

export function SiteHeader({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/75 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Brand />
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated ? (
            <Button asChild><Link href="/dashboard">Open dashboard</Link></Button>
          ) : (
            <>
              <Button asChild variant="ghost"><Link href="/login">Sign In</Link></Button>
              <Button asChild><Link href="/signup">Get Started</Link></Button>
            </>
          )}
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu"><Menu /></Button>
          </SheetTrigger>
          <SheetContent side="top" className="space-y-4">
            <SheetHeader>
              <SheetTitle>Dynamic QR</SheetTitle>
              <SheetDescription className="sr-only">Site navigation</SheetDescription>
            </SheetHeader>
            <nav aria-label="Mobile" className="flex flex-col">
              {LINKS.map((link) => (
                <SheetClose asChild key={link.href}>
                  <a href={link.href} className="rounded-lg px-2 py-3 text-base font-medium hover:bg-accent">{link.label}</a>
                </SheetClose>
              ))}
            </nav>
            <div className="flex flex-col gap-2">
              {isAuthenticated ? (
                <Button asChild size="lg"><Link href="/dashboard">Open dashboard</Link></Button>
              ) : (
                <>
                  <Button asChild size="lg"><Link href="/signup">Get Started</Link></Button>
                  <Button asChild size="lg" variant="outline"><Link href="/login">Sign In</Link></Button>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
