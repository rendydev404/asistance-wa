import { getSupabaseAdmin } from '../lib/supabase';

type Direction = 'inbound' | 'outbound';

export class SessionStore {
  async recordMessage(input: {
    messageId: string;
    phoneNumber: string;
    text: string;
    direction: Direction;
  }) {
    const supabase = getSupabaseAdmin();
    const { error: messageError } = await supabase.from('chat_messages').upsert(
      {
        message_id: input.messageId,
        phone_number: input.phoneNumber,
        text: input.text,
        direction: input.direction,
        status: input.direction === 'inbound' ? 'received' : 'sent',
      },
      { onConflict: 'message_id', ignoreDuplicates: true },
    );

    if (messageError) throw messageError;
  }

  async startWaiting(phoneNumber: string, messageId: string) {
    const { error } = await getSupabaseAdmin().from('chat_sessions').upsert(
      {
        phone_number: phoneNumber,
        status: 'waiting',
        pending_message_id: messageId,
        last_message_at: new Date().toISOString(),
      },
      { onConflict: 'phone_number' },
    );

    if (error) throw error;
  }

  async markHuman(phoneNumber: string) {
    const { error } = await getSupabaseAdmin().from('chat_sessions').upsert(
      {
        phone_number: phoneNumber,
        status: 'human',
        pending_message_id: null,
        last_message_at: new Date().toISOString(),
      },
      { onConflict: 'phone_number' },
    );

    if (error) throw error;
  }

  async claimForAI(phoneNumber: string, messageId: string): Promise<boolean> {
    const { data, error } = await getSupabaseAdmin()
      .from('chat_sessions')
      .update({ status: 'ai_active' })
      .eq('phone_number', phoneNumber)
      .eq('status', 'waiting')
      .eq('pending_message_id', messageId)
      .select('phone_number');

    if (error) throw error;
    return Boolean(data?.length);
  }

  async isStillActive(phoneNumber: string, messageId: string): Promise<boolean> {
    const { data, error } = await getSupabaseAdmin()
      .from('chat_sessions')
      .select('phone_number')
      .eq('phone_number', phoneNumber)
      .eq('status', 'ai_active')
      .eq('pending_message_id', messageId)
      .limit(1);

    if (error) throw error;
    return Boolean(data?.length);
  }
}
