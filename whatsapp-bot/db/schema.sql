-- Rode isto no SQL Editor do Supabase (ou psql) uma vez.

create table if not exists couples (
  id           uuid primary key default gen_random_uuid(),
  pairing_code text unique not null,
  created_at   timestamptz default now()
);

create table if not exists users (
  phone       text primary key,           -- número do WhatsApp, ex: 5511999999999
  name        text,
  couple_id   uuid references couples(id),
  state       text default 'new',         -- new | awaiting_name | active
  created_at  timestamptz default now()
);

create table if not exists messages (
  id         bigint generated always as identity primary key,
  phone      text not null references users(phone),
  role       text not null,               -- 'user' | 'assistant'
  content    text not null,
  created_at timestamptz default now()
);

create index if not exists idx_messages_phone_created
  on messages (phone, created_at);

-- Resumo destilado por usuário. É o "contexto interno do parceiro":
-- nunca contém falas cruas, só temas/sentimentos. Base do confidente separado.
create table if not exists summaries (
  phone      text primary key references users(phone),
  summary    text,
  updated_at timestamptz default now()
);
