'use client';

import { DeviceChart } from '@/components/analytics/device-chart';
import { ScansChart } from '@/components/analytics/scans-chart';
import { TopCountries } from '@/components/analytics/top-countries';
import type { CountryStat, DeviceStat, TimeSeriesPoint } from '@/types/database';

// Illustrative sample values for the marketing page only. They never touch real user data.
const SAMPLE_SERIES: TimeSeriesPoint[] = [3, 5, 4, 9, 12, 8, 14, 18, 15, 22, 19, 27, 24, 31].map((scans, index) => {
  const date = new Date(Date.UTC(2025, 0, 1 + index));
  return { date: date.toISOString().slice(0, 10), scans };
});

const SAMPLE_COUNTRIES: CountryStat[] = [
  { country: 'US', scans: 124, percentage: 41 },
  { country: 'GB', scans: 63, percentage: 21 },
  { country: 'DE', scans: 48, percentage: 16 },
  { country: 'ET', scans: 36, percentage: 12 },
  { country: 'Unknown', scans: 30, percentage: 10 },
];

const SAMPLE_DEVICES: DeviceStat[] = [
  { device: 'mobile', scans: 214, percentage: 71 },
  { device: 'tablet', scans: 18, percentage: 6 },
  { device: 'desktop', scans: 63, percentage: 21 },
  { device: 'unknown', scans: 6, percentage: 2 },
];

export function AnalyticsShowcase() {
  return (
    <section id="analytics" className="container py-16 sm:py-24">
      <div className="max-w-2xl space-y-3">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Know what happens after the scan</h2>
        <p className="text-muted-foreground">Sample data shown below. Your dashboard fills in with real scans as soon as someone scans your code.</p>
      </div>
      <div className="mt-10 space-y-6">
        <ScansChart data={SAMPLE_SERIES} description="Sample data: scans per day." />
        <div className="grid gap-6 lg:grid-cols-2">
          <DeviceChart data={SAMPLE_DEVICES} />
          <TopCountries data={SAMPLE_COUNTRIES} />
        </div>
      </div>
    </section>
  );
}
