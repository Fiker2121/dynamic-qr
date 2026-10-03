export type DotType = 'square' | 'dots' | 'rounded' | 'classy' | 'classy-rounded';
export type CornerSquareType = 'square' | 'dot' | 'extra-rounded';
export type CornerDotType = 'square' | 'dot';
export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';
export type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'unknown';
export type DateRange = '7' | '30' | '90' | 'all';

/** Visual configuration of a QR code (camelCase, used by UI and qr-code-styling). */
export interface QRStyleConfig {
  foregroundColor: string;
  backgroundColor: string;
  dotType: DotType;
  cornerSquareType: CornerSquareType;
  cornerDotType: CornerDotType;
  logoData: string | null;
  size: number;
  margin: number;
  errorCorrection: ErrorCorrectionLevel;
}

/** Style fields as stored in the database and sent over the API (snake_case). */
export interface QRStylePayload {
  foreground_color: string;
  background_color: string;
  dot_type: DotType;
  corner_square_type: CornerSquareType;
  corner_dot_type: CornerDotType;
  logo_data: string | null;
  size: number;
  margin: number;
  error_correction: ErrorCorrectionLevel;
}

export interface QRCodeRow extends QRStylePayload {
  id: string;
  user_id: string;
  code: string;
  name: string;
  destination_url: string;
  created_at: string;
  updated_at: string;
}

export interface ScanRow {
  id: string;
  qr_code_id: string;
  scanned_at: string;
  country: string;
  device_type: DeviceType;
  browser: string | null;
  operating_system: string | null;
  referrer: string | null;
}

export interface ScanInsert {
  qr_code_id: string;
  country: string;
  device_type: DeviceType;
  browser: string | null;
  operating_system: string | null;
  referrer: string | null;
}

export interface RecentScan extends ScanRow {
  qr_codes: { name: string; code: string } | null;
}

export interface TimeSeriesPoint {
  /** UTC calendar day, formatted YYYY-MM-DD. */
  date: string;
  scans: number;
}

export interface CountryStat {
  country: string;
  scans: number;
  percentage: number;
}

export interface DeviceStat {
  device: DeviceType;
  scans: number;
  percentage: number;
}

export interface ScanSummary {
  total: number;
  today: number;
  week: number;
}

export interface QrAnalytics {
  summary: ScanSummary;
  series: TimeSeriesPoint[];
  countries: CountryStat[];
  devices: DeviceStat[];
  recent: RecentScan[];
}

export interface ApiErrorBody {
  error: string;
  fieldErrors?: Record<string, string>;
}
