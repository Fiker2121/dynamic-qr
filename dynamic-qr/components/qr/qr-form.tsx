'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DownloadButtons } from '@/components/qr/download-buttons';
import { QRCodePreview } from '@/components/qr/qr-code-preview';
import { QrCustomizer } from '@/components/qr/qr-customizer';
import { usePublicBaseUrl } from '@/components/qr/use-public-url';
import { DEFAULT_QR_STYLE } from '@/lib/qr/config';
import { buildPublicUrl } from '@/lib/qr/public-url';
import { rowToStyle, styleToPayload } from '@/lib/qr/style';
import { createQrSchema, flattenZodErrors, updateQrSchema } from '@/lib/qr/validators';
import { slugify } from '@/lib/utils';
import type { ApiErrorBody, QRCodeRow, QRStyleConfig } from '@/types/database';

interface QrFormProps {
  mode: 'create' | 'edit';
  /** Short code shown in the preview. For new QR codes it is reserved by the server page. */
  code: string;
  initial?: QRCodeRow;
}

export function QrForm({ mode, code, initial }: QrFormProps) {
  const router = useRouter();
  const baseUrl = usePublicBaseUrl();
  const [name, setName] = useState(initial?.name ?? '');
  const [destination, setDestination] = useState(initial?.destination_url ?? '');
  const [style, setStyle] = useState<QRStyleConfig>(initial ? rowToStyle(initial) : DEFAULT_QR_STYLE);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const publicUrl = baseUrl ? buildPublicUrl(code, baseUrl) : null;
  const isEdit = mode === 'edit';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});

    const payload = {
      name,
      destination_url: destination,
      ...styleToPayload(style),
      ...(isEdit ? {} : { code }),
    };

    const parsed = (isEdit ? updateQrSchema : createQrSchema).safeParse(payload);
    if (!parsed.success) {
      setErrors(flattenZodErrors(parsed.error));
      toast.error('Fix the highlighted fields and try again.');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(isEdit && initial ? `/api/qr-codes/${initial.id}` : '/api/qr-codes', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = (await response.json().catch(() => null)) as QRCodeRow | ApiErrorBody | null;

      if (!response.ok || !body) {
        const failure = body as ApiErrorBody | null;
        setErrors(failure?.fieldErrors ?? {});
        toast.error(failure?.error ?? 'We couldn’t save your QR code. Try again.');
        return;
      }

      const saved = body as QRCodeRow;
      toast.success(isEdit ? 'QR code updated' : 'QR code created');
      if (isEdit) {
        router.refresh();
      } else {
        router.push(`/dashboard/qr-codes/${saved.id}`);
        router.refresh();
      }
    } catch {
      toast.error('We couldn’t reach the server. Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  }

  async function copyLink() {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      toast.success('Link copied');
    } catch {
      toast.error('Copy failed. Select the link and copy it manually.');
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
            <CardDescription>
              {isEdit
                ? 'Change the destination any time. The printed QR code keeps working and scans go to the new URL.'
                : 'Name your code and choose where scans should go. You can change the destination later.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="qr-name">Name</Label>
              <Input id="qr-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Spring menu" maxLength={80}
                aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'qr-name-error' : undefined} />
              {errors.name && <p id="qr-name-error" className="text-sm text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="qr-destination">Destination URL</Label>
              <Input id="qr-destination" type="url" inputMode="url" value={destination} onChange={(e) => setDestination(e.target.value)}
                placeholder="https://example.com/menu" autoComplete="off"
                aria-invalid={Boolean(errors.destination_url)} aria-describedby={errors.destination_url ? 'qr-destination-error' : undefined} />
              {errors.destination_url && <p id="qr-destination-error" className="text-sm text-destructive">{errors.destination_url}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Design</CardTitle>
            <CardDescription>Style changes appear in the preview right away.</CardDescription>
          </CardHeader>
          <CardContent>
            <QrCustomizer style={style} onChange={setStyle} errors={errors} />
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" size="lg" disabled={saving}>
            {saving && <Loader2 className="animate-spin" />}
            {isEdit ? 'Save changes' : 'Create QR code'}
          </Button>
          {errors.form && <p role="alert" className="text-sm text-destructive">{errors.form}</p>}
        </div>
      </div>

      <aside className="lg:sticky lg:top-6 lg:self-start">
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>The code encodes your short link, not the destination.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center rounded-xl border bg-muted/30 p-4">
              <QRCodePreview data={publicUrl} style={style} label="Live QR code preview" />
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Short link</p>
              <div className="flex items-center gap-2">
                <code className="min-w-0 flex-1 truncate rounded-md bg-muted px-2 py-1.5 font-mono text-xs">
                  {publicUrl ?? '…'}
                </code>
                <Button type="button" variant="outline" size="icon" onClick={copyLink} disabled={!publicUrl} aria-label="Copy short link">
                  <Copy />
                </Button>
                {isEdit && publicUrl && (
                  <Button asChild variant="outline" size="icon">
                    <a href={publicUrl} target="_blank" rel="noopener noreferrer" aria-label="Open short link in a new tab">
                      <ExternalLink />
                    </a>
                  </Button>
                )}
              </div>
            </div>
            {isEdit ? (
              <DownloadButtons data={publicUrl} style={style} fileName={`${slugify(name || 'qr-code')}-${code}`} />
            ) : (
              <p className="text-xs text-muted-foreground">Create the QR code to enable PNG and SVG downloads.</p>
            )}
          </CardContent>
        </Card>
      </aside>
    </form>
  );
}
