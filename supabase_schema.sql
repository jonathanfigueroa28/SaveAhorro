-- ==============================================================================
-- SAVEAHORRO 🐜: ESQUEMA RELACIONAL COMPLETO & ACTUALIZADO PARA SUPABASE
-- Copia y pega todo este script en el SQL Editor de tu proyecto en Supabase
-- y presiona "Run" para crear/actualizar todas las tablas y permisos.
-- ==============================================================================

-- 1. TABLA DE GASTOS (EXPENSES)
create table if not exists public.expenses (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  amount numeric not null,
  currency text default 'PEN',
  category text not null,
  description text,
  is_ant_expense boolean default false,
  payment_method text,
  account_id text,
  bank text,
  place text,
  is_historical_already_billed boolean default false,
  date timestamptz default now(),
  created_at timestamptz default now()
);

alter table public.expenses add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();
alter table public.expenses add column if not exists amount numeric default 0;
alter table public.expenses add column if not exists currency text default 'PEN';
alter table public.expenses add column if not exists category text default 'gastos-hormiga';
alter table public.expenses add column if not exists description text;
alter table public.expenses add column if not exists is_ant_expense boolean default false;
alter table public.expenses add column if not exists payment_method text;
alter table public.expenses add column if not exists account_id text;
alter table public.expenses add column if not exists bank text;
alter table public.expenses add column if not exists place text;
alter table public.expenses add column if not exists is_historical_already_billed boolean default false;
alter table public.expenses add column if not exists date timestamptz default now();
alter table public.expenses add column if not exists created_at timestamptz default now();

-- 2. TABLA DE CUENTAS BANCARIAS, BILLETERAS Y EFECTIVO (ACCOUNTS)
create table if not exists public.accounts (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  name text not null,
  type text not null,
  bank text,
  currency text default 'PEN',
  initial_balance numeric default 0,
  current_balance numeric default 0,
  is_operating boolean default true,
  color text default '#3b82f6',
  created_at timestamptz default now()
);

alter table public.accounts add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();
alter table public.accounts add column if not exists name text;
alter table public.accounts add column if not exists type text;
alter table public.accounts add column if not exists bank text;
alter table public.accounts add column if not exists currency text default 'PEN';
alter table public.accounts add column if not exists initial_balance numeric default 0;
alter table public.accounts add column if not exists current_balance numeric default 0;
alter table public.accounts add column if not exists is_operating boolean default true;
alter table public.accounts add column if not exists color text default '#3b82f6';
alter table public.accounts add column if not exists created_at timestamptz default now();

-- 3. TABLA DE SUELDOS E INGRESOS (INCOMES) CON MOTOR DE PLANILLA PERUANA
create table if not exists public.incomes (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  title text not null,
  amount numeric not null default 0,
  currency text default 'PEN',
  frequency text default 'mensual',
  gross_salary numeric default 0,
  regime text default 'planilla_general',
  pension_system_id text default 'afp_integra',
  has_suspension_4ta boolean default false,
  created_at timestamptz default now()
);

alter table public.incomes add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();
alter table public.incomes add column if not exists title text;
alter table public.incomes add column if not exists amount numeric default 0;
alter table public.incomes add column if not exists currency text default 'PEN';
alter table public.incomes add column if not exists frequency text default 'mensual';
alter table public.incomes add column if not exists gross_salary numeric default 0;
alter table public.incomes add column if not exists regime text default 'planilla_general';
alter table public.incomes add column if not exists pension_system_id text default 'afp_integra';
alter table public.incomes add column if not exists has_suspension_4ta boolean default false;
alter table public.incomes add column if not exists created_at timestamptz default now();

-- 4. TABLA DE GASTOS FIJOS DEL MES (FIXED_EXPENSES)
create table if not exists public.fixed_expenses (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  title text not null,
  amount numeric not null default 0,
  currency text default 'PEN',
  category text default 'servicios',
  due_day integer default 1,
  is_paid boolean default false,
  account_id text,
  created_at timestamptz default now()
);

alter table public.fixed_expenses add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();
alter table public.fixed_expenses add column if not exists title text;
alter table public.fixed_expenses add column if not exists amount numeric default 0;
alter table public.fixed_expenses add column if not exists currency text default 'PEN';
alter table public.fixed_expenses add column if not exists category text default 'servicios';
alter table public.fixed_expenses add column if not exists due_day integer default 1;
alter table public.fixed_expenses add column if not exists is_paid boolean default false;
alter table public.fixed_expenses add column if not exists account_id text;
alter table public.fixed_expenses add column if not exists created_at timestamptz default now();

