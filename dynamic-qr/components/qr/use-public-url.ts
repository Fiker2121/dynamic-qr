'use client';

import { useEffect, useState } from 'react';

/**
 * Public base URL for QR links. Starts from NEXT_PUBLIC_APP_URL (identical on server and
 * client) and falls back to the browser origin after mount, so SSR output never mismatches.
 */
export function usePublicBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/+$/, '') ?? '';
  const [baseUrl, setBaseUrl] = useState(configured);

  useEffect(() => {
    if (!configured) setBaseUrl(window.location.origin);
  }, [configured]);

  return baseUrl;
}
