import { BarChart3, Download, Globe2, Link2, Palette, Smartphone } from 'lucide-react';

const FEATURES = [
  { icon: Link2, title: 'Dynamic Destination URLs', body: 'Point a printed code somewhere new in seconds. The QR image never changes.' },
  { icon: Palette, title: 'Custom QR Styling', body: 'Pick colors, dot and corner shapes, and add your logo to the center.' },
  { icon: BarChart3, title: 'Scan Analytics', body: 'See total scans, recent activity, and scans over time for every code.' },
  { icon: Globe2, title: 'Country Detection', body: 'Learn which countries scan your codes, using coarse location from your host. No IP addresses are stored.' },
  { icon: Smartphone, title: 'Device Analytics', body: 'Know whether people scan on phones, tablets, or desktops.' },
  { icon: Download, title: 'SVG/PNG Export', body: 'Download print-ready PNG or scalable SVG files at the size you choose.' },
];

export function Features() {
  return (
    <section id="features" className="container py-16 sm:py-24">
      <div className="max-w-2xl space-y-3">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Print once. Update whenever.</h2>
        <p className="text-muted-foreground">Everything you need to run QR codes you can’t easily reprint.</p>
      </div>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <li key={title} className="rounded-2xl border bg-card p-6">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary"><Icon className="h-5 w-5" aria-hidden="true" /></span>
            <h3 className="mt-4 font-semibold">{title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
