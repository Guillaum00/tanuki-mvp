-- Survey responses table (create if not exists)
create table if not exists survey_responses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),

  -- i18n & completion
  language text default 'EN',
  completed boolean default false,
  wants_tasting boolean default false,

  -- Lead capture
  lead_first_name text,
  lead_last_name text,
  lead_company text,
  lead_email text,
  lead_phone text,

  -- Questions (answer keys, not translated text)
  q1_location text,
  q2_team_size text,
  q3_frequency text,
  q4_decision_maker text,
  q5_order_size text,
  q6_payment_model text,
  q7_payment_methods text[],
  q8_current_services text[],
  q9_budget text,
  q10_frustrations text[],
  q11_reaction text,
  q12_products text[],
  q13_trial_drivers text[],
  q14_tasting text,
  q15_open text
);

-- Add missing columns if table already exists
alter table survey_responses add column if not exists language text default 'EN';
alter table survey_responses add column if not exists completed boolean default false;
alter table survey_responses add column if not exists wants_tasting boolean default false;
alter table survey_responses add column if not exists lead_first_name text;
alter table survey_responses add column if not exists lead_last_name text;
alter table survey_responses add column if not exists lead_company text;
alter table survey_responses add column if not exists lead_email text;
alter table survey_responses add column if not exists lead_phone text;
alter table survey_responses add column if not exists q1_location text;
alter table survey_responses add column if not exists q2_team_size text;
alter table survey_responses add column if not exists q3_frequency text;
alter table survey_responses add column if not exists q4_decision_maker text;
alter table survey_responses add column if not exists q5_order_size text;
alter table survey_responses add column if not exists q6_payment_model text;
alter table survey_responses add column if not exists q7_payment_methods text[];
alter table survey_responses add column if not exists q8_current_services text[];
alter table survey_responses add column if not exists q9_budget text;
alter table survey_responses add column if not exists q10_frustrations text[];
alter table survey_responses add column if not exists q11_reaction text;
alter table survey_responses add column if not exists q12_products text[];
alter table survey_responses add column if not exists q13_trial_drivers text[];
alter table survey_responses add column if not exists q14_tasting text;
alter table survey_responses add column if not exists q15_open text;

-- RLS
alter table survey_responses enable row level security;

drop policy if exists "anon insert survey" on survey_responses;
create policy "anon insert survey" on survey_responses
  for insert to anon with check (true);

-- Service role has full access via supabaseAdmin() — no policy needed for select/update
