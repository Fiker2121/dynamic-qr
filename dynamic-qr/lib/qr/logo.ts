import { validateLogoFile } from '@/lib/qr/validators';

const LOGO_MAX_DIMENSION = 256;

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('We couldn’t read that file.'));
    };
    reader.onerror = () => reject(new Error('We couldn’t read that file.'));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('That file isn’t a valid image.'));
    image.src = src;
  });
}

/**
 * Validates a logo file and converts it to a small PNG data URL. Re-encoding through a
 * canvas keeps the stored logo small and strips active content from SVG uploads.
 * The image never leaves the browser until the QR code is saved.
 */
export async function processLogoFile(file: File): Promise<string> {
  const validation = validateLogoFile(file);
  if (!validation.ok) throw new Error(validation.error);

  const source = await readAsDataUrl(file);
  const image = await loadImage(source);

  const naturalWidth = image.naturalWidth || LOGO_MAX_DIMENSION;
  const naturalHeight = image.naturalHeight || LOGO_MAX_DIMENSION;
  const scale = Math.min(1, LOGO_MAX_DIMENSION / Math.max(naturalWidth, naturalHeight));
  const width = Math.max(1, Math.round(naturalWidth * scale));
  const height = Math.max(1, Math.round(naturalHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Your browser can’t process images.');
  context.drawImage(image, 0, 0, width, height);

  return canvas.toDataURL('image/png');
}
