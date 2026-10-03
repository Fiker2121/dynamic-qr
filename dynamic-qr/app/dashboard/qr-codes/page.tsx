import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/page-header';
import { QrList } from '@/components/qr/qr-list';
import { Button } from '@/components/ui/button';
import { getQrScanCounts } from '@/lib/analytics';
import { createClient } from '@/lib/supabase/server';
import type { QRCodeRow } from '@/types/database';

export const metadata: Metadata = { title: 'QR Codes' };
export const dynamic = 'force-dynamic';

export default async function QrCodesPage() {
  const supabase = createClient();
  const [{ data, error }, counts] = await Promise.all([
    supabase.from('qr_codes').select('*').order('created_at', { ascending: false }),
    getQrScanCounts(supabase),
  ]);

  if (error) {
    console.error('[qr-codes] list failed', { code: error.code });
    throw new Error('Failed to load QR codes');
  }

  const items = ((data ?? []) as QRCodeRow[]).map((qr) => ({ qr, scans: counts.get(qr.id) ?? 0 }));

  return (
    <>
      <PageHeader
        title="QR Codes"
        description="Every code you’ve created, with its scan count."
        actions={<Button asChild><Link href="/dashboard/qr-codes/new"><Plus />New QR code</Link></Button>}
      />
      <QrList items={items} />
    </>
  );
}
