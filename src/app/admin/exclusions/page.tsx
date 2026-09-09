import { getSupabaseAdmin } from '@/lib/supabase';
import ExclusionManager from './ExclusionManager';

export const dynamic = 'force-dynamic';

export default async function ExclusionsPage() {
  const { data } = await getSupabaseAdmin()
    .from('ai_exclusions')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Pengecualian AI</h2>
        <p className="text-gray-500 mt-1">Atur topik atau kata yang tidak boleh dijawab otomatis oleh AI.</p>
      </div>
      <ExclusionManager initialItems={data ?? []} />
    </div>
  );
}
