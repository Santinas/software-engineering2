-- ─────────────────────────────────────
-- iCreate · Live Chat — Supabase setup
-- Run this once in the Supabase SQL Editor
-- (Dashboard → SQL Editor → New query → paste → Run)
-- ─────────────────────────────────────

create table if not exists public.chat_messages (
  id bigint generated always as identity primary key,
  conversation_id text not null,
  sender_email    text not null,
  sender_name     text not null,
  recipient_email text not null,
  recipient_name  text,
  content         text not null,
  created_at      timestamptz not null default now()
);

create index if not exists chat_messages_conversation_idx
  on public.chat_messages (conversation_id, created_at);

-- Row Level Security (open policies to match the rest of the app,
-- which uses the anon key without per-user auth on tables)
alter table public.chat_messages enable row level security;

drop policy if exists "chat_messages_select" on public.chat_messages;
create policy "chat_messages_select" on public.chat_messages
  for select using (true);

drop policy if exists "chat_messages_insert" on public.chat_messages;
create policy "chat_messages_insert" on public.chat_messages
  for insert with check (true);

-- Enable realtime broadcasts for new messages
alter publication supabase_realtime add table public.chat_messages;
