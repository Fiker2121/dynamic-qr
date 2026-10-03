'use client';

import { memo, useEffect, useMemo, useRef, useState } from 'react';
import type QRCodeStyling from 'qr-code-styling';
import { Skeleton } from '@/components/ui/skeleton';
import { buildQrOptions } from '@/lib/qr/style';
import { cn } from '@/lib/utils';
import type { QRStyleConfig } from '@/types/database';

interface QRCodePreviewProps {
  /** The text to encode. Pass null while it is not known yet (shows a skeleton). */
  data: string | null;
  style: QRStyleConfig;
  /** Draw smaller than style.size (thumbnails). Margins scale proportionally. */
  renderSize?: number;
  className?: string;
  label?: string;
}

/**
 * Renders a qr-code-styling instance into a container. The instance is created once
 * (lazily, because the library needs the DOM) and updated in place when options change.
 */
function QRCodePreviewComponent({ data, style, renderSize, className, label }: QRCodePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<QRCodeStyling | null>(null);
  const [ready, setReady] = useState(false);

  const options = useMemo(
    () => (data ? buildQrOptions(data, style, renderSize) : null),
    [data, style, renderSize],
  );
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const container = containerRef.current;
    let cancelled = false;

    async function create() {
      if (!container || !optionsRef.current) return;
      const { default: QRCodeStylingClass } = await import('qr-code-styling');
      // Strict Mode mounts twice; the guard stops a stale async run from adding a second code.
      if (cancelled || instanceRef.current || !optionsRef.current) return;

      const instance = new QRCodeStylingClass(optionsRef.current);
      container.replaceChildren();
      instance.append(container);
      instanceRef.current = instance;
      setReady(true);
    }

    if (options && !instanceRef.current) void create();

    return () => {
      cancelled = true;
    };
    // `options` only gates creation; later changes are applied by the update effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options !== null]);

  useEffect(() => {
    if (options && instanceRef.current) instanceRef.current.update(options);
  }, [options]);

  useEffect(() => {
    const container = containerRef.current;
    return () => {
      instanceRef.current = null;
      container?.replaceChildren();
    };
  }, []);

  const width = renderSize ?? style.size;

  return (
    <div
      className={cn('relative max-w-full overflow-hidden rounded-lg', className)}
      style={{ width, aspectRatio: '1 / 1' }}
      role="img"
      aria-label={label ?? 'QR code preview'}
    >
      <div ref={containerRef} className="qr-canvas" />
      {!ready && <Skeleton className="absolute inset-0 h-full w-full rounded-lg" />}
    </div>
  );
}

export const QRCodePreview = memo(QRCodePreviewComponent);
