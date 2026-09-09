import { getSupabaseAdmin } from '@/lib/supabase';
import KnowledgeList from './KnowledgeList';

export const dynamic = 'force-dynamic';

export default async function KnowledgePage() {
  const supabaseAdmin = getSupabaseAdmin();
  const { data: knowledgeItems } = await supabaseAdmin
    .from('knowledge_base')
    .select('id, question, answer, created_at')
    .order('created_at', { ascending: false });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-300">Otak AI</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Knowledge base</h1><p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">Simpan informasi yang boleh dipakai AI saat menjawab chat masuk.</p></div>
      
      <KnowledgeList initialItems={knowledgeItems || []} />
    </div>
  );
}
