-- Mengaktifkan ekstensi pgvector
create extension if not exists vector;
create extension if not exists pgcrypto;

-- Tabel untuk Knowledge Base
create table if not exists public.knowledge_base (
  id uuid default gen_random_uuid() primary key,
  question text,
  answer text not null,
  -- Dibiarkan nullable untuk kompatibilitas data lama. Retrieval baru memakai FTS.
  embedding vector(768),
  search_vector tsvector generated always as (
    to_tsvector('simple', coalesce(question, '') || ' ' || answer)
  ) stored,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.knowledge_base add column if not exists search_vector tsvector
  generated always as (to_tsvector('simple', coalesce(question, '') || ' ' || answer)) stored;

create index if not exists knowledge_base_search_vector_idx
  on public.knowledge_base using gin(search_vector);

-- Tabel untuk Manajemen State / Sesi Chat
create table if not exists public.chat_sessions (
  phone_number text primary key,
  status text not null default 'waiting', -- 'human', 'waiting', 'ai_active'
  pending_message_id text,
  last_message_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint chat_sessions_status_check check (status in ('human', 'waiting', 'ai_active'))
);

alter table public.chat_sessions add column if not exists pending_message_id text;

create table if not exists public.chat_messages (
  id uuid default gen_random_uuid() primary key,
  message_id text not null unique,
  phone_number text not null,
  direction text not null check (direction in ('inbound', 'outbound')),
  text text not null,
  status text not null default 'received',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists chat_messages_phone_created_idx
  on public.chat_messages(phone_number, created_at desc);

-- Tabel untuk Pengaturan (seperti Prompt Persona)
create table if not exists public.app_settings (
  key text primary key,
  value text not null
);

-- Status koneksi WhatsApp dan QR sementara untuk Admin Dashboard.
create table if not exists public.whatsapp_connections (
  id boolean primary key default true check (id = true),
  status text not null default 'starting'
    check (status in ('starting', 'qr', 'connected', 'disconnected', 'error')),
  qr text,
  phone_number text,
  last_error text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

insert into public.whatsapp_connections (id, status)
values (true, 'starting')
on conflict (id) do nothing;

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

-- Retrieval tanpa provider embedding eksternal. Cocok untuk Groq-only deployment.
create or replace function search_knowledge (
  query_text text,
  match_count int default 3
)
returns table (
  id uuid,
  question text,
  answer text,
  relevance real
)
language sql stable
as $$
  select
    knowledge_base.id,
    knowledge_base.question,
    knowledge_base.answer,
    ts_rank_cd(knowledge_base.search_vector, plainto_tsquery('simple', query_text)) as relevance
  from public.knowledge_base
  where knowledge_base.search_vector @@ plainto_tsquery('simple', query_text)
  order by relevance desc, knowledge_base.created_at desc
  limit greatest(match_count, 1);
$$;

alter table public.knowledge_base enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;
alter table public.app_settings enable row level security;
alter table public.whatsapp_connections enable row level security;

-- Aturan agar pesan tertentu tidak dijawab oleh AI.
create table if not exists public.ai_exclusions (
  id uuid default gen_random_uuid() primary key,
  phrase text not null check (char_length(trim(phrase)) between 1 and 200),
  match_type text not null default 'contains'
    check (match_type in ('contains', 'exact', 'starts_with')),
  action text not null default 'silent'
    check (action in ('silent', 'human')),
  active boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists ai_exclusions_active_idx
  on public.ai_exclusions(active);

alter table public.ai_exclusions enable row level security;

-- Daftar nomor WhatsApp yang selalu dikecualikan dari balasan AI.
create table if not exists public.ai_excluded_contacts (
  id uuid default gen_random_uuid() primary key,
  phone_number text not null unique check (phone_number ~ '^62[0-9]{8,13}$'),
  active boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists ai_excluded_contacts_active_phone_idx
  on public.ai_excluded_contacts(phone_number, active);

alter table public.ai_excluded_contacts enable row level security;
