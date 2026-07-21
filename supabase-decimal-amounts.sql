-- ─────────────────────────────────────
-- iCreate · Allow decimal amounts
-- Run once in the Supabase SQL Editor.
-- Lets the starting rate and commission budget store
-- values with centavos (e.g. 2500.50) instead of whole
-- numbers only. Without this, decimal amounts fail to
-- save to the database and only persist locally.
-- ─────────────────────────────────────

-- Freelancer starting rate
alter table public.freelancers
  alter column rate type numeric(12,2) using rate::numeric;

-- Commission budget
alter table public.commissions
  alter column budget type numeric(12,2) using budget::numeric;
