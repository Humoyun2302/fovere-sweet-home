-- =============================================================
-- Fovere Sweet Home — Supabase Schema
-- =============================================================
-- Run this file in your Supabase project: SQL Editor → New query → paste → Run.
-- Idempotent: safe to re-run; uses IF NOT EXISTS / OR REPLACE everywhere.
-- =============================================================

create extension if not exists "pgcrypto";

-- ---------- profiles (mirror of auth.users + role) ----------
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  role       text not null default 'user' check (role in ('admin','user')),
  created_at timestamptz not null default now()
);

-- Auto-create a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper used by RLS policies.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------- leads (form submissions / CRM rows) ----------
create table if not exists public.leads (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  phone             text not null,
  wants_renovation  boolean not null default false,
  budget            numeric,
  service_type      text check (service_type is null or service_type in ('design', 'realization')),
  project_type      text check (project_type is null or project_type in ('residential', 'commercial', 'architectural')),
  area_sqm          numeric check (area_sqm is null or area_sqm > 0),
  property_address  text,
  status            text not null default 'new'
                    check (status in ('new','contacted','meeting','met','won','lost')),
  note              text,
  created_at        timestamptz not null default now(),
  next_call         timestamptz not null default (now() + interval '4 days')
);

create index if not exists leads_status_idx     on public.leads(status);
create index if not exists leads_created_at_idx on public.leads(created_at desc);

-- ---------- Row Level Security ----------
alter table public.profiles enable row level security;
alter table public.leads    enable row level security;

-- PROFILES: a user can read their own row; admins can read all.
drop policy if exists "users read own profile"  on public.profiles;
drop policy if exists "admins read all profiles" on public.profiles;

create policy "users read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "admins read all profiles"
  on public.profiles for select
  using (public.is_admin());

-- LEADS:
--   * anyone (incl. anonymous) may INSERT (landing form)
--   * only admins can SELECT / UPDATE / DELETE
drop policy if exists "anyone insert leads"  on public.leads;
drop policy if exists "admins select leads"  on public.leads;
drop policy if exists "admins update leads"  on public.leads;
drop policy if exists "admins delete leads"  on public.leads;

create policy "anyone insert leads"
  on public.leads for insert
  with check (true);

create policy "admins select leads"
  on public.leads for select
  using (public.is_admin());

create policy "admins update leads"
  on public.leads for update
  using (public.is_admin());

create policy "admins delete leads"
  on public.leads for delete
  using (public.is_admin());

-- ---------- Realtime ----------
-- Ensure supabase_realtime publication exists (it does by default).
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end$$;

alter publication supabase_realtime add table public.leads;

-- =============================================================
-- AFTER RUNNING THIS:
-- 1. Authentication → Users → Add user → create your admin account
--    (email + password, "Auto-confirm" enabled).
-- 2. Run in SQL Editor:
--      update public.profiles
--      set role = 'admin'
--      where email = 'your-email@example.com';
-- 3. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local
-- 4. Restart `npm run dev` and log in at /login
-- =============================================================
