import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ApiErrorBody } from '@/types/database';

export function jsonError(status: number, message: string, fieldErrors?: Record<string, string>) {
  const body: ApiErrorBody = fieldErrors ? { error: message, fieldErrors } : { error: message };
  return NextResponse.json(body, { status });
}

/** Resolves the authenticated user from the session cookie, or null if signed out. */
export async function getAuthedContext() {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  return { supabase, user };
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}
