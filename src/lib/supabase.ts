import { createClient, type SupabaseClient } from '@supabase/supabase-js';

type KnowledgeBaseRow = {
  id: string;
  question: string | null;
  answer: string;
  embedding: number[] | null;
  created_at: string;
  search_vector: string | null;
};

export type Database = {
  public: {
    Tables: {
      knowledge_base: {
        Row: KnowledgeBaseRow;
        Insert: Partial<KnowledgeBaseRow> & Pick<KnowledgeBaseRow, 'answer'>;
        Update: Partial<KnowledgeBaseRow>;
        Relationships: [];
      };
      chat_sessions: {
        Row: {
          phone_number: string;
          status: 'human' | 'waiting' | 'ai_active';
          pending_message_id: string | null;
          last_message_at: string;
          created_at: string;
        };
        Insert: {
          phone_number: string;
          status?: 'human' | 'waiting' | 'ai_active';
          pending_message_id?: string | null;
          last_message_at?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['chat_sessions']['Insert']>;
        Relationships: [];
      };
      chat_messages: {
        Row: {
          id: string;
          message_id: string;
          phone_number: string;
          direction: 'inbound' | 'outbound';
          text: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          message_id: string;
          phone_number: string;
          direction: 'inbound' | 'outbound';
          text: string;
          status?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['chat_messages']['Insert']>;
        Relationships: [];
      };
      app_settings: {
        Row: { key: string; value: string };
        Insert: { key: string; value: string };
        Update: Partial<{ key: string; value: string }>;
        Relationships: [];
      };
      whatsapp_connections: {
        Row: {
          id: boolean;
          status: 'starting' | 'qr' | 'connected' | 'disconnected' | 'error';
          qr: string | null;
          phone_number: string | null;
          last_error: string | null;
          updated_at: string;
        };
        Insert: {
          id?: boolean;
          status?: 'starting' | 'qr' | 'connected' | 'disconnected' | 'error';
          qr?: string | null;
          phone_number?: string | null;
          last_error?: string | null;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['whatsapp_connections']['Insert']>;
        Relationships: [];
      };
      ai_exclusions: {
        Row: {
          id: string;
          phrase: string;
          match_type: 'contains' | 'exact' | 'starts_with';
          action: 'silent' | 'human';
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          phrase: string;
          match_type?: 'contains' | 'exact' | 'starts_with';
          action?: 'silent' | 'human';
          active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['ai_exclusions']['Insert']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      search_knowledge: {
        Args: { query_text: string; match_count?: number };
        Returns: Array<{ id: string; question: string | null; answer: string; relevance: number }>;
      };
    };
  };
};

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

let publicClient: SupabaseClient<Database> | undefined;
let adminClient: SupabaseClient<Database> | undefined;

export function getSupabasePublic() {
  if (!publicClient) {
    publicClient = createClient<Database>(
      requiredEnv('NEXT_PUBLIC_SUPABASE_URL'),
      requiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    );
  }
  return publicClient;
}

// Server-only client. Never expose this client or its key to browser code.
export function getSupabaseAdmin() {
  if (!adminClient) {
    adminClient = createClient<Database>(
      requiredEnv('NEXT_PUBLIC_SUPABASE_URL'),
      requiredEnv('SUPABASE_SERVICE_ROLE_KEY'),
    );
  }
  return adminClient;
}
