import type { Options } from 'qr-code-styling';
import type { QRCodeRow, QRStyleConfig, QRStylePayload } from '@/types/database';

export function rowToStyle(row: QRStylePayload): QRStyleConfig {
  return {
    foregroundColor: row.foreground_color,
    backgroundColor: row.background_color,
    dotType: row.dot_type,
    cornerSquareType: row.corner_square_type,
    cornerDotType: row.corner_dot_type,
    logoData: row.logo_data,
    size: row.size,
    margin: row.margin,
    errorCorrection: row.error_correction,
  };
}

export function styleToPayload(style: QRStyleConfig): QRStylePayload {
  return {
    foreground_color: style.foregroundColor,
    background_color: style.backgroundColor,
    dot_type: style.dotType,
    corner_square_type: style.cornerSquareType,
    corner_dot_type: style.cornerDotType,
    logo_data: style.logoData,
    size: style.size,
    margin: style.margin,
    error_correction: style.errorCorrection,
  };
}

export function rowToStylePayload(row: QRCodeRow): QRStylePayload {
  return styleToPayload(rowToStyle(row));
}

/** A logo covers modules, so we always use the highest error correction when one is present. */
export function effectiveErrorCorrection(style: QRStyleConfig): QRStyleConfig['errorCorrection'] {
  return style.logoData ? 'H' : style.errorCorrection;
}

/**
 * Builds qr-code-styling options. `renderSize` draws the code smaller (thumbnails)
 * while keeping the margin proportional to the configured size.
 */
export function buildQrOptions(
  data: string,
  style: QRStyleConfig,
  renderSize?: number,
): Options {
  const size = renderSize ?? style.size;
  const scale = size / style.size;

  return {
    width: size,
    height: size,
    type: 'canvas',
    data,
    margin: Math.round(style.margin * scale),
    image: style.logoData ?? undefined,
    qrOptions: {
      typeNumber: 0,
      errorCorrectionLevel: effectiveErrorCorrection(style),
    },
    imageOptions: {
      hideBackgroundDots: true,
      imageSize: 0.3,
      margin: Math.max(1, Math.round(4 * scale)),
      crossOrigin: 'anonymous',
    },
    dotsOptions: { color: style.foregroundColor, type: style.dotType },
    backgroundOptions: { color: style.backgroundColor },
    cornersSquareOptions: { color: style.foregroundColor, type: style.cornerSquareType },
    cornersDotOptions: { color: style.foregroundColor, type: style.cornerDotType },
  };
}
