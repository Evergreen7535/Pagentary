-- Pagentary initial voting platform schema
create extension if not exists pgcrypto;

create type public.competition_status as enum ('draft', 'live', 'closed');
create type public.payment_status as enum ('pending', 'successful', 'failed', 'cancelled');

create table public.competitions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  logo_url text,
  status public.competition_status not null default 'draft',
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint competition_dates_valid check (ends_at is null or starts_at is null or ends_at > starts_at)
);

create table public.contestants (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions(id) on delete cascade,
  contestant_number text,
  full_name text not null,
  stage_name text,
  biography text,
  photo_path text,
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (competition_id, contestant_number)
);

create table public.voting_settings (
  singleton boolean primary key default true check (singleton),
  currency text not null default 'NGN' check (currency = 'NGN'),
  price_per_vote_kobo bigint not null default 10000 check (price_per_vote_kobo > 0),
  min_votes_per_transaction integer not null default 1 check (min_votes_per_transaction > 0),
  max_votes_per_transaction integer check (max_votes_per_transaction is null or max_votes_per_transaction >= min_votes_per_transaction),
  max_votes_per_voter integer check (max_votes_per_voter is null or max_votes_per_voter > 0),
  public_results_enabled boolean not null default true,
  voting_enabled boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into public.voting_settings (singleton) values (true);

create table public.admin_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  is_super_admin boolean not null default true,
  created_at timestamptz not null default now()
);

create unique index admin_accounts_single_super_admin
  on public.admin_accounts (is_super_admin)
  where is_super_admin;

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  contestant_id uuid not null references public.contestants(id) on delete restrict,
  voter_email text,
  voter_reference text,
  gateway text not null default 'flutterwave' check (gateway = 'flutterwave'),
  gateway_transaction_id text unique,
  tx_ref text not null unique,
  amount_kobo bigint not null check (amount_kobo > 0),
  currency text not null default 'NGN' check (currency = 'NGN'),
  votes_to_credit integer not null check (votes_to_credit > 0),
  status public.payment_status not null default 'pending',
  gateway_payload jsonb,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.votes (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null unique references public.payments(id) on delete restrict,
  contestant_id uuid not null references public.contestants(id) on delete restrict,
  vote_count integer not null check (vote_count > 0),
  created_at timestamptz not null default now()
);

create index contestants_competition_active_order_idx
  on public.contestants (competition_id, is_active, display_order);
create index payments_status_created_idx on public.payments (status, created_at desc);
create index payments_contestant_idx on public.payments (contestant_id);
create index votes_contestant_idx on public.votes (contestant_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger competitions_set_updated_at before update on public.competitions
for each row execute function public.set_updated_at();
create trigger contestants_set_updated_at before update on public.contestants
for each row execute function public.set_updated_at();
create trigger voting_settings_set_updated_at before update on public.voting_settings
for each row execute function public.set_updated_at();
create trigger payments_set_updated_at before update on public.payments
for each row execute function public.set_updated_at();

-- All exposed tables have RLS enabled. Privileged writes will be performed by
-- authenticated server routes after checking the single admin account.
alter table public.competitions enable row level security;
alter table public.contestants enable row level security;
alter table public.voting_settings enable row level security;
alter table public.admin_accounts enable row level security;
alter table public.payments enable row level security;
alter table public.votes enable row level security;

create policy "Public can read live competitions"
on public.competitions for select to anon, authenticated
using (status = 'live');

create policy "Public can read active contestants in live competitions"
on public.contestants for select to anon, authenticated
using (
  is_active = true
  and exists (
    select 1 from public.competitions c
    where c.id = competition_id and c.status = 'live'
  )
);

create policy "Public can read voting display settings"
on public.voting_settings for select to anon, authenticated
using (true);

-- No client-facing policies are granted for admin_accounts, payments, or votes.
-- Do not grant service-role or secret keys to browser code.
