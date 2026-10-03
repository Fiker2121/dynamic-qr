import { NextResponse } from 'next/server';
import { getAuthedContext, jsonError, readJson } from '@/lib/api';
import { DEFAULT_QR_STYLE } from '@/lib/qr/config';
import { generateShortCode } from '@/lib/qr/generate-code';
import { styleToPayload } from '@/lib/qr/style';
import { createQrSchema, flattenZodErrors } from '@/lib/qr/validators';
import type { QRCodeRow } from '@/types/database';

const MAX_CODE_ATTEMPTS = 5;
const UNIQUE_VIOLATION = '23505';

export async function GET() {
  const context = await getAuthedContext();
  if (!context) return jsonError(401, 'Sign in to continue.');

  const { data, error } = await context.supabase
    .from('qr_codes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[api/qr-codes] list failed', { code: error.code });
    return jsonError(500, 'We couldn’t load your QR codes. Try again.');
  }
  return NextResponse.json(data as QRCodeRow[]);
}

export async function POST(request: Request) {
  const context = await getAuthedContext();
  if (!context) return jsonError(401, 'Sign in to continue.');

  const body = await readJson(request);
  if (body === undefined) return jsonError(400, 'The request body must be valid JSON.');

  const parsed = createQrSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(422, 'Check the highlighted fields.', flattenZodErrors(parsed.error));
  }

  const { code: requestedCode, ...fields } = parsed.data;
  // user_id always comes from the session, never from the request body.
  const record = { ...styleToPayload(DEFAULT_QR_STYLE), ...fields, user_id: context.user.id };

  let code = requestedCode ?? generateShortCode();
  for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt += 1) {
    const { data, error } = await context.supabase
      .from('qr_codes')
      .insert({ ...record, code })
      .select()
      .single();

    if (!error) return NextResponse.json(data as QRCodeRow, { status: 201 });

    if (error.code !== UNIQUE_VIOLATION) {
      console.error('[api/qr-codes] insert failed', { code: error.code });
      return jsonError(500, 'We couldn’t save your QR code. Try again.');
    }
    code = generateShortCode();
  }

  return jsonError(503, 'We couldn’t reserve a unique short code. Try again.');
}
