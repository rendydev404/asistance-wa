import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { key, value } = await req.json();

    if (!key || !value) {
      return NextResponse.json({ error: 'Key dan Value wajib diisi' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('app_settings')
      .upsert({ key, value })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Settings API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
