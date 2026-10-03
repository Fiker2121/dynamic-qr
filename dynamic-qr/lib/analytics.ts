import type { SupabaseClient } from '@supabase/supabase-js';
import { countryName } from '@/lib/qr/location';
import { uuidSchema } from '@/lib/qr/validators';
import type {
  CountryStat,
  DateRange,
  DeviceStat,
  DeviceType,
  QRCodeRow,
  QrAnalytics,
  RecentScan,
  ScanSummary,
  TimeSeriesPoint,
} from '@/types/database';

/**
 * Server-side analytics queries. Always call these with the user-scoped Supabase client:
 * Row Level Security then guarantees only the caller's own scans are ever counted.
 * Aggregation boundaries are UTC calendar days.
 */

export const DEVICE_TYPES: DeviceType[] = ['mobile', 'tablet', 'desktop', 'unknown'];

interface ScopeOptions {
  range?: DateRange;
  qrCodeId?: string | null;
}

class AnalyticsError extends Error {
  constructor(operation: string, cause: string) {
    super(`Analytics query failed (${operation}): ${cause}`);
    this.name = 'AnalyticsError';
  }
}

export function parseRange(value: string | undefined): DateRange {
  return value === '7' || value === '30' || value === '90' || value === 'all' ? value : '30';
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function daysAgo(days: number, now: Date = new Date()): Date {
  const start = startOfUtcDay(now);
  start.setUTCDate(start.getUTCDate() - days);
  return start;
}

/** First instant of the range (UTC), or null for "all time". */
export function rangeStart(range: DateRange, now: Date = new Date()): Date | null {
  if (range === 'all') return null;
  return daysAgo(Number(range) - 1, now);
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Returns the QR code only if it exists and belongs to the signed-in user. */
export async function getOwnedQr(supabase: SupabaseClient, id: string): Promise<QRCodeRow | null> {
  if (!uuidSchema.safeParse(id).success) return null;
  const { data, error } = await supabase.from('qr_codes').select('*').eq('id', id).maybeSingle();
  if (error) throw new AnalyticsError('getOwnedQr', error.message);
  return (data as QRCodeRow | null) ?? null;
}

async function countScans(
  supabase: SupabaseClient,
  { from, qrCodeId }: { from: Date | null; qrCodeId?: string | null },
): Promise<number> {
  let query = supabase.from('scans').select('id', { count: 'exact', head: true });
  if (from) query = query.gte('scanned_at', from.toISOString());
  if (qrCodeId) query = query.eq('qr_code_id', qrCodeId);
  const { count, error } = await query;
  if (error) throw new AnalyticsError('countScans', error.message);
  return count ?? 0;
}

export async function getTotalScans(
  supabase: SupabaseClient,
  { range = 'all', qrCodeId }: ScopeOptions = {},
): Promise<number> {
  return countScans(supabase, { from: rangeStart(range), qrCodeId });
}

export async function getScanSummary(
  supabase: SupabaseClient,
  { range = 'all', qrCodeId }: ScopeOptions = {},
): Promise<ScanSummary> {
  const [total, today, week] = await Promise.all([
    countScans(supabase, { from: rangeStart(range), qrCodeId }),
    countScans(supabase, { from: daysAgo(0), qrCodeId }),
    countScans(supabase, { from: daysAgo(6), qrCodeId }),
  ]);
  return { total, today, week };
}

export async function getScansOverTime(
  supabase: SupabaseClient,
  { range = '30', qrCodeId }: ScopeOptions = {},
): Promise<TimeSeriesPoint[]> {
  const from = rangeStart(range);
  const { data, error } = await supabase.rpc('analytics_scans_over_time', {
    p_from: from ? from.toISOString() : null,
    p_qr_code_id: qrCodeId ?? null,
  });
  if (error) throw new AnalyticsError('getScansOverTime', error.message);

  const counts = new Map<string, number>();
  for (const row of (data ?? []) as Array<{ day: string; scans: number | string }>) {
    counts.set(row.day, Number(row.scans));
  }

  // "All time" starts at the first day that has data; fixed ranges start at their boundary.
  let start = from;
  if (!start) {
    const firstDay = [...counts.keys()].sort()[0];
    if (!firstDay) return [];
    start = new Date(`${firstDay}T00:00:00.000Z`);
  }

  const points: TimeSeriesPoint[] = [];
  const end = startOfUtcDay(new Date());
  for (const cursor = new Date(start); cursor <= end; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
    const key = toDateKey(cursor);
    points.push({ date: key, scans: counts.get(key) ?? 0 });
  }
  return points;
}

export async function getTopCountries(
  supabase: SupabaseClient,
  { range = '30', qrCodeId, limit = 8 }: ScopeOptions & { limit?: number } = {},
): Promise<CountryStat[]> {
  const from = rangeStart(range);
  const [{ data, error }, total] = await Promise.all([
    supabase.rpc('analytics_top_countries', {
      p_from: from ? from.toISOString() : null,
      p_qr_code_id: qrCodeId ?? null,
      p_limit: limit,
    }),
    countScans(supabase, { from, qrCodeId }),
  ]);
  if (error) throw new AnalyticsError('getTopCountries', error.message);

  return ((data ?? []) as Array<{ country: string; scans: number | string }>).map((row) => ({
    country: row.country,
    scans: Number(row.scans),
    percentage: total > 0 ? (Number(row.scans) / total) * 100 : 0,
  }));
}

export async function getDeviceDistribution(
  supabase: SupabaseClient,
  { range = '30', qrCodeId }: ScopeOptions = {},
): Promise<DeviceStat[]> {
  const from = rangeStart(range);
  const { data, error } = await supabase.rpc('analytics_device_distribution', {
    p_from: from ? from.toISOString() : null,
    p_qr_code_id: qrCodeId ?? null,
  });
  if (error) throw new AnalyticsError('getDeviceDistribution', error.message);

  const counts = new Map<DeviceType, number>();
  for (const row of (data ?? []) as Array<{ device_type: DeviceType; scans: number | string }>) {
    counts.set(row.device_type, Number(row.scans));
  }
  const total = [...counts.values()].reduce((sum, value) => sum + value, 0);

  return DEVICE_TYPES.map((device) => {
    const scans = counts.get(device) ?? 0;
    return { device, scans, percentage: total > 0 ? (scans / total) * 100 : 0 };
  });
}

export async function getRecentScans(
  supabase: SupabaseClient,
  { qrCodeId, limit = 10 }: { qrCodeId?: string | null; limit?: number } = {},
): Promise<RecentScan[]> {
  let query = supabase
    .from('scans')
    .select('*, qr_codes(name, code)')
    .order('scanned_at', { ascending: false })
    .limit(limit);
  if (qrCodeId) query = query.eq('qr_code_id', qrCodeId);
  const { data, error } = await query;
  if (error) throw new AnalyticsError('getRecentScans', error.message);
  return (data ?? []) as unknown as RecentScan[];
}

export async function getActiveQrCount(
  supabase: SupabaseClient,
  { range = '30' }: { range?: DateRange } = {},
): Promise<number> {
  const from = rangeStart(range);
  const { data, error } = await supabase.rpc('analytics_active_qr_count', {
    p_from: from ? from.toISOString() : null,
  });
  if (error) throw new AnalyticsError('getActiveQrCount', error.message);
  return Number(data ?? 0);
}

export async function getQrScanCounts(supabase: SupabaseClient): Promise<Map<string, number>> {
  const { data, error } = await supabase.rpc('analytics_qr_scan_counts');
  if (error) throw new AnalyticsError('getQrScanCounts', error.message);
  const counts = new Map<string, number>();
  for (const row of (data ?? []) as Array<{ qr_code_id: string; scans: number | string }>) {
    counts.set(row.qr_code_id, Number(row.scans));
  }
  return counts;
}

export async function getTotalQrCodes(supabase: SupabaseClient): Promise<number> {
  const { count, error } = await supabase
    .from('qr_codes')
    .select('id', { count: 'exact', head: true });
  if (error) throw new AnalyticsError('getTotalQrCodes', error.message);
  return count ?? 0;
}

/**
 * Everything the analytics views need for one scope. For a single QR code, ownership is
 * verified first so a foreign id yields `null` instead of data.
 */
export async function getQrAnalytics(
  supabase: SupabaseClient,
  { range = '30', qrCodeId }: ScopeOptions = {},
): Promise<QrAnalytics | null> {
  if (qrCodeId) {
    const owned = await getOwnedQr(supabase, qrCodeId);
    if (!owned) return null;
  }

  const [summary, series, countries, devices, recent] = await Promise.all([
    getScanSummary(supabase, { range, qrCodeId }),
    getScansOverTime(supabase, { range, qrCodeId }),
    getTopCountries(supabase, { range, qrCodeId }),
    getDeviceDistribution(supabase, { range, qrCodeId }),
    getRecentScans(supabase, { qrCodeId }),
  ]);

  return { summary, series, countries, devices, recent };
}

export function describeTopCountry(countries: CountryStat[]): string {
  const top = countries[0];
  return top ? countryName(top.country) : '—';
}

export function describeTopDevice(devices: DeviceStat[]): string {
  const top = [...devices].sort((a, b) => b.scans - a.scans)[0];
  if (!top || top.scans === 0) return '—';
  return top.device.charAt(0).toUpperCase() + top.device.slice(1);
}
