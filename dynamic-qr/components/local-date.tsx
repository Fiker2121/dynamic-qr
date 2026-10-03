'use client';

import { useEffect, useState } from 'react';

interface LocalDateProps {
  iso: string;
  withTime?: boolean;
  className?: string;
}

/**
 * Timestamps are stored in UTC. The server renders the UTC value and the browser swaps in
 * the viewer's locale and time zone after hydration, which avoids hydration mismatches.
 */
export function LocalDate({ iso, withTime = false, className }: LocalDateProps) {
  const [label, setLabel] = useState(() => (withTime ? `${iso.slice(0, 16).replace('T', ' ')} UTC` : iso.slice(0, 10)));

  useEffect(() => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return;
    setLabel(
      withTime
        ? date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
        : date.toLocaleDateString(undefined, { dateStyle: 'medium' }),
    );
  }, [iso, withTime]);

  return (
    <time dateTime={iso} className={className} suppressHydrationWarning>
      {label}
    </time>
  );
}
