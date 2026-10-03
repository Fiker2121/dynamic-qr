import Link from 'next/link';
import { QrCode } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Brand({ href = '/', className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn('inline-flex items-center gap-2.5 font-semibold tracking-tight', className)}>
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
        <QrCode className="h-[18px] w-[18px]" aria-hidden="true" />
      </span>
      <span>Dynamic QR</span>
    </Link>
  );
}
