import { NextResponse } from 'next/server';
import { isAdminAuthorized } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';

const matchTypes = ['contains', 'exact', 'starts_with'] as const;
const actions = ['silent', 'human'] as const;

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export async function GET(request: Request) {
  if (!isAdminAuthorized(request)) return unauthorized();

  const { data, error } = await getSupabaseAdmin()
    .from('ai_exclusions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  if (!isAdminAuthorized(request)) return unauthorized();

  try {
    const body = await request.json();
    const phrase = typeof body.phrase === 'string' ? body.phrase.trim() : '';
    const matchType = body.match_type ?? 'contains';
    const action = body.action ?? 'silent';

    if (!phrase || phrase.length > 200) {
      return NextResponse.json({ error: 'Kata/frasa wajib diisi dan maksimal 200 karakter' }, { status: 400 });
    }
    if (!matchTypes.includes(matchType)) {
      return NextResponse.json({ error: 'Tipe pencocokan tidak valid' }, { status: 400 });
    }
    if (!actions.includes(action)) {
      return NextResponse.json({ error: 'Aksi pengecualian tidak valid' }, { status: 400 });
    }

    const { data, error } = await getSupabaseAdmin()
      .from('ai_exclusions')
      .insert({ phrase, match_type: matchType, action, active: true })
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
      .from('ai_exclusions')
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

  const { error } = await getSupabaseAdmin().from('ai_exclusions').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
