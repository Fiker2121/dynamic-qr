import type { Metadata } from 'next';
import Link from 'next/link';
import { BarChart3, CalendarDays, Plus, QrCode, ScanLine } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/page-header';
import { RecentScans } from '@/components/analytics/recent-scans';
import { ScansChart } from '@/components/analytics/scans-chart';
import { StatCards } from '@/components/analytics/stat-cards';
import { EmptyState } from '@/components/empty-state';
import { LocalDate } from '@/components/local-date';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getQrScanCounts, getRecentScans, getScanSummary, getScansOverTime, getTotalQrCodes } from '@/lib/analytics';
import { createClient } from '@/lib/supabase/server';
import { formatNumber } from '@/lib/utils';
import type { QRCodeRow } from '@/types/database';

export const metadata: Metadata = { title: 'Overview' };
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [totalQr, summary, series, recentScans, counts, recentQrResult] = await Promise.all([
    getTotalQrCodes(supabase),
    getScanSummary(supabase, { range: 'all' }),
    getScansOverTime(supabase, { range: '7' }),
    getRecentScans(supabase, { limit: 8 }),
    getQrScanCounts(supabase),
    supabase.from('qr_codes').select('*').order('created_at', { ascending: false }).limit(5),
  ]);
  const recentQr = (recentQrResult.data ?? []) as QRCodeRow[];
  const greetingName = user?.email?.split('@')[0] ?? 'there';

  if (totalQr === 0) {
    return (
      <>
        <PageHeader title={`Welcome, ${greetingName}`} description="Create your first dynamic QR code to start tracking scans." />
        <EmptyState
          icon={QrCode}
          title="You don’t have any QR codes yet"
          description="Add a destination URL, style your code, and download it. You can change the destination later without reprinting."
          action={<Button asChild size="lg"><Link href="/dashboard/qr-codes/new"><Plus />Create your first QR code</Link></Button>}
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={`Welcome back, ${greetingName}`}
        description="Here’s how your QR codes are doing."
        actions={<Button asChild><Link href="/dashboard/qr-codes/new"><Plus />Quick create</Link></Button>}
      />

      <StatCards
        items={[
          { label: 'QR codes', value: formatNumber(totalQr), description: 'Created so far', icon: QrCode },
          { label: 'Total scans', value: formatNumber(summary.total), description: 'All time', icon: ScanLine },
          { label: 'Scans today', value: formatNumber(summary.today), description: 'Since 00:00 UTC', icon: CalendarDays },
          { label: 'Scans this week', value: formatNumber(summary.week), description: 'Last 7 days, UTC', icon: BarChart3 },
        ]}
      />

      <ScansChart data={series} description="Scans per day over the last 7 days. Days are in UTC." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent QR codes</CardTitle>
            <CardDescription>Your newest codes.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {recentQr.map((qr) => (
                <li key={qr.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <Link href={`/dashboard/qr-codes/${qr.id}`} className="block truncate font-medium hover:underline">{qr.name}</Link>
                    <p className="text-xs text-muted-foreground">
                      <Badge variant="secondary" className="mr-2 font-mono">{qr.code}</Badge>
                      <LocalDate iso={qr.created_at} />
                    </p>
                  </div>
                  <span className="shrink-0 text-sm tabular-nums text-muted-foreground">{formatNumber(counts.get(qr.id) ?? 0)} scans</span>
                </li>
              ))}
            </ul>
            <Button asChild variant="ghost" size="sm" className="mt-4"><Link href="/dashboard/qr-codes">View all QR codes</Link></Button>
          </CardContent>
        </Card>
        <RecentScans scans={recentScans} />
      </div>
    </>
  );
}
