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
    <div className="mx-auto max-w-6xl space-y-6">
      <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-300">Gaya bicara</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Persona AI</h1><p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">Atur nada bicara dan aturan jawaban yang dipakai bot di setiap chat.</p></div>
      
      <PersonaForm initialPrompt={data?.value || ''} />
    </div>
  );
}
