/**
 * Public base URL used inside QR codes. Prefers NEXT_PUBLIC_APP_URL; in the browser it
 * falls back to the current origin. Never hardcodes localhost.
 */
export function getPublicBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) return configured.replace(/\/+$/, '');
  if (typeof window !== 'undefined') return window.location.origin;
  return '';
}

export function buildPublicUrl(code: string, baseUrl: string = getPublicBaseUrl()): string {
  return `${baseUrl}/r/${code}`;
}
