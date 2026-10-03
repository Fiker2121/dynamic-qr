import type { Metadata } from 'next';
import { AnalyticsShowcase } from '@/components/landing/analytics-showcase';
import { Features } from '@/components/landing/features';
import { Hero } from '@/components/landing/hero';
import { LiveDemo } from '@/components/landing/live-demo';
import { Pricing } from '@/components/landing/pricing';
import { SiteFooter } from '@/components/landing/site-footer';
import { SiteHeader } from '@/components/landing/site-header';
import { getOptionalUser } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Dynamic QR Code Generator with Analytics',
  description: 'Create customizable dynamic QR codes and track scans by time, location, and device.',
};

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const user = await getOptionalUser();
  const isAuthenticated = Boolean(user);

  return (
    <>
      <SiteHeader isAuthenticated={isAuthenticated} />
      <main>
        <Hero isAuthenticated={isAuthenticated} />
        <Features />
        <LiveDemo />
        <AnalyticsShowcase />
        <Pricing />
      </main>
      <SiteFooter />
    </>
  );
}
