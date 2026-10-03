import type { Metadata } from 'next';
import { Activity, CalendarDays, QrCode, ScanLine } from 'lucide-react';
import { AnalyticsFilters } from '@/components/analytics/analytics-filters';
import { DeviceChart } from '@/components/analytics/device-chart';
import { RecentScans } from '@/components/analytics/recent-scans';
import { ScansChart } from '@/components/analytics/scans-chart';
import { StatCards } from '@/components/analytics/stat-cards';
import { TopCountries } from '@/components/analytics/top-countries';
import { PageHeader } from '@/components/dashboard/page-header';
import { getActiveQrCount, getOwnedQr, getQrAnalytics, parseRange } from '@/lib/analytics';
import { createClient } from '@/lib/supabase/server';
import { formatNumber } from '@/lib/utils';

export const metadata: Metadata = { title: 'Analytics' };
export const dynamic = 'force-dynamic';

const RANGE_LABELS = { '7': 'in the last 7 days', '30': 'in the last 30 days', '90': 'in the last 90 days', all: 'all time' } as const;

export default async function AnalyticsPage({ searchParams }: { searchParams: { range?: string; qr?: string } }) {
  const supabase = createClient();
  const range = parseRange(searchParams.range);

  // Only honor the ?qr= filter if the QR code exists and belongs to the signed-in user.
  const selectedQr = searchParams.qr ? await getOwnedQr(supabase, searchParams.qr) : null;
  const qrCodeId = selectedQr?.id ?? null;

  const [analytics, activeCount, optionsResult] = await Promise.all([
    getQrAnalytics(supabase, { range, qrCodeId }),
    getActiveQrCount(supabase, { range }),
    supabase.from('qr_codes').select('id, name').order('name', { ascending: true }),
  ]);

  if (!analytics) throw new Error('Analytics unavailable');

  const qrOptions = ((optionsResult.data ?? []) as Array<{ id: string; name: string }>);
  const { summary, series, countries, devices, recent } = analytics;

  return (
    <>
      <PageHeader
        title="Analytics"
        description={selectedQr ? `Scans for “${selectedQr.name}”.` : 'Scans across all of your QR codes.'}
        actions={<AnalyticsFilters range={range} qrCodeId={qrCodeId} qrOptions={qrOptions} />}
      />

      <StatCards
        items={[
          { label: 'Total scans', value: formatNumber(summary.total), description: `Scans ${RANGE_LABELS[range]}`, icon: ScanLine },
          { label: 'Scans today', value: formatNumber(summary.today), description: 'Since 00:00 UTC', icon: CalendarDays },
          { label: 'Scans this week', value: formatNumber(summary.week), description: 'Last 7 days, UTC', icon: Activity },
          { label: 'Active QR codes', value: formatNumber(activeCount), description: `Scanned at least once ${RANGE_LABELS[range]}`, icon: QrCode },
        ]}
      />

      <ScansChart data={series} />

      <div className="grid gap-6 lg:grid-cols-2">
        <DeviceChart data={devices} />
        <TopCountries data={countries} />
      </div>

      <RecentScans scans={recent} showQrName={!selectedQr} />
    </>
  );
}
