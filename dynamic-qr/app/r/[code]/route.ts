import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { shortCodeSchema, validateDestinationUrl } from '@/lib/qr/validators';
import { parseUserAgent } from '@/lib/qr/device';
import { getCountryFromHeaders } from '@/lib/qr/location';
import { renderRedirectErrorPage } from '@/lib/qr/error-page';
import type { ScanInsert } from '@/types/database';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Upper bound on how long a scan may wait for the analytics insert. Serverless platforms can
// freeze a function once the response is sent, so an un-awaited insert is not guaranteed to
// finish. We await it briefly, and never let it fail or delay the redirect for long.
const SCAN_LOG_TIMEOUT_MS = 1500;

type AdminClient = ReturnType<typeof createAdminClient>;

async function recordScan(admin: AdminClient, scan: ScanInsert): Promise<void> {
  try {
    const { error } = await admin.from('scans').insert(scan);
    if (error) console.error('[redirect] scan insert failed', { code: error.code });
  } catch (error) {
    console.error('[redirect] scan insert threw', error instanceof Error ? error.message : error);
  }
}

async function recordScanWithTimeout(admin: AdminClient, scan: ScanInsert): Promise<void> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<void>((resolve) => {
    timer = setTimeout(resolve, SCAN_LOG_TIMEOUT_MS);
  });
  await Promise.race([recordScan(admin, scan), timeout]);
  if (timer) clearTimeout(timer);
}

function referrerOrigin(request: NextRequest): string | null {
  const raw = request.headers.get('referer');
  if (!raw) return null;
  try {
    // Only the origin is kept; paths and query strings can contain personal data.
    return new URL(raw).origin.slice(0, 255);
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest, { params }: { params: { code: string } }) {
  const parsedCode = shortCodeSchema.safeParse(params.code);
  if (!parsedCode.success) {
    return renderRedirectErrorPage(404, 'QR code not found', 'This link doesn’t match any QR code.');
  }

  let admin: AdminClient;
  try {
    admin = createAdminClient();
  } catch (error) {
    console.error('[redirect] admin client unavailable', error instanceof Error ? error.message : error);
    return renderRedirectErrorPage(500, 'Something went wrong', 'Please try scanning again in a moment.');
  }

  const { data, error } = await admin
    .from('qr_codes')
    .select('id, destination_url')
    .eq('code', parsedCode.data)
    .maybeSingle();

  if (error) {
    console.error('[redirect] lookup failed', { code: error.code });
    return renderRedirectErrorPage(503, 'Temporarily unavailable', 'Please try scanning again in a moment.');
  }

  if (!data) {
    return renderRedirectErrorPage(404, 'QR code not found', 'This QR code doesn’t exist or was deleted.');
  }

  // Re-validate the stored destination right before redirecting.
  const destination = validateDestinationUrl(String(data.destination_url));
  if (!destination.ok) {
    console.error('[redirect] stored destination failed validation', { qrCodeId: data.id });
    return renderRedirectErrorPage(404, 'QR code not found', 'This QR code has no valid destination.');
  }

  const userAgent = parseUserAgent(request.headers.get('user-agent'));
  await recordScanWithTimeout(admin, {
    qr_code_id: String(data.id),
    country: getCountryFromHeaders(request.headers),
    device_type: userAgent.deviceType,
    browser: userAgent.browser,
    operating_system: userAgent.operatingSystem,
    referrer: referrerOrigin(request),
  });

  const response = NextResponse.redirect(destination.url, 302);
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  return response;
}
