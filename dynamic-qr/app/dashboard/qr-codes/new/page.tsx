import type { Metadata } from 'next';
import { PageHeader } from '@/components/dashboard/page-header';
import { QrForm } from '@/components/qr/qr-form';
import { generateShortCode } from '@/lib/qr/generate-code';

export const metadata: Metadata = { title: 'New QR code' };
export const dynamic = 'force-dynamic';

export default function NewQrCodePage() {
  // The code is generated per request so the preview matches the code that gets saved.
  // The API re-generates it if it collides with an existing one.
  const code = generateShortCode();

  return (
    <>
      <PageHeader title="New QR code" description="The QR code encodes a short link. You can change its destination at any time." />
      <QrForm mode="create" code={code} />
    </>
  );
}
