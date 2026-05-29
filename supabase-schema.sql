-- Tanuki MVP — Supabase Schema
-- Run this in the Supabase SQL editor

create extension if not exists "pgcrypto";

create table if not exists team_orders (
  id uuid primary key default gen_random_uuid(),
  token text unique not null,
  company_name text not null,
  manager_name text not null,
  manager_email text not null,
  delivery_address text not null,
  delivery_zone text not null,
  delivery_date date not null,
  estimated_people integer not null default 1,
  cutoff_at timestamptz not null,
  status text not null default 'collecting' check (status in ('collecting','ready_to_pay','paid','cancelled')),
  production_status text default 'paid' check (production_status in ('paid','in_production','ready','dispatched','delivered')),
  stripe_session_id text,
  created_at timestamptz not null default now()
);

create table if not exists box_orders (
  id uuid primary key default gen_random_uuid(),
  team_order_id uuid not null references team_orders(id) on delete cascade,
  person_name text not null,
  sando text not null,
  slaw text not null,
  cookie text not null,
  tea text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Unicité prénom (insensible à la casse) par commande
create unique index if not exists box_orders_team_name_unique
  on box_orders (team_order_id, lower(person_name));

-- Enable RLS
alter table team_orders enable row level security;
alter table box_orders enable row level security;

-- Public read by token
create policy "Read team order by token" on team_orders
  for select using (true);

-- Public insert
create policy "Insert team order" on team_orders
  for insert with check (true);

-- Public read box orders
create policy "Read box orders" on box_orders
  for select using (true);

-- Public insert/update box orders
create policy "Insert box order" on box_orders
  for insert with check (true);

create policy "Update box order" on box_orders
  for update using (true);

-- Service role can update team_orders (for payment webhook)
create policy "Service role update team_orders" on team_orders
  for update using (true);
