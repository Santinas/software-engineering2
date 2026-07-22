-- ─────────────────────────────────────
-- iCreate · Server-enforced security policies
-- Run once in the Supabase SQL Editor.
-- Closes the loopholes left by client-side checks:
-- the database itself now refuses forged writes,
-- and private data is only readable by the people involved.
--
-- NOTE: after this runs, users MUST be logged in to
-- book commissions, chat, or create freelancer profiles.
-- ─────────────────────────────────────

-- Helper expression used everywhere below:
--   lower(coalesce(auth.jwt() ->> 'email', ''))
-- is the verified email of the logged-in user ('' for guests).

-- ── 1. FREELANCER PROFILES ──
-- Anyone may browse the marketplace, but only a logged-in iAcademy
-- student may create a profile, and only under their own email.
alter table public.freelancers enable row level security;

drop policy if exists "freelancers_insert" on public.freelancers;
drop policy if exists "freelancers_insert_students" on public.freelancers;
create policy "freelancers_insert_students" on public.freelancers
  for insert with check (
    lower(coalesce(auth.jwt() ->> 'email', '')) = lower(email)
    and lower(coalesce(auth.jwt() ->> 'email', '')) like '%@iacademy.edu.ph'
  );

-- A student may edit their OWN profile (matched by their verified email).
-- Without this policy, RLS silently blocks every update to freelancers:
-- the row is invisible to the UPDATE, so it changes nothing and returns no
-- error — which is why edits on the Edit Profile page never took effect.
drop policy if exists "freelancers_update" on public.freelancers;
drop policy if exists "freelancers_update_own" on public.freelancers;
create policy "freelancers_update_own" on public.freelancers
  for update using (
    lower(coalesce(auth.jwt() ->> 'email', '')) = lower(email)
  ) with check (
    lower(coalesce(auth.jwt() ->> 'email', '')) = lower(email)
  );

-- ── 2. CHAT ──
-- Messages are private: only the two participants (or an admin) can read
-- a conversation, and you can only send messages as yourself.
alter table public.chat_messages enable row level security;

drop policy if exists "chat_messages_select" on public.chat_messages;
drop policy if exists "chat_messages_select_participants" on public.chat_messages;
create policy "chat_messages_select_participants" on public.chat_messages
  for select using (
    lower(coalesce(auth.jwt() ->> 'email', '')) in (lower(sender_email), lower(recipient_email))
    or (auth.jwt() ->> 'email') in (select email from public.admins)
  );

drop policy if exists "chat_messages_insert" on public.chat_messages;
drop policy if exists "chat_messages_insert_own" on public.chat_messages;
create policy "chat_messages_insert_own" on public.chat_messages
  for insert with check (
    lower(coalesce(auth.jwt() ->> 'email', '')) = lower(sender_email)
  );

-- ── 3. COMMISSIONS ──
-- A booking (including its payment screenshot) is visible only to the
-- client who made it, the freelancer who received it, and admins.
-- Only the logged-in client can create it; only the two involved
-- parties can update it (accept/decline, payment proof).
alter table public.commissions enable row level security;

drop policy if exists "commissions_select" on public.commissions;
drop policy if exists "commissions_select_participants" on public.commissions;
create policy "commissions_select_participants" on public.commissions
  for select using (
    lower(coalesce(auth.jwt() ->> 'email', '')) in (lower(client_email), lower(coalesce(freelancer_email, '')))
    or (auth.jwt() ->> 'email') in (select email from public.admins)
  );

drop policy if exists "commissions_insert" on public.commissions;
drop policy if exists "commissions_insert_own" on public.commissions;
create policy "commissions_insert_own" on public.commissions
  for insert with check (
    lower(coalesce(auth.jwt() ->> 'email', '')) = lower(client_email)
  );

drop policy if exists "commissions_update" on public.commissions;
drop policy if exists "commissions_update_participants" on public.commissions;
create policy "commissions_update_participants" on public.commissions
  for update using (
    lower(coalesce(auth.jwt() ->> 'email', '')) in (lower(client_email), lower(coalesce(freelancer_email, '')))
  ) with check (
    lower(coalesce(auth.jwt() ->> 'email', '')) in (lower(client_email), lower(coalesce(freelancer_email, '')))
  );
