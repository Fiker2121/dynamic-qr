const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export const SHORT_CODE_LENGTH = 8;

/**
 * Generates a URL-safe random short code (62^8 ≈ 2.2e14 combinations) using the
 * Web Crypto API. Rejection sampling avoids modulo bias. Uniqueness is enforced by
 * the database UNIQUE constraint; callers retry on conflict.
 */
export function generateShortCode(length: number = SHORT_CODE_LENGTH): string {
  const limit = 256 - (256 % ALPHABET.length);
  let code = '';

  while (code.length < length) {
    const bytes = new Uint8Array(length * 2);
    globalThis.crypto.getRandomValues(bytes);
    for (const byte of bytes) {
      if (byte < limit) {
        code += ALPHABET[byte % ALPHABET.length];
        if (code.length === length) break;
      }
    }
  }

  return code;
}
