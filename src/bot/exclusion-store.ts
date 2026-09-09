import { getSupabaseAdmin } from '../lib/supabase';
import { phoneNumberFromJid } from '../lib/phone';

export async function isPhoneExcluded(remoteJid: string): Promise<boolean> {
  const phoneNumber = phoneNumberFromJid(remoteJid);
  if (!phoneNumber) return false;

  try {
    const { data, error } = await getSupabaseAdmin()
      .from('ai_excluded_contacts')
      .select('id')
      .eq('phone_number', phoneNumber)
      .eq('active', true)
      .maybeSingle();

    if (error) throw error;
    return Boolean(data);
  } catch (error) {
    console.error('[BOT] Failed to check excluded WhatsApp number:', error);
    return false;
  }
}
