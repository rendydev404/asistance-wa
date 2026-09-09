import { NextResponse } from 'next/server';
import { isAdminAuthorized } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { normalizePhoneNumber } from '@/lib/phone';

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export async function GET(request: Request) {
  if (!isAdminAuthorized(request)) return unauthorized();

  const { data, error } = await getSupabaseAdmin()
    .from('ai_excluded_contacts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  if (!isAdminAuthorized(request)) return unauthorized();

  try {
    const body = await request.json();
    const phoneNumber = typeof body.phone_number === 'string'
      ? normalizePhoneNumber(body.phone_number)
      : null;

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Nomor WhatsApp Indonesia tidak valid' }, { status: 400 });
    }

    const { data, error } = await getSupabaseAdmin()
      .from('ai_excluded_contacts')
      .upsert({ phone_number: phoneNumber, active: true }, { onConflict: 'phone_number' })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Payload tidak valid' }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  if (!isAdminAuthorized(request)) return unauthorized();

  try {
    const body = await request.json();
    if (typeof body.id !== 'string' || typeof body.active !== 'boolean') {
      return NextResponse.json({ error: 'ID dan status active wajib diisi' }, { status: 400 });
    }

    const { data, error } = await getSupabaseAdmin()
      .from('ai_excluded_contacts')
      .update({ active: body.active })
      .eq('id', body.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Payload tidak valid' }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  if (!isAdminAuthorized(request)) return unauthorized();

  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID wajib diisi' }, { status: 400 });

  const { error } = await getSupabaseAdmin().from('ai_excluded_contacts').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
