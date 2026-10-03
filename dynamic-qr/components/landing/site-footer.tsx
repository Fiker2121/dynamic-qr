import Link from 'next/link';
import { Brand } from '@/components/dashboard/brand';

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="container grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]">
        <div className="space-y-3">
          <Brand />
          <p className="max-w-xs text-sm text-muted-foreground">Dynamic QR codes with editable destinations and scan analytics.</p>
        </div>
        <nav aria-label="Product" className="space-y-3 text-sm">
          <p className="font-medium">Product</p>
          <ul className="space-y-2 text-muted-foreground">
            <li><a href="#features" className="hover:text-foreground">Features</a></li>
            <li><a href="#pricing" className="hover:text-foreground">Pricing</a></li>
            <li><Link href="/dashboard" className="hover:text-foreground">Dashboard</Link></li>
          </ul>
        </nav>
        <nav aria-label="Account" className="space-y-3 text-sm">
          <p className="font-medium">Account</p>
          <ul className="space-y-2 text-muted-foreground">
            <li><Link href="/login" className="hover:text-foreground">Sign in</Link></li>
            <li><Link href="/signup" className="hover:text-foreground">Create account</Link></li>
          </ul>
        </nav>
      </div>
      <div className="container border-t py-6 text-sm text-muted-foreground">© {new Date().getFullYear()} Dynamic QR. All rights reserved.</div>
    </footer>
  );
}
