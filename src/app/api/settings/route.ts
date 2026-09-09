import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { isAdminAuthorized } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    if (!isAdminAuthorized(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { key, value } = await req.json();

    if (!key || !value) {
      return NextResponse.json({ error: 'Key dan Value wajib diisi' }, { status: 400 });
    }

    const { data, error } = await getSupabaseAdmin()
      .from('app_settings')
      .upsert({ key, value })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('Settings API Error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
