import { NextResponse } from 'next/server';
import { getAuthedContext, jsonError, readJson } from '@/lib/api';
import { flattenZodErrors, updateQrSchema, uuidSchema } from '@/lib/qr/validators';
import type { QRCodeRow } from '@/types/database';

interface RouteContext {
  params: { id: string };
}

function invalidId() {
  return jsonError(404, 'QR code not found.');
}

export async function GET(_request: Request, { params }: RouteContext) {
  const context = await getAuthedContext();
  if (!context) return jsonError(401, 'Sign in to continue.');
  if (!uuidSchema.safeParse(params.id).success) return invalidId();

  // RLS restricts this query to the caller's own rows.
  const { data, error } = await context.supabase
    .from('qr_codes')
    .select('*')
    .eq('id', params.id)
    .maybeSingle();

  if (error) {
    console.error('[api/qr-codes/:id] read failed', { code: error.code });
    return jsonError(500, 'We couldn’t load this QR code. Try again.');
  }
  if (!data) return invalidId();
  return NextResponse.json(data as QRCodeRow);
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const context = await getAuthedContext();
  if (!context) return jsonError(401, 'Sign in to continue.');
  if (!uuidSchema.safeParse(params.id).success) return invalidId();

  const body = await readJson(request);
  if (body === undefined) return jsonError(400, 'The request body must be valid JSON.');

  const parsed = updateQrSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(422, 'Check the highlighted fields.', flattenZodErrors(parsed.error));
  }

  // The short code, owner, and id are not editable, so printed QR codes keep working.
  const { data, error } = await context.supabase
    .from('qr_codes')
    .update(parsed.data)
    .eq('id', params.id)
    .select()
    .maybeSingle();

  if (error) {
    console.error('[api/qr-codes/:id] update failed', { code: error.code });
    return jsonError(500, 'We couldn’t save your changes. Try again.');
  }
  if (!data) return invalidId();
  return NextResponse.json(data as QRCodeRow);
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const context = await getAuthedContext();
  if (!context) return jsonError(401, 'Sign in to continue.');
  if (!uuidSchema.safeParse(params.id).success) return invalidId();

  const { data, error } = await context.supabase
    .from('qr_codes')
    .delete()
    .eq('id', params.id)
    .select('id');

  if (error) {
    console.error('[api/qr-codes/:id] delete failed', { code: error.code });
    return jsonError(500, 'We couldn’t delete this QR code. Try again.');
  }
  if (!data || data.length === 0) return invalidId();
  return new NextResponse(null, { status: 204 });
}
