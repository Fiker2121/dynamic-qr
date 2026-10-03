import { z } from 'zod';
import { QR_MARGIN_MAX, QR_NAME_MAX, QR_SIZE_MAX, QR_SIZE_MIN } from '@/lib/qr/config';

export const MAX_DESTINATION_LENGTH = 2048;
export const MAX_LOGO_DATA_LENGTH = 300_000;
export const MAX_LOGO_FILE_BYTES = 2 * 1024 * 1024;
export const ACCEPTED_LOGO_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];

export type UrlValidationResult = { ok: true; url: string } | { ok: false; error: string };

/**
 * Validates a destination URL with the URL constructor. Only http(s) is accepted, which
 * rejects javascript:, data:, file:, ftp: and every other scheme.
 */
export function validateDestinationUrl(input: string): UrlValidationResult {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, error: 'Enter a destination URL.' };
  if (trimmed.length > MAX_DESTINATION_LENGTH) {
    return { ok: false, error: `URLs can be up to ${MAX_DESTINATION_LENGTH} characters.` };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { ok: false, error: 'Enter a valid URL that starts with https:// or http://.' };
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { ok: false, error: 'Only http:// and https:// links are allowed.' };
  }
  if (!parsed.hostname) return { ok: false, error: 'The URL needs a host name.' };
  if (parsed.username || parsed.password) {
    return { ok: false, error: 'URLs with embedded usernames or passwords are not allowed.' };
  }

  return { ok: true, url: parsed.toString() };
}

export function validateLogoFile(file: {
  type: string;
  size: number;
}): { ok: true } | { ok: false; error: string } {
  if (!ACCEPTED_LOGO_TYPES.includes(file.type)) {
    return { ok: false, error: 'Upload a PNG, JPEG, WebP, or SVG image.' };
  }
  if (file.size > MAX_LOGO_FILE_BYTES) {
    return { ok: false, error: 'Logos can be up to 2 MB.' };
  }
  return { ok: true };
}

export const emailSchema = z
  .string({ required_error: 'Enter your email address.' })
  .trim()
  .toLowerCase()
  .min(1, 'Enter your email address.')
  .max(254, 'Email addresses can be up to 254 characters.')
  .email('Enter a valid email address.');

export const passwordSchema = z
  .string({ required_error: 'Enter a password.' })
  .min(8, 'Use at least 8 characters.')
  .max(72, 'Use 72 characters or fewer.');

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Enter your password.').max(72),
});

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

const hexColor = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, 'Use a 6-digit hex color such as #1a2b3c.');

export const shortCodeSchema = z
  .string()
  .regex(/^[A-Za-z0-9]{6,12}$/, 'Short codes use 6 to 12 letters and numbers.');

export const nameSchema = z
  .string({ required_error: 'Give your QR code a name.' })
  .trim()
  .min(1, 'Give your QR code a name.')
  .max(QR_NAME_MAX, `Names can be up to ${QR_NAME_MAX} characters.`);

export const destinationSchema = z
  .string({ required_error: 'Enter a destination URL.' })
  .transform((value, ctx) => {
    const result = validateDestinationUrl(value);
    if (!result.ok) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: result.error });
      return z.NEVER;
    }
    return result.url;
  });

const logoDataSchema = z
  .string()
  .max(MAX_LOGO_DATA_LENGTH, 'The logo is too large. Try a smaller image.')
  .regex(
    /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/,
    'The logo must be a PNG, JPEG, or WebP image.',
  )
  .nullable();

const styleSchema = z.object({
  foreground_color: hexColor,
  background_color: hexColor,
  dot_type: z.enum(['square', 'dots', 'rounded', 'classy', 'classy-rounded']),
  corner_square_type: z.enum(['square', 'dot', 'extra-rounded']),
  corner_dot_type: z.enum(['square', 'dot']),
  logo_data: logoDataSchema,
  size: z.number().int().min(QR_SIZE_MIN).max(QR_SIZE_MAX),
  margin: z.number().int().min(0).max(QR_MARGIN_MAX),
  error_correction: z.enum(['L', 'M', 'Q', 'H']),
});

export const createQrSchema = z
  .object({
    name: nameSchema,
    destination_url: destinationSchema,
    code: shortCodeSchema.optional(),
  })
  .merge(styleSchema.partial());

export const updateQrSchema = z
  .object({
    name: nameSchema.optional(),
    destination_url: destinationSchema.optional(),
  })
  .merge(styleSchema.partial())
  .refine((value) => Object.keys(value).length > 0, { message: 'Nothing to update.' });

/** Returns the first message per field so forms can render inline errors. */
export function flattenZodErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? String(issue.path[0]) : 'form';
    if (!(key in result)) result[key] = issue.message;
  }
  return result;
}

export const uuidSchema = z.string().uuid();
