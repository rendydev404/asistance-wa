import { getSupabaseAdmin } from '../lib/supabase';

export type WhatsAppConnectionStatus =
  | 'starting'
  | 'qr'
  | 'connected'
  | 'disconnected'
  | 'error';

export async function updateWhatsAppConnection(input: {
  status: WhatsAppConnectionStatus;
  qr?: string | null;
  phoneNumber?: string | null;
  lastError?: string | null;
}) {
  const { error } = await getSupabaseAdmin()
    .from('whatsapp_connections')
    .upsert({
      id: true,
      status: input.status,
      qr: input.qr ?? null,
      phone_number: input.phoneNumber ?? null,
      last_error: input.lastError ?? null,
      updated_at: new Date().toISOString(),
    });

  if (error) console.error('[BOT] Failed to update WhatsApp connection state:', error.message);
}
