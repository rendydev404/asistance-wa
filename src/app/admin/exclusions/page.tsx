import { getSupabaseAdmin } from '@/lib/supabase';
import ExclusionManager from './ExclusionManager';

export const dynamic = 'force-dynamic';

export default async function ExclusionsPage() {
  const { data } = await getSupabaseAdmin()
    .from('ai_excluded_contacts')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="mx-auto max-w-6xl space-y-6"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-200">Kontrol percakapan</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Nomor yang dilewati AI</h1><p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">Masukkan nomor WhatsApp; pesan dari nomor aktif di daftar ini langsung dibiarkan untuk ditangani admin.</p></div>
      <ExclusionManager initialItems={data ?? []} />
    </div>
  );
}