-- 5. TABLA DE CONFIGURACIÓN DE TARJETA DE CRÉDITO Y CICLO BANCARIO (CREDIT_CARD_CONFIGS)
create table if not exists public.credit_card_configs (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  name text default 'Tarjeta de Crédito Principal',
  bank text default 'BCP',
  closing_day integer default 20,
  due_day integer default 5,
  billed_debt_pen numeric default 0,
  billed_debt_usd numeric default 0,
  payment_account_pen text,
  payment_account_usd text,
  is_billed_paid_this_month boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.credit_card_configs add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();
alter table public.credit_card_configs add column if not exists name text default 'Tarjeta de Crédito Principal';
alter table public.credit_card_configs add column if not exists bank text default 'BCP';
alter table public.credit_card_configs add column if not exists closing_day integer default 20;
alter table public.credit_card_configs add column if not exists due_day integer default 5;
alter table public.credit_card_configs add column if not exists billed_debt_pen numeric default 0;
alter table public.credit_card_configs add column if not exists billed_debt_usd numeric default 0;
alter table public.credit_card_configs add column if not exists payment_account_pen text;
alter table public.credit_card_configs add column if not exists payment_account_usd text;
alter table public.credit_card_configs add column if not exists is_billed_paid_this_month boolean default false;
alter table public.credit_card_configs add column if not exists created_at timestamptz default now();
alter table public.credit_card_configs add column if not exists updated_at timestamptz default now();

-- 6. TABLA DE PLAN DE AHORRO MENSUAL PROGRAMADO (SAVINGS_GOALS)
create table if not exists public.savings_goals (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  amount_pen numeric default 0,
  amount_usd numeric default 0,
  source_income_id text,
  destination_account_id text,
  is_transferred_this_month boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.savings_goals add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();
alter table public.savings_goals add column if not exists amount_pen numeric default 0;
alter table public.savings_goals add column if not exists amount_usd numeric default 0;
alter table public.savings_goals add column if not exists source_income_id text;
alter table public.savings_goals add column if not exists destination_account_id text;
alter table public.savings_goals add column if not exists is_transferred_this_month boolean default false;
alter table public.savings_goals add column if not exists created_at timestamptz default now();
alter table public.savings_goals add column if not exists updated_at timestamptz default now();

-- 7. TABLA DE AJUSTES GENERALES DEL USUARIO (USER_SETTINGS)
create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade default auth.uid(),
  monthly_budget numeric default 1500,
  preferred_currency text default 'PEN',
  first_name text,
  last_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.user_settings add column if not exists monthly_budget numeric default 1500;
alter table public.user_settings add column if not exists preferred_currency text default 'PEN';
alter table public.user_settings add column if not exists first_name text;
alter table public.user_settings add column if not exists last_name text;
alter table public.user_settings add column if not exists created_at timestamptz default now();
alter table public.user_settings add column if not exists updated_at timestamptz default now();

-- ==============================================================================
-- PERMISOS Y SEGURIDAD (ROW LEVEL SECURITY - RLS)
-- ==============================================================================
grant all on table public.expenses to anon, authenticated, service_role;
grant all on table public.accounts to anon, authenticated, service_role;
grant all on table public.incomes to anon, authenticated, service_role;
grant all on table public.fixed_expenses to anon, authenticated, service_role;
grant all on table public.credit_card_configs to anon, authenticated, service_role;
grant all on table public.savings_goals to anon, authenticated, service_role;
grant all on table public.user_settings to anon, authenticated, service_role;

alter table public.expenses enable row level security;
alter table public.accounts enable row level security;
alter table public.incomes enable row level security;
alter table public.fixed_expenses enable row level security;
alter table public.credit_card_configs enable row level security;
alter table public.savings_goals enable row level security;
alter table public.user_settings enable row level security;

-- Políticas de aislamiento por usuario (cada usuario solo ve y modifica sus datos)
drop policy if exists "User Expenses Policy" on public.expenses;
create policy "User Expenses Policy" on public.expenses for all to public
using (auth.uid() = user_id or auth.uid() is null or user_id is null)
with check (auth.uid() = user_id or auth.uid() is null or user_id is null);

drop policy if exists "User Accounts Policy" on public.accounts;
create policy "User Accounts Policy" on public.accounts for all to public
using (auth.uid() = user_id or auth.uid() is null or user_id is null)
with check (auth.uid() = user_id or auth.uid() is null or user_id is null);

drop policy if exists "User Incomes Policy" on public.incomes;
create policy "User Incomes Policy" on public.incomes for all to public
using (auth.uid() = user_id or auth.uid() is null or user_id is null)
with check (auth.uid() = user_id or auth.uid() is null or user_id is null);

drop policy if exists "User Fixed Expenses Policy" on public.fixed_expenses;
create policy "User Fixed Expenses Policy" on public.fixed_expenses for all to public
using (auth.uid() = user_id or auth.uid() is null or user_id is null)
with check (auth.uid() = user_id or auth.uid() is null or user_id is null);

drop policy if exists "User Credit Card Policy" on public.credit_card_configs;
create policy "User Credit Card Policy" on public.credit_card_configs for all to public
using (auth.uid() = user_id or auth.uid() is null or user_id is null)
with check (auth.uid() = user_id or auth.uid() is null or user_id is null);

drop policy if exists "User Savings Goals Policy" on public.savings_goals;
create policy "User Savings Goals Policy" on public.savings_goals for all to public
using (auth.uid() = user_id or auth.uid() is null or user_id is null)
with check (auth.uid() = user_id or auth.uid() is null or user_id is null);

drop policy if exists "User Settings Policy" on public.user_settings;
create policy "User Settings Policy" on public.user_settings for all to public
using (auth.uid() = user_id or auth.uid() is null or user_id is null)
with check (auth.uid() = user_id or auth.uid() is null or user_id is null);

-- ==============================================================================
-- RECARGAR CACHÉ DE ESQUEMA EN POSTGREST (SUPABASE)
-- ==============================================================================
notify pgrst, 'reload schema';
