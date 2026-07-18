-- ─────────────────────────────────────
-- iCreate · Admin setup
-- Run this once in the Supabase SQL Editor
-- (Dashboard → SQL Editor → New query → paste → Run)
-- ─────────────────────────────────────

-- 1. Admins table: any account whose login email is listed here
--    gets admin powers on the site.
create table if not exists public.admins (
  email      text primary key,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

-- The site only needs to READ this table (to check "is this user an admin?").
-- Add/remove admins from the Supabase dashboard, not from the site.
drop policy if exists "admins_select" on public.admins;
create policy "admins_select" on public.admins
  for select using (true);

-- 2. Seed the first admin account (change/add emails as needed)
insert into public.admins (email) values ('kyleguintuhonesty@gmail.com')
  on conflict (email) do nothing;

-- 3. Freelancers table policies.
--    Select/insert stay open (matches current site behavior).
--    DELETE is only allowed for logged-in users whose email is in admins —
--    enforced by the database itself, so non-admins can't delete even if
--    they tamper with the page.
alter table public.freelancers enable row level security;

drop policy if exists "freelancers_select" on public.freelancers;
create policy "freelancers_select" on public.freelancers
  for select using (true);

drop policy if exists "freelancers_insert" on public.freelancers;
create policy "freelancers_insert" on public.freelancers
  for insert with check (true);

drop policy if exists "freelancers_delete_admin" on public.freelancers;
create policy "freelancers_delete_admin" on public.freelancers
  for delete using (
    (auth.jwt() ->> 'email') in (select email from public.admins)
  );
