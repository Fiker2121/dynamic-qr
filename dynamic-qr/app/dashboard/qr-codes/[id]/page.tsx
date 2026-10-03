import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CalendarDays, Globe2, ScanLine, Smartphone } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/page-header';
import { DeviceChart } from '@/components/analytics/device-chart';
import { RecentScans } from '@/components/analytics/recent-scans';
import { ScansChart } from '@/components/analytics/scans-chart';
import { StatCards } from '@/components/analytics/stat-cards';
import { TopCountries } from '@/components/analytics/top-countries';
import { QrDetailTabs } from '@/components/qr/qr-detail-tabs';
import { QrForm } from '@/components/qr/qr-form';
import { describeTopCountry, describeTopDevice, getOwnedQr, getQrAnalytics } from '@/lib/analytics';
import { createClient } from '@/lib/supabase/server';
import { formatNumber } from '@/lib/utils';

export const metadata: Metadata = { title: 'Edit QR code' };
export const dynamic = 'force-dynamic';

export default async function QrCodeDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  // Ownership is verified before any scan data is queried (RLS enforces it again in the database).
  const qr = await getOwnedQr(supabase, params.id);
  if (!qr) notFound();

  const analytics = await getQrAnalytics(supabase, { range: 'all', qrCodeId: qr.id });
  if (!analytics) notFound();

  const { summary, series, countries, devices, recent } = analytics;

  const analyticsView = (
    <div className="space-y-6">
      <StatCards
        items={[
          { label: 'Total scans', value: formatNumber(summary.total), description: 'All time', icon: ScanLine },
          { label: 'Scans this week', value: formatNumber(summary.week), description: 'Last 7 days, UTC', icon: CalendarDays },
          { label: 'Top country', value: describeTopCountry(countries), description: 'Most scans', icon: Globe2 },
          { label: 'Top device', value: describeTopDevice(devices), description: 'Most scans', icon: Smartphone },
        ]}
      />
      <ScansChart data={series} />
      <div className="grid gap-6 lg:grid-cols-2">
        <DeviceChart data={devices} />
        <TopCountries data={countries} />
      </div>
      <RecentScans scans={recent} showQrName={false} />
    </div>
  );

  return (
    <>
      <PageHeader title={qr.name} description={`Short code ${qr.code}`} />
      <QrDetailTabs
        settings={<QrForm mode="edit" code={qr.code} initial={qr} />}
        analytics={analyticsView}
      />
    </>
  );
}
