import type { DeviceType } from '@/types/database';

export interface ParsedUserAgent {
  deviceType: DeviceType;
  browser: string | null;
  operatingSystem: string | null;
}

const MAX_UA_LENGTH = 512;

/** Lightweight, dependency-free User-Agent parser. Never throws. */
export function parseUserAgent(raw: string | null | undefined): ParsedUserAgent {
  const ua = typeof raw === 'string' ? raw.slice(0, MAX_UA_LENGTH) : '';
  if (!ua.trim()) return { deviceType: 'unknown', browser: null, operatingSystem: null };

  return {
    deviceType: detectDeviceType(ua),
    browser: detectBrowser(ua),
    operatingSystem: detectOperatingSystem(ua),
  };
}

function detectDeviceType(ua: string): DeviceType {
  if (/bot|crawl|spider|curl|wget|python-requests|headless/i.test(ua)) return 'unknown';
  if (/ipad|tablet|playbook|silk|kindle/i.test(ua)) return 'tablet';
  if (/android/i.test(ua)) return /mobile/i.test(ua) ? 'mobile' : 'tablet';
  if (/iphone|ipod|windows phone|blackberry|opera mini|iemobile|mobile/i.test(ua)) return 'mobile';
  if (/windows nt|macintosh|mac os x|x11|linux|cros/i.test(ua)) return 'desktop';
  return 'unknown';
}

function detectBrowser(ua: string): string | null {
  if (/edg(e|a|ios)?\//i.test(ua)) return 'Edge';
  if (/opr\/|opera/i.test(ua)) return 'Opera';
  if (/samsungbrowser/i.test(ua)) return 'Samsung Internet';
  if (/firefox\/|fxios/i.test(ua)) return 'Firefox';
  if (/chrome\/|crios/i.test(ua)) return 'Chrome';
  if (/safari\//i.test(ua)) return 'Safari';
  return null;
}

function detectOperatingSystem(ua: string): string | null {
  if (/iphone|ipad|ipod/i.test(ua)) return 'iOS';
  if (/android/i.test(ua)) return 'Android';
  if (/windows/i.test(ua)) return 'Windows';
  if (/macintosh|mac os x/i.test(ua)) return 'macOS';
  if (/cros/i.test(ua)) return 'ChromeOS';
  if (/linux|x11/i.test(ua)) return 'Linux';
  return null;
}
