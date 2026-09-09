import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const supabaseAdmin = getSupabaseAdmin();
  const { count: kbCount } = await supabaseAdmin
    .from('knowledge_base')
    .select('*', { count: 'exact', head: true });

  const { count: sessionCount } = await supabaseAdmin
    .from('chat_sessions')
    .select('*', { count: 'exact', head: true });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Status AI</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">Active</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Total Fakta di KB</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{kbCount || 0}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Sesi Chat Tersimpan</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{sessionCount || 0}</p>
        </div>
      </div>
    </div>
  );
}
