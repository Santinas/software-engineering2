-- ─────────────────────────────────────
-- iCreate · Commissions update
-- (payment step removed + notification bell)
-- Run this once in the Supabase SQL Editor
-- (Dashboard → SQL Editor → New query → paste → Run)
-- ─────────────────────────────────────

-- 1. Store the freelancer's email with each booking so the notification
--    bell can reliably find "commissions booked for me".
alter table public.commissions
  add column if not exists freelancer_email text;

-- Make sure there's a timestamp for sorting/unread detection
alter table public.commissions
  add column if not exists created_at timestamptz not null default now();

-- Accept/Decline workflow + payment proof
alter table public.commissions
  add column if not exists status text not null default 'pending';
alter table public.commissions
  add column if not exists status_at timestamptz;
alter table public.commissions
  add column if not exists payment_ref text;
alter table public.commissions
  add column if not exists payment_screenshot text;
alter table public.commissions
  add column if not exists payment_at timestamptz;

-- 2. The payment step was removed from the site, so the GCash columns
--    must not block inserts. (Wrapped so this succeeds even if the
--    columns don't exist or were never NOT NULL.)
do $$ begin
  alter table public.commissions alter column gcash_ref drop not null;
exception when others then null; end $$;

do $$ begin
  alter table public.commissions alter column screenshot_url drop not null;
exception when others then null; end $$;

-- 3. Policies: the site inserts bookings and the notification bell reads them.
alter table public.commissions enable row level security;

drop policy if exists "commissions_select" on public.commissions;
create policy "commissions_select" on public.commissions
  for select using (true);

drop policy if exists "commissions_insert" on public.commissions;
create policy "commissions_insert" on public.commissions
  for insert with check (true);

-- Freelancers accept/decline and clients attach payment proof
drop policy if exists "commissions_update" on public.commissions;
create policy "commissions_update" on public.commissions
  for update using (true) with check (true);
