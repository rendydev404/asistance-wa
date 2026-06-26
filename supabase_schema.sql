-- Mengaktifkan ekstensi pgvector
create extension if not exists vector;

-- Tabel untuk Knowledge Base
create table if not exists public.knowledge_base (
  id uuid default gen_random_uuid() primary key,
  question text,
  answer text not null,
  embedding vector(768), -- Gemini text-embedding-004 menghasilkan 768 dimensi
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabel untuk Manajemen State / Sesi Chat
create table if not exists public.chat_sessions (
  phone_number text primary key,
  status text not null default 'waiting', -- 'human', 'waiting', 'ai_active'
  last_message_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabel untuk Pengaturan (seperti Prompt Persona)
create table if not exists public.app_settings (
  key text primary key,
  value text not null
);

-- Insert default prompt
insert into public.app_settings (key, value) values (
  'system_prompt', 
  'Kamu adalah asisten pribadi. Balaslah dengan gaya kasual, seperti menggunakan kata aku/kamu. 
Berikut adalah fakta relevan dari Knowledge Base:
{context}

Aturan:
1. Jawab pertanyaan berdasarkan fakta di atas.
2. Jika fakta di atas tidak ada hubungannya atau kamu tidak tahu jawabannya, jujurlah katakan tidak tahu atau lupa dengan gaya kasualmu. Jangan mengarang informasi.'
) on conflict (key) do nothing;

-- Fungsi untuk pencarian vektor (Vector Search) di Supabase
create or replace function match_knowledge (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  question text,
  answer text,
  similarity float
)
language sql stable
as $$
  select
    knowledge_base.id,
    knowledge_base.question,
    knowledge_base.answer,
    1 - (knowledge_base.embedding <=> query_embedding) as similarity
  from knowledge_base
  where 1 - (knowledge_base.embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
$$;
