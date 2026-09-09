import { NextResponse } from 'next/server';
import { isAdminAuthorized } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await getSupabaseAdmin()
    .from('whatsapp_connections')
    .select('status, qr, phone_number, last_error, updated_at')
    .eq('id', true)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? {
    status: 'starting',
    qr: null,
    phone_number: null,
    last_error: null,
    updated_at: null,
  });
}
