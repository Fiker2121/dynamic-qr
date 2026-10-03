import type {
  CornerDotType,
  CornerSquareType,
  DotType,
  ErrorCorrectionLevel,
  QRStyleConfig,
} from '@/types/database';

export const DOT_TYPES: ReadonlyArray<{ value: DotType; label: string }> = [
  { value: 'square', label: 'Square' },
  { value: 'dots', label: 'Dots' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'classy', label: 'Classy' },
  { value: 'classy-rounded', label: 'Classy rounded' },
];

export const CORNER_SQUARE_TYPES: ReadonlyArray<{ value: CornerSquareType; label: string }> = [
  { value: 'square', label: 'Square' },
  { value: 'extra-rounded', label: 'Extra rounded' },
  { value: 'dot', label: 'Circle' },
];

export const CORNER_DOT_TYPES: ReadonlyArray<{ value: CornerDotType; label: string }> = [
  { value: 'square', label: 'Square' },
  { value: 'dot', label: 'Circle' },
];

export const ERROR_CORRECTION_LEVELS: ReadonlyArray<{
  value: ErrorCorrectionLevel;
  label: string;
}> = [
  { value: 'L', label: 'Low (7% recovery)' },
  { value: 'M', label: 'Medium (15% recovery)' },
  { value: 'Q', label: 'Quartile (25% recovery)' },
  { value: 'H', label: 'High (30% recovery)' },
];

export const QR_SIZE_MIN = 128;
export const QR_SIZE_MAX = 1024;
export const QR_MARGIN_MAX = 64;
export const QR_NAME_MAX = 80;

export const DEFAULT_QR_STYLE: QRStyleConfig = {
  foregroundColor: '#111827',
  backgroundColor: '#ffffff',
  dotType: 'rounded',
  cornerSquareType: 'extra-rounded',
  cornerDotType: 'dot',
  logoData: null,
  size: 300,
  margin: 12,
  errorCorrection: 'Q',
};
