'use client';

import { useId, useMemo, useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ColorField } from '@/components/qr/color-field';
import { QRCodePreview } from '@/components/qr/qr-code-preview';
import { DEFAULT_QR_STYLE, DOT_TYPES } from '@/lib/qr/config';
import { downloadQrCode } from '@/lib/qr/download';
import { validateDestinationUrl } from '@/lib/qr/validators';
import type { DotType, QRStyleConfig } from '@/types/database';

const INITIAL_URL = 'https://example.com';

export function LiveDemo() {
  const id = useId();
  const [url, setUrl] = useState(INITIAL_URL);
  const [foreground, setForeground] = useState('#4338ca');
  const [background, setBackground] = useState('#ffffff');
  const [dotType, setDotType] = useState<DotType>('rounded');
  const [downloading, setDownloading] = useState(false);
  const [lastValid, setLastValid] = useState(INITIAL_URL);

  const validation = useMemo(() => validateDestinationUrl(url), [url]);
  const data = validation.ok ? validation.url : lastValid;

  const style = useMemo<QRStyleConfig>(
    () => ({ ...DEFAULT_QR_STYLE, foregroundColor: foreground, backgroundColor: background, dotType }),
    [foreground, background, dotType],
  );

  function handleUrlChange(value: string) {
    setUrl(value);
    const result = validateDestinationUrl(value);
    if (result.ok) setLastValid(result.url);
  }

  async function handleDownload() {
    setDownloading(true);
    try {
      await downloadQrCode({ data, style, format: 'png', fileName: 'dynamic-qr-demo' });
      toast.success('PNG download started');
    } catch {
      toast.error('We couldn’t create the PNG. Try again.');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <section id="demo" className="border-y bg-card/30">
      <div className="container grid items-center gap-10 py-16 sm:py-24 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Try the generator</h2>
            <p className="text-muted-foreground">
              This demo encodes your URL directly and saves nothing. Saved QR codes encode a short link instead, which is what lets you change the destination later.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${id}-url`}>URL</Label>
            <Input id={`${id}-url`} type="url" inputMode="url" value={url} onChange={(e) => handleUrlChange(e.target.value)} autoComplete="off"
              aria-invalid={!validation.ok} aria-describedby={!validation.ok ? `${id}-url-error` : undefined} />
            {!validation.ok && <p id={`${id}-url-error`} className="text-sm text-destructive">{validation.error}</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <ColorField label="Foreground" value={foreground} onChange={setForeground} />
            <ColorField label="Background" value={background} onChange={setBackground} />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${id}-dots`}>Dot style</Label>
            <Select value={dotType} onValueChange={(v) => setDotType(v as DotType)}>
              <SelectTrigger id={`${id}-dots`} className="sm:max-w-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {DOT_TYPES.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-5 rounded-3xl border bg-card p-6">
          <QRCodePreview data={data} style={style} renderSize={280} label="Live demo QR code" />
          <Button onClick={handleDownload} disabled={downloading || !validation.ok} className="w-full">
            {downloading ? <Loader2 className="animate-spin" /> : <Download />}
            Download PNG
          </Button>
        </div>
      </div>
    </section>
  );
}
