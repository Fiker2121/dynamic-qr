'use client';

import { useId, useRef, useState } from 'react';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { processLogoFile } from '@/lib/qr/logo';

interface LogoUploadProps {
  value: string | null;
  onChange: (value: string | null) => void;
  error?: string;
}

export function LogoUpload({ value, onChange, error }: LogoUploadProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setLocalError(null);
    setProcessing(true);
    try {
      onChange(await processLogoFile(file));
    } catch (caught) {
      setLocalError(caught instanceof Error ? caught.message : 'We couldn’t use that image.');
    } finally {
      setProcessing(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  const message = localError ?? error;

  return (
    <div className="space-y-3">
      <Label htmlFor={id}>Center logo</Label>
      <div className="flex items-center gap-4">
        <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl border bg-muted">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="Selected logo preview" className="h-full w-full object-contain" />
          ) : (
            <ImagePlus className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" disabled={processing} onClick={() => inputRef.current?.click()}>
            {processing ? <Loader2 className="animate-spin" /> : <ImagePlus />}
            {value ? 'Replace logo' : 'Upload logo'}
          </Button>
          {value && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
              <Trash2 />
              Remove logo
            </Button>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="sr-only"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />
      <p className="text-xs text-muted-foreground">PNG, JPEG, WebP, or SVG up to 2 MB. The image stays in your browser until you save.</p>
      {message && (
        <p role="alert" className="text-sm text-destructive">
          {message}
        </p>
      )}
    </div>
  );
}
