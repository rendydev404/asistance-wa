import { getSupabaseAdmin } from '../lib/supabase';

export type AIExclusion = {
  id: string;
  phrase: string;
  match_type: 'contains' | 'exact' | 'starts_with';
  action: 'silent' | 'human';
  active: boolean;
};

function normalize(value: string) {
  return value.trim().toLocaleLowerCase('id-ID');
}

export async function findMatchingExclusion(message: string): Promise<AIExclusion | null> {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('ai_exclusions')
      .select('id, phrase, match_type, action, active')
      .eq('active', true)
      .order('created_at', { ascending: true });

    if (error) throw error;

    const normalizedMessage = normalize(message);
    return (data as AIExclusion[]).find((rule) => {
      const phrase = normalize(rule.phrase);
      if (rule.match_type === 'exact') return normalizedMessage === phrase;
      if (rule.match_type === 'starts_with') return normalizedMessage.startsWith(phrase);
      return normalizedMessage.includes(phrase);
    }) ?? null;
  } catch (error) {
    console.error('[BOT] Failed to load AI exclusions:', error);
    return null;
  }
}
