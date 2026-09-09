import { getSupabaseAdmin } from '@/lib/supabase';
import PersonaForm from './PersonaForm';

export const dynamic = 'force-dynamic';

export default async function PersonaPage() {
  const supabaseAdmin = getSupabaseAdmin();
  const { data } = await supabaseAdmin
    .from('app_settings')
    .select('value')
    .eq('key', 'system_prompt')
    .single();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Persona & Settings</h2>
      <p className="text-gray-600">
        Atur bagaimana AI Anda merespons pesan (System Prompt).
      </p>
      
      <PersonaForm initialPrompt={data?.value || ''} />
    </div>
  );
}
