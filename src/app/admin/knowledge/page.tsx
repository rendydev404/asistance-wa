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
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Knowledge Base Manager</h2>
      <p className="text-gray-600">
        Kelola fakta dan informasi yang diketahui oleh AI Anda.
      </p>
      
      <KnowledgeList initialItems={knowledgeItems || []} />
    </div>
  );
}
