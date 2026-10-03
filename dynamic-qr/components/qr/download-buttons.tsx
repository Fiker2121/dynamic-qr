'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { downloadQrCode, type DownloadFormat } from '@/lib/qr/download';
import type { QRStyleConfig } from '@/types/database';

interface DownloadButtonsProps {
  data: string | null;
  style: QRStyleConfig;
  fileName: string;
  disabled?: boolean;
}

export function DownloadButtons({ data, style, fileName, disabled }: DownloadButtonsProps) {
  const [pending, setPending] = useState<DownloadFormat | null>(null);

  async function handleDownload(format: DownloadFormat) {
    if (!data) return;
    setPending(format);
    try {
      await downloadQrCode({ data, style, format, fileName });
      toast.success(`${format.toUpperCase()} download started`);
    } catch (error) {
      console.error('QR download failed', error);
      toast.error(
        format === 'svg'
          ? 'We couldn’t create the SVG. Try PNG, or remove the logo and try again.'
          : 'We couldn’t create the PNG. Try again.',
      );
    } finally {
      setPending(null);
    }
  }

  const isDisabled = disabled || !data || pending !== null;

  return (
    <div className="flex flex-wrap gap-2">
      {(['png', 'svg'] as const).map((format) => (
        <Button
          key={format}
          type="button"
          variant="outline"
          size="sm"
          disabled={isDisabled}
          onClick={() => handleDownload(format)}
        >
          {pending === format ? <Loader2 className="animate-spin" /> : <Download />}
          Download {format.toUpperCase()}
        </Button>
      ))}
    </div>
  );
}
