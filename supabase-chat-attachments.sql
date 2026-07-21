-- ─────────────────────────────────────
-- iCreate · Chat attachments
-- Run once in the Supabase SQL Editor.
-- Adds columns so chat messages can carry a file or photo
-- (stored inline as a data URL). Without this, messages with
-- attachments fail to sync online and only persist locally.
-- ─────────────────────────────────────

alter table public.chat_messages
  add column if not exists attachment_url text,
  add column if not exists attachment_type text,
  add column if not exists attachment_name text;
