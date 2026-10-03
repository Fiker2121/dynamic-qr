import { buildQrOptions } from '@/lib/qr/style';
import type { QRStyleConfig } from '@/types/database';

export type DownloadFormat = 'png' | 'svg';

interface DownloadOptions {
  data: string;
  style: QRStyleConfig;
  format: DownloadFormat;
  fileName: string;
}

/**
 * Renders the QR code at its configured size in an off-screen instance and downloads it.
 * Runs in the browser only; the library is loaded lazily because it touches the DOM.
 */
export async function downloadQrCode({
  data,
  style,
  format,
  fileName,
}: DownloadOptions): Promise<void> {
  const { default: QRCodeStyling } = await import('qr-code-styling');
  const options = buildQrOptions(data, style);
  const qr = new QRCodeStyling({ ...options, type: format === 'svg' ? 'svg' : 'canvas' });
  await qr.download({ name: fileName, extension: format });
}
