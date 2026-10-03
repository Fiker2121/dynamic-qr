'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QRCodePreview } from '@/components/qr/qr-code-preview';
import { DEFAULT_QR_STYLE } from '@/lib/qr/config';
import { cn } from '@/lib/utils';
import type { QRStyleConfig } from '@/types/database';

const SHORT_LINK = 'https://dynamicqr.example/r/aZ91Kx7';

const DESTINATIONS = [
  { id: 'spring', label: 'Spring menu', url: 'https://cafe.example/menu/spring' },
  { id: 'summer', label: 'Summer menu', url: 'https://cafe.example/menu/summer' },
];

const THEMES: Array<{ id: string; label: string; swatch: string; style: Partial<QRStyleConfig> }> = [
  { id: 'ink', label: 'Ink', swatch: '#111827', style: { foregroundColor: '#111827', backgroundColor: '#ffffff', dotType: 'rounded' } },
  { id: 'indigo', label: 'Indigo', swatch: '#4338ca', style: { foregroundColor: '#4338ca', backgroundColor: '#ffffff', dotType: 'dots' } },
  { id: 'forest', label: 'Forest', swatch: '#166534', style: { foregroundColor: '#166534', backgroundColor: '#f0fdf4', dotType: 'classy-rounded' } },
];

const POINTS = ['Change the destination without reprinting', 'Style it to match your brand', 'See every scan by time, country, and device'];

export function Hero({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [themeId, setThemeId] = useState(THEMES[0].id);
  const [destinationId, setDestinationId] = useState(DESTINATIONS[0].id);

  const style = useMemo<QRStyleConfig>(() => {
    const theme = THEMES.find((item) => item.id === themeId) ?? THEMES[0];
    return { ...DEFAULT_QR_STYLE, margin: 14, ...theme.style };
  }, [themeId]);
  const destination = DESTINATIONS.find((item) => item.id === destinationId) ?? DESTINATIONS[0];

  return (
    <section className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -top-40 right-0 h-[520px] w-[520px] rounded-full bg-primary/20 blur-[120px]" />
      <div className="container relative grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-8">
          <div className="space-y-5">
            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Create Dynamic QR Codes. Track Every Scan.
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              Generate beautiful QR codes with editable destinations and real-time analytics.
            </p>
          </div>
          <ul className="space-y-2.5">
            {POINTS.map((point) => (
              <li key={point} className="flex items-center gap-2.5 text-sm">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-primary/15 text-primary"><Check className="h-3 w-3" aria-hidden="true" /></span>
                {point}
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href={isAuthenticated ? '/dashboard/qr-codes/new' : '/signup'}>Create Your QR Code<ArrowRight /></Link>
            </Button>
            <Button asChild size="lg" variant="outline"><a href="#demo">View Demo</a></Button>
          </div>
        </div>

        <div className="mx-auto w-full max-w-md">
          <div className="glass space-y-5 rounded-3xl p-5 shadow-2xl shadow-primary/10 sm:p-6">
            <div className="flex justify-center rounded-2xl bg-white p-3">
              <QRCodePreview data={SHORT_LINK} style={style} renderSize={280} label="Sample dynamic QR code" />
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">This printed code never changes</p>
              <code className="block truncate rounded-lg bg-muted px-3 py-2 font-mono text-xs">{SHORT_LINK}</code>
            </div>

            <div className="space-y-2" role="group" aria-labelledby="hero-destination">
              <p id="hero-destination" className="text-xs text-muted-foreground">Scans go to</p>
              <div className="grid grid-cols-2 gap-2">
                {DESTINATIONS.map((item) => (
                  <button key={item.id} type="button" onClick={() => setDestinationId(item.id)} aria-pressed={destinationId === item.id}
                    className={cn('rounded-lg border px-3 py-2 text-sm transition-colors', destinationId === item.id ? 'border-primary bg-primary/15 text-foreground' : 'text-muted-foreground hover:bg-accent/60')}>
                    {item.label}
                  </button>
                ))}
              </div>
              <p className="truncate text-sm" aria-live="polite">{destination.url}</p>
            </div>

            <div className="flex items-center justify-between gap-3 border-t pt-4">
              <span id="hero-style" className="text-xs text-muted-foreground">Style</span>
              <div className="flex gap-2" role="group" aria-labelledby="hero-style">
                {THEMES.map((item) => (
                  <button key={item.id} type="button" onClick={() => setThemeId(item.id)} aria-pressed={themeId === item.id} aria-label={`${item.label} style`}
                    className={cn('h-7 w-7 rounded-full border-2 transition-transform', themeId === item.id ? 'scale-110 border-foreground' : 'border-transparent')}
                    style={{ background: item.swatch }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
