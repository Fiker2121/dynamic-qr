export const UNKNOWN_COUNTRY = 'Unknown';

/** Headers set by common CDNs and proxies, checked in order. */
const COUNTRY_HEADERS = [
  'x-vercel-ip-country',
  'cf-ipcountry',
  'cloudfront-viewer-country',
  'x-appengine-country',
  'fastly-client-country',
  'x-country-code',
  'x-country',
] as const;

// ISO-style placeholders some CDNs send when the country is not known.
const INVALID_CODES = new Set(['XX', 'T1', 'ZZ', 'A1', 'A2']);

export function normalizeCountryCode(value: string | null | undefined): string | null {
  if (!value) return null;
  const code = value.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code) || INVALID_CODES.has(code)) return null;
  return code;
}

/**
 * Reads a coarse, country-level location from CDN/proxy headers. Returns "Unknown" when
 * no header is present (for example on localhost). No external geolocation is used.
 */
export function getCountryFromHeaders(headers: Headers): string {
  for (const name of COUNTRY_HEADERS) {
    const code = normalizeCountryCode(headers.get(name));
    if (code) return code;
  }
  return UNKNOWN_COUNTRY;
}

export function countryName(code: string): string {
  if (code === UNKNOWN_COUNTRY) return 'Unknown';
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) ?? code;
  } catch {
    return code;
  }
}

export function countryFlag(code: string): string {
  if (!/^[A-Z]{2}$/.test(code)) return '🌐';
  return String.fromCodePoint(...[...code].map((char) => 0x1f1e6 + char.charCodeAt(0) - 65));
}
